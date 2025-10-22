import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getPaymentInfo } from "@/lib/mercadopagoClient";

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

    // Si el pago fue aprobado, activar suscripción
    if (payment.status === "approved") {
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
            renewal_date: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
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
