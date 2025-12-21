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
    // 1. WEBHOOK: Suscripción Activada
    // ============================================
    if (event === "subscription_activated") {
      const subscriptionId = data.subscription_id;
      const externalId = data.subscription_external_id;
      console.log(`📝 Procesando suscripción activada: ${subscriptionId}`);

      const subscriptionResult = await getSubscriptionInfo(subscriptionId);

      if (!subscriptionResult.success || !subscriptionResult.subscription) {
        console.error("❌ Error obteniendo info de suscripción:", subscriptionResult.error);
        return NextResponse.json({ status: "processed" }, { status: 200 });
      }

      const subscription = subscriptionResult.subscription;

      const userId = subscription.metadata?.user_id || externalId;
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
    // 2. WEBHOOK: Pago Exitoso (Cobro Recurrente)
    // ============================================
    if (event === "subscription_payment_succeeded") {
      const subscriptionId = data.subscription_id;
      const externalId = data.subscription_external_id;
      const amount = data.amount;
      const buyOrder = data.buy_order;
      const issuedOn = data.issued_on;
      
      console.log(`💳 Procesando pago recurrente exitoso: ${buyOrder} para suscripción ${subscriptionId}`);

      // Obtener suscripción para obtener el user_id
      const subResult = await getSubscriptionInfo(subscriptionId);
      
      let userId: string | null = null;
      if (subResult.success && subResult.subscription) {
        userId = subResult.subscription.metadata?.user_id || externalId;
      } else if (externalId) {
        userId = externalId;
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
      const formattedAmount = formatCurrency(amount || 0, "CLP");

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
          reveniu_payment_id: buyOrder?.toString() || subscriptionId.toString(),
          amount: amount,
          status: "approved",
          payment_date: issuedOn ? new Date(issuedOn).toISOString() : new Date().toISOString(),
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
    // 3. WEBHOOK: Pago en Recuperación (Fallo temporal)
    // ============================================
    if (event === "subscription_payment_in_recovery") {
      const subscriptionId = data.subscription_id;
      const externalId = data.subscription_external_id;
      const buyOrder = data.buy_order;
      const gatewayResponse = data.gateway_response;
      
      console.log(`⚠️ Procesando pago en recuperación: ${buyOrder} para suscripción ${subscriptionId}`);

      // Obtener suscripción para obtener el user_id
      const subResult = await getSubscriptionInfo(subscriptionId);
      
      let userId: string | null = null;
      if (subResult.success && subResult.subscription) {
        userId = subResult.subscription.metadata?.user_id || externalId;
      } else if (externalId) {
        userId = externalId;
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

      // Registrar el intento en recuperación (no enviar email aún, Reveniu está reintentando)
      await supabase.from("payments").insert([
        {
          user_id: userId,
          reveniu_payment_id: buyOrder?.toString() || subscriptionId.toString(),
          amount: 0, // No tenemos el monto en este evento
          status: "in_recovery",
          payment_date: new Date().toISOString(),
        },
      ]);

      console.log(`⚠️ Pago en recuperación registrado para usuario ${userId} (código: ${gatewayResponse})`);

      // No enviar email aún, Reveniu está intentando recuperar el pago
      // Si falla definitivamente, llegará el evento subscription_deactivated

      return NextResponse.json({ status: "processed" }, { status: 200 });
    }

    // ============================================
    // 4. WEBHOOK: Renovación Cancelada
    // ============================================
    if (event === "subscription_renewal_cancelled") {
      const subscriptionId = data.subscription_id;
      const externalId = data.subscription_external_id;
      const cancelledBy = data.cancelled_by; // "user" o "admin"
      const cancelReason = data.cancel_reason;
      
      console.log(`🚫 Procesando cancelación de renovación: ${subscriptionId} (por: ${cancelledBy})`);

      const userId = externalId;

      if (!userId) {
        console.error("No user ID in subscription cancellation");
        return NextResponse.json({ error: "No user ID" }, { status: 400 });
      }

      // Actualizar suscripción a "cancelled" pero mantener activa hasta que expire
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled" })
        .eq("user_id", userId);

      console.log(`✅ Renovación cancelada para usuario ${userId}`);

      return NextResponse.json({ status: "processed" }, { status: 200 });
    }

    // ============================================
    // 5. WEBHOOK: Suscripción Desactivada
    // ============================================
    if (event === "subscription_deactivated") {
      const subscriptionId = data.subscription_id;
      const externalId = data.subscription_external_id;
      console.log(`🚫 Procesando desactivación de suscripción: ${subscriptionId}`);

      const userId = externalId;

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

