import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getPaymentInfo, getSubscriptionInfo } from "@/lib/mercadopagoClient";
import {
  sendEmail,
  getPaymentSuccessEmail,
  getPaymentFailedEmail,
} from "@/lib/resendClient";
import { PLAN_NAME, PLAN_CURRENCY } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log("MercadoPago Webhook received:", { type, data });

    // ============================================
    // 1. WEBHOOK: Suscripción Autorizada
    // ============================================
    if (type === "subscription_preapproval") {
      const subscriptionId = data.id;
      console.log(`📝 Procesando autorización de suscripción: ${subscriptionId}`);

      const subscriptionResult = await getSubscriptionInfo(subscriptionId);

      if (!subscriptionResult.success || !subscriptionResult.subscription) {
        console.error("Error obteniendo info de suscripción:", subscriptionResult.error);
        return NextResponse.json({ error: "Could not fetch subscription info" }, { status: 500 });
      }

      const subscription = subscriptionResult.subscription;

      // Solo procesar si está autorizada
      if (subscription.status !== "authorized") {
        console.log(`Suscripción ${subscriptionId} no autorizada (status: ${subscription.status})`);
        return NextResponse.json({ status: "ignored" }, { status: 200 });
      }

      const userId = subscription.external_reference;
      const planId = subscription.metadata?.plan_id;

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

      // Crear suscripción en la base de datos
      const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { error: subError } = await supabase
        .from("subscriptions")
        .upsert([
          {
            user_id: userId,
            plan_id: planId,
            mercadopago_id: subscriptionId,
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
          const html = getPaymentSuccessEmail({
            userName,
            amount: formatCurrency(subscription.auto_recurring?.transaction_amount || 0, "CLP"),
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
    // 2. WEBHOOK: Cobro Automático Mensual
    // ============================================
    if (type === "subscription_authorized_payment") {
      const paymentId = data.id;
      console.log(`💳 Procesando cobro automático: ${paymentId}`);

      const paymentResult = await getPaymentInfo(paymentId);

      if (!paymentResult.success || !paymentResult.payment) {
        console.error("Error obteniendo info de pago:", paymentResult.error);
        return NextResponse.json({ error: "Could not fetch payment info" }, { status: 500 });
      }

      const payment = paymentResult.payment;
      const userId = payment.external_reference || payment.metadata?.user_id;

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
      const formattedAmount = formatCurrency(payment.transaction_amount || 0, payment.currency_id || "CLP");

      // Si el cobro fue aprobado
      if (payment.status === "approved") {
        const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // Actualizar fecha de renovación de la suscripción
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
            mercadopago_payment_id: paymentId.toString(),
            amount: payment.transaction_amount,
            status: payment.status,
            payment_date: new Date().toISOString(),
          },
        ]);

        console.log(`✅ Cobro automático exitoso para usuario ${userId}`);

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

      // Si el cobro falló
      if (["rejected", "cancelled"].includes(payment.status)) {
        // Registrar el intento fallido
        await supabase.from("payments").insert([
          {
            user_id: userId,
            mercadopago_payment_id: paymentId.toString(),
            amount: payment.transaction_amount,
            status: payment.status,
            payment_date: new Date().toISOString(),
          },
        ]);

        console.log(`⚠️ Cobro automático fallido para usuario ${userId}: ${payment.status}`);

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

      return NextResponse.json({ status: "processed" }, { status: 200 });
    }

    // ============================================
    // 3. WEBHOOK: Pago Único (compatibilidad)
    // ============================================
    if (type === "payment") {
      const paymentId = data.id;

      if (!paymentId) {
        return NextResponse.json({ error: "No payment ID" }, { status: 400 });
      }

      console.log(`💰 Procesando pago único (legacy): ${paymentId}`);

      const paymentResult = await getPaymentInfo(paymentId);

      if (!paymentResult.success || !paymentResult.payment) {
        console.error("Error fetching payment info:", paymentResult.error);
        return NextResponse.json({ error: "Could not fetch payment info" }, { status: 500 });
      }

      const payment = paymentResult.payment;
      const userId = payment.external_reference || payment.metadata?.user_id;
      const planId = payment.metadata?.plan_id;

      if (!userId) {
        console.error("No user ID in payment");
        return NextResponse.json({ error: "No user ID" }, { status: 400 });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, name, email, business_name")
        .eq("id", userId)
        .single();

      const userEmail = profile?.email;
      const userName = profile?.name || profile?.business_name || "Profesional MicroAgenda";
      const planName = payment.metadata?.plan_name || PLAN_NAME;
      const formattedAmount = formatCurrency(
        payment.transaction_amount || 0,
        (payment.currency_id as string) || PLAN_CURRENCY
      );

      if (payment.status === "approved") {
        const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        const { error: subError } = await supabase
          .from("subscriptions")
          .upsert([
            {
              user_id: userId,
              plan_id: planId,
              mercadopago_id: paymentId.toString(),
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

        await supabase
          .from("profiles")
          .update({ subscription_status: "active" })
          .eq("id", userId);

        await supabase.from("payments").insert([
          {
            user_id: userId,
            mercadopago_payment_id: paymentId.toString(),
            amount: payment.transaction_amount,
            status: payment.status,
            payment_date: new Date().toISOString(),
          },
        ]);

        console.log(`✅ Pago único procesado para usuario ${userId}`);

        if (userEmail) {
          try {
            const html = getPaymentSuccessEmail({
              userName,
              amount: formattedAmount,
              planName,
              nextBillingDate: formatDate(new Date(renewalDate)),
            });

            await sendEmail({
              to: userEmail,
              subject: "Pago exitoso - MicroAgenda",
              html,
            });
          } catch (emailError) {
            console.error("Error enviando email:", emailError);
          }
        }
      } else if (["rejected", "cancelled", "refunded", "charged_back"].includes(payment.status)) {
        await supabase.from("payments").insert([
          {
            user_id: userId,
            mercadopago_payment_id: paymentId.toString(),
            amount: payment.transaction_amount,
            status: payment.status,
            payment_date: new Date().toISOString(),
          },
        ]);

        if (userEmail) {
          try {
            const html = getPaymentFailedEmail({
              userName,
              amount: formattedAmount,
              planName,
            });

            await sendEmail({
              to: userEmail,
              subject: "Pago rechazado - MicroAgenda",
              html,
            });
          } catch (emailError) {
            console.error("Error enviando email:", emailError);
          }
        }
      }

      return NextResponse.json({ status: "processed" }, { status: 200 });
    }

    // Tipo de webhook no reconocido
    console.log(`⚠️ Webhook type no manejado: ${type}`);
    return NextResponse.json({ status: "ignored" }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// También soportar GET para verificación de MercadoPago
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
