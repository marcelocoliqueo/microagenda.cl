import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getPaymentInfo, getSubscriptionInfo } from "@/lib/reveniuClient";
import {
  sendEmail,
  getPaymentSuccessEmail,
  getPaymentFailedEmail,
} from "@/lib/resendClient";
import { PLAN_NAME, PLAN_CURRENCY } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

const REVENIU_WEBHOOK_SECRET = process.env.REVENIU_WEBHOOK_SECRET;

/**
 * Valida el webhook de Reveniu usando el header Reveniu-Secret-Key
 */
function validateWebhook(request: NextRequest): boolean {
  if (!REVENIU_WEBHOOK_SECRET) {
    console.warn("⚠️ REVENIU_WEBHOOK_SECRET no configurado, saltando validación");
    return true; // En desarrollo, permitir sin validación
  }

  const secretKey = request.headers.get("Reveniu-Secret-Key");
  return secretKey === REVENIU_WEBHOOK_SECRET;
}

export async function POST(request: NextRequest) {
  // Responder inmediatamente para evitar timeout
  const startTime = Date.now();

  try {
    // Validar webhook
    if (!validateWebhook(request)) {
      console.error("❌ Webhook inválido: Reveniu-Secret-Key no coincide");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { event, data } = body;

    console.log("Reveniu Webhook received:", { event, data });

    // ============================================
    // 1. WEBHOOK: Suscripción Creada/Activada
    // ============================================
    if (event === "subscription.created" || event === "subscription.activated") {
      const subscriptionId = data.id || data.subscription_id;
      console.log(`📝 Procesando suscripción creada/activada: ${subscriptionId}`);

      const subscriptionResult = await getSubscriptionInfo(subscriptionId);

      if (!subscriptionResult.success || !subscriptionResult.subscription) {
        console.error("❌ Error obteniendo info de suscripción:", subscriptionResult.error);
        return NextResponse.json({ status: "processed" }, { status: 200 });
      }

      const subscription = subscriptionResult.subscription;

      // Solo procesar si está activa
      if (subscription.status !== "active" && subscription.status !== "activated") {
        console.log(`Suscripción ${subscriptionId} no activa (status: ${subscription.status})`);
        return NextResponse.json({ status: "ignored" }, { status: 200 });
      }

      const userId = subscription.metadata?.user_id;
      const planId = subscription.plan_id || subscription.plan?.id;

      if (!userId) {
        console.error("No user ID in subscription");
        return NextResponse.json({ error: "No user ID" }, { status: 400 });
      }

      // Obtener datos del usuario
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, email, business_name")
        .eq("id", userId)
        .single();

      const userEmail = profile?.email;
      const userName = profile?.name || profile?.business_name || "Profesional MicroAgenda";

      // Calcular fecha de renovación (30 días desde ahora)
      const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      // Crear suscripción en la base de datos
      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert([
          {
            user_id: userId,
            plan_id: planId,
            reveniu_id: subscriptionId, // Nuevo campo para Reveniu
            status: "active",
            start_date: new Date().toISOString(),
            renewal_date: renewalDate,
            trial: false,
          },
        ], {
          onConflict: "user_id"
        });

      if (subError) {
        console.error("Error creating subscription:", subError);
      }

      // Actualizar perfil a activo
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ subscription_status: "active" })
        .eq("id", userId);

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }

      console.log(`✅ Suscripción activada para usuario ${userId}`);

      // Enviar email de bienvenida/activación
      if (userEmail) {
        try {
          const amount = subscription.amount || subscription.plan?.amount || 0;
          const html = getPaymentSuccessEmail({
            userName,
            amount: formatCurrency(amount, "CLP"),
            planName: PLAN_NAME,
            nextBillingDate: formatDate(new Date(renewalDate)),
          });

          await sendEmail({
            to: userEmail,
            subject: "¡Suscripción activada! - MicroAgenda",
            html,
          });
        } catch (emailError) {
          console.error("Error enviando email de suscripción activada:", emailError);
        }
      }

      return NextResponse.json({ status: "processed" }, { status: 200 });
    }

    // ============================================
    // 2. WEBHOOK: Pago Exitoso
    // ============================================
    if (event === "payment.success" || event === "payment.completed") {
      const paymentId = data.id || data.payment_id;
      console.log(`💳 Procesando pago exitoso: ${paymentId}`);

      const paymentResult = await getPaymentInfo(paymentId);

      if (!paymentResult.success || !paymentResult.payment) {
        console.error("❌ Error obteniendo info de pago:", paymentResult.error);
        return NextResponse.json({ status: "processed" }, { status: 200 });
      }

      const payment = paymentResult.payment;
      const subscriptionId = payment.subscription_id || data.subscription_id;
      
      // Obtener suscripción para obtener el user_id
      let userId: string | null = null;
      if (subscriptionId) {
        const subResult = await getSubscriptionInfo(subscriptionId);
        if (subResult.success && subResult.subscription) {
          userId = subResult.subscription.metadata?.user_id || null;
        }
      }

      // Fallback: intentar obtener desde metadata del pago
      if (!userId) {
        userId = payment.metadata?.user_id || data.metadata?.user_id || null;
      }

      if (!userId) {
        console.error("No user ID in payment");
        return NextResponse.json({ error: "No user ID" }, { status: 400 });
      }

      // Obtener datos del usuario
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, email, business_name")
        .eq("id", userId)
        .single();

      const userEmail = profile?.email;
      const userName = profile?.name || profile?.business_name || "Profesional MicroAgenda";
      const formattedAmount = formatCurrency(
        payment.amount || payment.transaction_amount || 0,
        payment.currency || "CLP"
      );

      // Actualizar fecha de renovación de la suscripción
      const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { error: updateSubError } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          renewal_date: renewalDate,
        })
        .eq("user_id", userId);

      if (updateSubError) {
        console.error("Error actualizando suscripción:", updateSubError);
      }

      // Asegurarse de que el perfil esté activo
      await supabase
        .from("profiles")
        .update({ subscription_status: "active" })
        .eq("id", userId);

      // Registrar el pago
      await supabase.from("payments").insert([
        {
          user_id: userId,
          reveniu_payment_id: paymentId.toString(), // Nuevo campo para Reveniu
          amount: payment.amount || payment.transaction_amount,
          status: "approved",
          payment_date: new Date().toISOString(),
        },
      ]);

      console.log(`✅ Pago exitoso procesado para usuario ${userId}`);

      // Enviar email de confirmación de renovación
      if (userEmail) {
        try {
          const html = getPaymentSuccessEmail({
            userName,
            amount: formattedAmount,
            planName: PLAN_NAME,
            nextBillingDate: formatDate(new Date(renewalDate)),
          });

          await sendEmail({
            to: userEmail,
            subject: "Renovación exitosa - MicroAgenda",
            html,
          });
        } catch (emailError) {
          console.error("Error enviando email de renovación:", emailError);
        }
      }

      return NextResponse.json({ status: "processed" }, { status: 200 });
    }

    // ============================================
    // 3. WEBHOOK: Pago Fallido
    // ============================================
    if (event === "payment.failed" || event === "payment.rejected") {
      const paymentId = data.id || data.payment_id;
      console.log(`⚠️ Procesando pago fallido: ${paymentId}`);

      const paymentResult = await getPaymentInfo(paymentId);

      if (!paymentResult.success || !paymentResult.payment) {
        console.error("❌ Error obteniendo info de pago:", paymentResult.error);
        return NextResponse.json({ status: "processed" }, { status: 200 });
      }

      const payment = paymentResult.payment;
      const subscriptionId = payment.subscription_id || data.subscription_id;
      
      // Obtener suscripción para obtener el user_id
      let userId: string | null = null;
      if (subscriptionId) {
        const subResult = await getSubscriptionInfo(subscriptionId);
        if (subResult.success && subResult.subscription) {
          userId = subResult.subscription.metadata?.user_id || null;
        }
      }

      if (!userId) {
        userId = payment.metadata?.user_id || data.metadata?.user_id || null;
      }

      if (!userId) {
        console.error("No user ID in payment");
        return NextResponse.json({ error: "No user ID" }, { status: 400 });
      }

      // Obtener datos del usuario
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, email, business_name")
        .eq("id", userId)
        .single();

      const userEmail = profile?.email;
      const userName = profile?.name || profile?.business_name || "Profesional MicroAgenda";
      const formattedAmount = formatCurrency(
        payment.amount || payment.transaction_amount || 0,
        payment.currency || "CLP"
      );

      // Registrar el intento fallido
      await supabase.from("payments").insert([
        {
          user_id: userId,
          reveniu_payment_id: paymentId.toString(),
          amount: payment.amount || payment.transaction_amount,
          status: "rejected",
          payment_date: new Date().toISOString(),
        },
      ]);

      console.log(`⚠️ Pago fallido registrado para usuario ${userId}`);

      // Enviar email de alerta
      if (userEmail) {
        try {
          const html = getPaymentFailedEmail({
            userName,
            amount: formattedAmount,
            planName: PLAN_NAME,
          });

          await sendEmail({
            to: userEmail,
            subject: "Problema con tu renovación - MicroAgenda",
            html,
          });
        } catch (emailError) {
          console.error("Error enviando email de fallo de renovación:", emailError);
        }
      }

      return NextResponse.json({ status: "processed" }, { status: 200 });
    }

    // ============================================
    // 4. WEBHOOK: Suscripción Cancelada
    // ============================================
    if (event === "subscription.cancelled" || event === "subscription.canceled") {
      const subscriptionId = data.id || data.subscription_id;
      console.log(`🚫 Procesando cancelación de suscripción: ${subscriptionId}`);

      const subscriptionResult = await getSubscriptionInfo(subscriptionId);

      if (!subscriptionResult.success || !subscriptionResult.subscription) {
        console.error("❌ Error obteniendo info de suscripción:", subscriptionResult.error);
        return NextResponse.json({ status: "processed" }, { status: 200 });
      }

      const subscription = subscriptionResult.subscription;
      const userId = subscription.metadata?.user_id;

      if (!userId) {
        console.error("No user ID in subscription");
        return NextResponse.json({ error: "No user ID" }, { status: 400 });
      }

      // Actualizar suscripción a cancelada
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("user_id", userId);

      // Actualizar perfil
      await supabase
        .from("profiles")
        .update({ subscription_status: "expired" })
        .eq("id", userId);

      console.log(`✅ Suscripción cancelada para usuario ${userId}`);

      return NextResponse.json({ status: "processed" }, { status: 200 });
    }

    // Tipo de webhook no reconocido
    console.log(`⚠️ Webhook event no manejado: ${event}`);
    return NextResponse.json({ status: "ignored" }, { status: 200 });

  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ Webhook error después de ${processingTime}ms:`, error);
    return NextResponse.json({ status: "processed" }, { status: 200 });
  }
}

// También soportar GET para verificación de Reveniu
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

