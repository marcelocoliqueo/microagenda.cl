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

    // Crear suscripción automática en MercadoPago (API de Preapproval)
    try {
      // Calcular fecha de inicio: ahora + 5 minutos (para evitar problemas de zona horaria)
      const startDate = new Date();
      startDate.setMinutes(startDate.getMinutes() + 5);

      const response = await fetch(
        "https://api.mercadopago.com/preapproval",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: `MicroAgenda - Plan ${planName}`,
            payer_email: userEmail,
            external_reference: userId,
            auto_recurring: {
              frequency: 1,
              frequency_type: "months",
              transaction_amount: planPrice,
              currency_id: "CLP",
              start_date: startDate.toISOString(),
            },
            back_url: `${APP_URL}/dashboard?payment=success`,
            notification_url: `${APP_URL}/api/mercadopago-webhook`,
            status: "pending",
            metadata: {
              user_id: userId,
              plan_id: planId,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ MercadoPago API error:", {
          status: response.status,
          statusText: response.statusText,
          error: data,
          requestBody: {
            reason: `MicroAgenda - Plan ${planName}`,
            payer_email: userEmail,
            external_reference: userId,
            transaction_amount: planPrice,
            currency_id: "CLP",
          }
        });
        return NextResponse.json(
          { success: false, error: data },
          { status: 500 }
        );
      }

      console.log("✅ Suscripción automática creada:", {
        id: data.id,
        init_point: data.init_point,
        status: data.status,
      });
      return NextResponse.json({
        success: true,
        init_point: data.init_point,
        subscription_id: data.id,
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

