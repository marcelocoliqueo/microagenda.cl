import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getPaymentInfo } from "@/lib/mercadopagoClient";
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

    console.log("MercadoPago Webhook received:", body);

    // Verificar que sea una notificación de pago
    if (body.type !== "payment") {
      return NextResponse.json({ status: "ignored" }, { status: 200 });
    }

    const paymentId = body.data?.id;

    if (!paymentId) {
      return NextResponse.json(
        { error: "No payment ID" },
        { status: 400 }
      );
    }

    // Obtener información del pago
    const paymentResult = await getPaymentInfo(paymentId);

    if (!paymentResult.success) {
      console.error("Error fetching payment info:", paymentResult.error);
      return NextResponse.json(
        { error: "Could not fetch payment info" },
        { status: 500 }
      );
    }

    const payment = paymentResult.payment;

    // Extraer user_id del external_reference o metadata
    const userId = payment.external_reference || payment.metadata?.user_id;
    const planId = payment.metadata?.plan_id;

    if (!userId) {
      console.error("No user ID in payment");
      return NextResponse.json(
        { error: "No user ID" },
        { status: 400 }
      );
    }

    // Obtener datos del profesional para notificaciones
    const { data: profile, error: profileFetchError } = await supabase
      .from("profiles")
      .select("id, name, email, business_name")
      .eq("id", userId)
      .single();

    if (profileFetchError) {
      console.error("Error fetching profile for payment:", profileFetchError);
    }

    const userEmail = profile?.email;
    const userName =
      profile?.name ||
      profile?.business_name ||
      "Profesional MicroAgenda";
    const planName = payment.metadata?.plan_name || PLAN_NAME;
    const formattedAmount = formatCurrency(
      payment.transaction_amount || 0,
      (payment.currency_id as string) || PLAN_CURRENCY
    );

    // Si el pago fue aprobado, activar suscripción
    if (payment.status === "approved") {
      const renewalDate = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      // Crear o actualizar suscripción
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
          onConflict: "mercadopago_id"
        });

      if (subError) {
        console.error("Error creating subscription:", subError);
      }

      // Actualizar estado de suscripción del perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ subscription_status: "active" })
        .eq("id", userId);

      if (profileError) {
        console.error("Error updating profile:", profileError);
      }

      // Registrar pago
      await supabase.from("payments").insert([
        {
          user_id: userId,
          mercadopago_payment_id: paymentId.toString(),
          amount: payment.transaction_amount,
          status: payment.status,
          payment_date: new Date().toISOString(),
        },
      ]);

      console.log(`✅ Subscription activated for user ${userId}`);

      // Enviar email de confirmación de pago
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
          console.error("Error enviando email de pago exitoso:", emailError);
        }
      }
    } else if (
      ["rejected", "cancelled", "refunded", "charged_back"].includes(payment.status)
    ) {
      // Registrar pago fallido para auditoría
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
          console.error("Error enviando email de pago fallido:", emailError);
        }
      }
    }

    return NextResponse.json({ status: "processed" }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// También soportar GET para verificación de MercadoPago
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
