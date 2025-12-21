const REVENIU_API_SECRET = process.env.REVENIU_API_SECRET;
const REVENIU_API_URL = process.env.REVENIU_API_URL || "https://integration.reveniu.com";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Solo mostrar warning en desarrollo
if (!REVENIU_API_SECRET && process.env.NODE_ENV === 'development') {
  console.warn(
    "⚠️ REVENIU_API_SECRET no configurado. Los pagos no funcionarán."
  );
}

/**
 * Crea o obtiene un plan de pagos en Reveniu
 * En Reveniu, los planes se crean una vez y se reutilizan para múltiples clientes
 */
export async function getOrCreatePlan(params: {
  planName: string;
  planPrice: number;
  currency?: string;
}) {
  if (!REVENIU_API_SECRET) {
    console.log("📦 [MOCK] Obteniendo/creando plan", params);
    return {
      success: true,
      mock: true,
      planId: "mock-plan-id",
    };
  }

  try {
    // Primero intentar listar planes existentes para ver si ya existe uno con este precio
    const listResponse = await fetch(
      `${REVENIU_API_URL}/api/v1/plans/`,
      {
        method: "GET",
        headers: {
          "Reveniu-Secret-Key": REVENIU_API_SECRET,
          "Content-Type": "application/json",
        },
      }
    );

    if (listResponse.ok) {
      const data = await listResponse.json();
      const plans = data.data || data;
      // Buscar plan existente con el mismo precio y frecuencia mensual (3 = mensual)
      const existingPlan = Array.isArray(plans) 
        ? plans.find((p: any) => 
            p.price === params.planPrice && 
            p.frequency === "3" // 3 = mensual en Reveniu
          )
        : null;

      if (existingPlan) {
        console.log("✅ Plan existente encontrado:", existingPlan.id);
        return {
          success: true,
          planId: existingPlan.id,
          plan: existingPlan,
        };
      }
    }

    // Si no existe, crear un nuevo plan
    const createResponse = await fetch(
      `${REVENIU_API_URL}/api/v1/plans/`,
      {
        method: "POST",
        headers: {
          "Reveniu-Secret-Key": REVENIU_API_SECRET,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: params.planName,
          amount: params.planPrice,
          currency: "1", // 1 = CLP en Reveniu
          frequency: 3, // 3 = mensual en Reveniu
          description: `Plan mensual de MicroAgenda - ${params.planName}`,
          is_custom_link: true,
          auto_renew: true,
        }),
      }
    );

    const data = await createResponse.json();

    if (!createResponse.ok) {
      console.error("Reveniu API error al crear plan:", data);
      return { success: false, error: data };
    }

    console.log("✅ Plan creado en Reveniu:", data.id || data);
    return {
      success: true,
      planId: data.id,
      plan: data,
      link_url: data.link_url, // URL de checkout del plan
    };
  } catch (error) {
    console.error("Reveniu error:", error);
    return { success: false, error };
  }
}

/**
 * Crea una suscripción en Reveniu
 * Suscribe a un cliente a un plan de pagos
 */
export async function createSubscription(params: {
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  planPrice: number;
}) {
  if (!REVENIU_API_SECRET) {
    console.log("📦 [MOCK] Creando suscripción", params);
    return {
      success: true,
      mock: true,
      init_point: `${APP_URL}/dashboard?payment=mock_success`,
      subscription_id: "mock-subscription-id",
    };
  }

  try {
    const response = await fetch(
      `${REVENIU_API_URL}/api/v1/subscriptions/`,
      {
        method: "POST",
        headers: {
          "Reveniu-Secret-Key": REVENIU_API_SECRET,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_id: params.planId,
          email: params.userEmail,
          // external_id para identificar al usuario en webhooks
          external_id: params.userId,
          // URL de retorno después del pago
          redirect_to: `${APP_URL}/dashboard?payment=success`,
          // URL de cancelación
          redirect_to_failure: `${APP_URL}/dashboard?payment=cancelled`,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Reveniu API error al crear suscripción:", data);
      return { success: false, error: data };
    }

    console.log("✅ Suscripción creada en Reveniu:", data.id || data);
    
    // Reveniu retorna link_url con la URL de checkout
    return {
      success: true,
      init_point: data.link_url || data.checkout_url || data.url,
      subscription_id: data.id,
      subscription: data,
    };
  } catch (error) {
    console.error("Reveniu error:", error);
    return { success: false, error };
  }
}

/**
 * Obtiene información de una suscripción
 */
export async function getSubscriptionInfo(subscriptionId: string) {
  if (!REVENIU_API_SECRET) {
    console.log("📦 [MOCK] Obteniendo info de suscripción:", subscriptionId);
    return {
      success: true,
      mock: true,
      subscription: {
        id: subscriptionId,
        status: "active",
        metadata: { user_id: "mock-user-id" },
      },
    };
  }

  try {
    const response = await fetch(
      `${REVENIU_API_URL}/api/v1/subscriptions/${subscriptionId}`,
      {
        method: "GET",
        headers: {
          "Reveniu-Secret-Key": REVENIU_API_SECRET,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data,
        statusCode: response.status,
        isNotFound: response.status === 404,
      };
    }

    return { success: true, subscription: data };
  } catch (error) {
    console.error("Reveniu error:", error);
    return { success: false, error };
  }
}

/**
 * Obtiene información de un pago
 */
export async function getPaymentInfo(paymentId: string) {
  if (!REVENIU_API_SECRET) {
    console.log("📦 [MOCK] Obteniendo info de pago:", paymentId);
    return {
      success: true,
      mock: true,
      payment: { id: paymentId, status: "approved" },
    };
  }

  try {
    const response = await fetch(
      `${REVENIU_API_URL}/api/v1/payments/${paymentId}`,
      {
        method: "GET",
        headers: {
          "Reveniu-Secret-Key": REVENIU_API_SECRET,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data,
        statusCode: response.status,
        isNotFound: response.status === 404,
      };
    }

    return { success: true, payment: data };
  } catch (error) {
    console.error("Reveniu error:", error);
    return { success: false, error };
  }
}

