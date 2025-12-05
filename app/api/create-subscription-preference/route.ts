import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
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

    // Si no hay token de MercadoPago, retornar modo mock
    if (!MERCADOPAGO_ACCESS_TOKEN) {
      console.log("📦 [MOCK] Creando preferencia de suscripción", { userId, planId });
      return NextResponse.json({
        success: true,
        mock: true,
        init_point: `${APP_URL}/dashboard?payment=mock_success`,
      });
    }

    // Crear preferencia de pago en MercadoPago
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
                title: `Suscripción ${planName} - MicroAgenda`,
                description: "Suscripción mensual al sistema de agendamiento",
                quantity: 1,
                unit_price: planPrice,
                currency_id: "CLP",
              },
            ],
            payer: {
              email: userEmail,
            },
            back_urls: {
              success: `${APP_URL}/dashboard?payment=success`,
              failure: `${APP_URL}/dashboard?payment=failure`,
              pending: `${APP_URL}/dashboard?payment=pending`,
            },
            auto_return: "approved",
            notification_url: `${APP_URL}/api/mercadopago-webhook`,
            external_reference: userId,
            metadata: {
              user_id: userId,
              plan_id: planId,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("MercadoPago API error:", data);
        return NextResponse.json(
          { success: false, error: data },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        init_point: data.init_point,
        preference_id: data.id,
      });
    } catch (error: any) {
      console.error("MercadoPago error:", error);
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

