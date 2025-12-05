const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Solo mostrar warning en desarrollo
if (!MERCADOPAGO_ACCESS_TOKEN && process.env.NODE_ENV === 'development') {
  console.warn(
    "⚠️ MERCADOPAGO_ACCESS_TOKEN no configurado. Los pagos no funcionarán."
  );
}

export async function createSubscriptionPreference(params: {
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  planPrice: number;
}) {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    console.log("📦 [MOCK] Creando preferencia de suscripción", params);
    return {
      success: true,
      mock: true,
      init_point: `${APP_URL}/dashboard?payment=mock_success`,
    };
  }

  try {
    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              title: `MicroAgenda - Plan ${params.planName} (Mensual)`,
              description: "Suscripción mensual al sistema de agendamiento de citas",
              quantity: 1,
              unit_price: params.planPrice,
              currency_id: "CLP",
            },
          ],
          payer: {
            email: params.userEmail,
          },
          back_urls: {
            success: `${APP_URL}/dashboard?payment=success`,
            failure: `${APP_URL}/dashboard?payment=failure`,
            pending: `${APP_URL}/dashboard?payment=pending`,
          },
          auto_return: "approved",
          notification_url: `${APP_URL}/api/mercadopago-webhook`,
          external_reference: params.userId,
          statement_descriptor: "MicroAgenda",
          metadata: {
            user_id: params.userId,
            plan_id: params.planId,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("MercadoPago API error:", data);
      return { success: false, error: data };
    }

    return { success: true, init_point: data.init_point, preference_id: data.id };
  } catch (error) {
    console.error("MercadoPago error:", error);
    return { success: false, error };
  }
}

export async function getPaymentInfo(paymentId: string) {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    console.log("📦 [MOCK] Obteniendo info de pago:", paymentId);
    return {
      success: true,
      mock: true,
      payment: { status: "approved" },
    };
  }

  try {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data };
    }

    return { success: true, payment: data };
  } catch (error) {
    console.error("MercadoPago error:", error);
    return { success: false, error };
  }
}
