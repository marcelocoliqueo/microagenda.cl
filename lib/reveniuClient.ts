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
 * Obtiene el plan de pagos existente en Reveniu
 * IMPORTANTE: El plan debe estar creado previamente en el panel de Reveniu
 * NO crea planes nuevos automáticamente - todos los clientes usan el mismo plan
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
      link_url: `${APP_URL}/dashboard?payment=mock_success`,
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
      // La API de Reveniu puede devolver: { data: { results: [...] } } o { results: [...] }
      const responseData = data.data || data;
      const plans = responseData.results || responseData;
      
      console.log("📋 Respuesta completa de Reveniu:", JSON.stringify(data, null, 2));
      console.log("📋 Array de planes extraído:", JSON.stringify(plans, null, 2));
      console.log("📋 Es un array?:", Array.isArray(plans));
      
      // Buscar plan existente por título (la lista no incluye price)
      const existingPlan = Array.isArray(plans) 
        ? plans.find((p: any) => 
            p.frequency === "3" && // 3 = mensual en Reveniu
            p.title && p.title.includes("MicroAgenda") // Buscar por nombre específico
          )
        : null;

      if (existingPlan) {
        console.log("✅ Plan existente encontrado:", {
          id: existingPlan.id,
          title: existingPlan.title,
          price: existingPlan.price,
          has_link_url: !!existingPlan.link_url,
        });
        
        // Obtener detalles completos del plan para tener link_url
        const detailResponse = await fetch(
          `${REVENIU_API_URL}/api/v1/plans/${existingPlan.id}`,
          {
            method: "GET",
            headers: {
              "Reveniu-Secret-Key": REVENIU_API_SECRET,
            },
          }
        );
        
        if (detailResponse.ok) {
          const planDetail = await detailResponse.json();
          console.log("📦 Detalles del plan obtenidos:", {
            id: planDetail.id,
            title: planDetail.title,
            link_url: planDetail.link_url || "❌ NO DISPONIBLE",
            is_custom_link: planDetail.is_custom_link,
          });
          
          if (!planDetail.link_url) {
            console.error("❌ El plan no tiene link_url. Probablemente no tiene 'Link personalizado' activado en Reveniu.");
            return {
              success: false,
              error: "El plan no tiene link_url configurado. Activa 'Link personalizado' en el panel de Reveniu.",
            };
          }
          
          return {
            success: true,
            planId: planDetail.id,
            link_url: planDetail.link_url,
            plan: planDetail,
          };
        } else {
          console.error("❌ Error obteniendo detalles del plan:", await detailResponse.text());
        }
      } else {
        console.error("❌ No se encontró plan con 'MicroAgenda' en el título y frequency='3'");
      }
    } else {
      console.error("❌ Error listando planes:", await listResponse.text());
    }

    // NO crear planes automáticamente - debe estar creado previamente
    console.error("❌ El plan debe existir previamente en Reveniu");
    console.error("📋 Pasos para solucionar:");
    console.error("1. Ve al panel de Reveniu");
    console.error("2. Crea un plan con:");
    console.error("   - Título: 'Plan Mensual MicroAgenda'");
    console.error("   - Precio: 8500");
    console.error("   - Moneda: CLP");
    console.error("   - Frecuencia: Mensual");
    console.error("   - ✅ Link personalizado activado");
    console.error("   - ✅ Auto renovar activado");
    
    return {
      success: false,
      error: "No se encontró el plan en Reveniu. El plan debe estar creado previamente en el panel de Reveniu con 'Link personalizado' activado.",
    };
  } catch (error) {
    console.error("Reveniu error:", error);
    return { success: false, error };
  }
}

/**
 * Prepara la URL de checkout con parámetros del usuario
 * El link_url ya viene del plan, solo agregamos parámetros
 */
export function prepareCheckoutUrl(linkUrl: string, userId: string, userEmail: string): string {
  try {
    const checkoutUrl = new URL(linkUrl);
    
    // Agregar parámetros para pre-llenar el formulario
    checkoutUrl.searchParams.set('email', userEmail);
    checkoutUrl.searchParams.set('external_id', userId);
    
    return checkoutUrl.toString();
  } catch (error) {
    console.error("Error preparando URL de checkout:", error);
    return linkUrl; // Devolver URL original si falla
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

