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
    console.log("📦 [MOCK] Creando suscripción automática", params);
    return {
      success: true,
      mock: true,
      init_point: `${APP_URL}/dashboard?payment=mock_success`,
    };
  }

  try {
    // Calcular fecha de inicio: ahora + 5 minutos (para evitar problemas de zona horaria)
    const startDate = new Date();
    startDate.setMinutes(startDate.getMinutes() + 5);
    
    // Usar API de Preapproval para suscripciones automáticas
    const response = await fetch(
      "https://api.mercadopago.com/preapproval",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: `MicroAgenda - Plan ${params.planName}`,
          payer_email: params.userEmail,
          external_reference: params.userId,
          auto_recurring: {
            frequency: 1,
            frequency_type: "months",
            transaction_amount: params.planPrice,
            currency_id: "CLP",
            start_date: startDate.toISOString(),
          },
          back_url: `${APP_URL}/dashboard?payment=success`,
          status: "pending",
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

    console.log("✅ Suscripción automática creada:", data.id);
    return { success: true, init_point: data.init_point, subscription_id: data.id };
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

export async function getSubscriptionInfo(subscriptionId: string) {
  if (!MERCADOPAGO_ACCESS_TOKEN) {
    console.log("📦 [MOCK] Obteniendo info de suscripción:", subscriptionId);
    return {
      success: true,
      mock: true,
      subscription: { status: "authorized", external_reference: "mock-user-id" },
    };
  }

  try {
    const response = await fetch(
      `https://api.mercadopago.com/preapproval/${subscriptionId}`,
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

    return { success: true, subscription: data };
  } catch (error) {
    console.error("MercadoPago error:", error);
    return { success: false, error };
  }
}
