import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { getOrCreatePlan } from "@/lib/reveniuClient";

const REVENIU_API_SECRET = process.env.REVENIU_API_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    const { userId, userEmail, planId, planName, planPrice } = await request.json();

    if (!userId || !userEmail || !planId || !planName || !planPrice) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos" },
        { status: 400 }
      );
    }

    // Verificar que el usuario esté autenticado usando el token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user || user.id !== userId) {
      console.error("Auth error:", authError, "User:", user?.id, "Expected:", userId);
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // Si no hay API Secret de Reveniu, retornar modo mock
    if (!REVENIU_API_SECRET) {
      console.log("📦 [MOCK] Creando suscripción en Reveniu", { userId, planId });
      return NextResponse.json({
        success: true,
        mock: true,
        init_point: `${APP_URL}/dashboard?payment=mock_success`,
      });
    }

    // Crear suscripción en Reveniu (dos pasos: plan + suscripción)
    try {
      // Paso 1: Obtener o crear el plan de pagos
      const planResult = await getOrCreatePlan({
        planName: planName,
        planPrice: planPrice,
        currency: "CLP",
      });

      if (!planResult.success || !planResult.planId) {
        console.error("❌ Error obteniendo/creando plan:", planResult.error);
        return NextResponse.json(
          { success: false, error: "Error al crear plan de pagos" },
          { status: 500 }
        );
      }

      console.log("✅ Plan obtenido/creado:", {
        id: planResult.planId,
        link_url: planResult.link_url,
      });

      // Paso 2: Preparar URL con datos del usuario (opcional)
      let checkoutUrl = planResult.link_url;
      
      // Agregar parámetros si la URL lo permite
      if (checkoutUrl) {
        try {
          const url = new URL(checkoutUrl);
          url.searchParams.set('email', userEmail);
          url.searchParams.set('external_id', userId);
          checkoutUrl = url.toString();
          console.log("✅ URL de checkout preparada con parámetros de usuario");
        } catch (e) {
          console.log("⚠️ No se pudieron agregar parámetros a la URL");
        }
      }

      return NextResponse.json({
        success: true,
        init_point: checkoutUrl,
        plan_id: planResult.planId,
      });
    } catch (error: any) {
      console.error("Reveniu error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error en create-subscription-preference:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

