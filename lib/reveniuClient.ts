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
 * Obtiene la URL de checkout de un plan
 * En Reveniu, NO se crean suscripciones por API.
 * El usuario debe completar el checkout en el link_url del plan.
 */
export async function getCheckoutUrl(params: {
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  planPrice: number;
}) {
  if (!REVENIU_API_SECRET) {
    console.log("📦 [MOCK] Obteniendo URL de checkout", params);
    return {
      success: true,
      mock: true,
      init_point: `${APP_URL}/dashboard?payment=mock_success`,
    };
  }

  try {
    // Obtener detalles del plan para obtener el link_url
    const response = await fetch(
      `${REVENIU_API_URL}/api/v1/plans/${params.planId}`,
      {
        method: "GET",
        headers: {
          "Reveniu-Secret-Key": REVENIU_API_SECRET,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Reveniu API error al obtener plan:", data);
      return { success: false, error: data };
    }

    // El link_url del plan es la URL de checkout
    // Agregar parámetros para identificar al usuario
    const checkoutUrl = new URL(data.link_url);
    checkoutUrl.searchParams.set('email', params.userEmail);
    checkoutUrl.searchParams.set('external_id', params.userId);

    console.log("✅ URL de checkout obtenida:", checkoutUrl.toString());
    
    return {
      success: true,
      init_point: checkoutUrl.toString(),
      plan: data,
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

