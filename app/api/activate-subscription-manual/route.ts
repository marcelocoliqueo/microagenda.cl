import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/**
 * Endpoint temporal para activar suscripción manualmente
 * Solo para debugging - ELIMINAR en producción
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, reveniuSubscriptionId } = await request.json();

    if (!userId || !reveniuSubscriptionId) {
      return NextResponse.json(
        { error: "Faltan parámetros: userId y reveniuSubscriptionId" },
        { status: 400 }
      );
    }

    console.log("🔧 Activando suscripción manualmente:", {
      userId,
      reveniuSubscriptionId,
    });

    // Obtener plan activo
    const { data: plan } = await supabase
      .from("plans")
      .select("id")
      .eq("is_active", true)
      .single();

    if (!plan) {
      return NextResponse.json(
        { error: "No se encontró plan activo" },
        { status: 400 }
      );
    }

    const renewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Crear/actualizar suscripción
    const { error: subError } = await supabase
      .from("subscriptions")
      .upsert(
        [
          {
            user_id: userId,
            plan_id: plan.id,
            reveniu_id: reveniuSubscriptionId,
            status: "active",
            start_date: new Date().toISOString(),
            renewal_date: renewalDate,
            trial: false,
          },
        ],
        {
          onConflict: "user_id",
        }
      );

    if (subError) {
      console.error("Error creando suscripción:", subError);
      return NextResponse.json(
        { error: "Error creando suscripción", details: subError },
        { status: 500 }
      );
    }

    // Actualizar perfil a activo
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ subscription_status: "active" })
      .eq("id", userId);

    if (profileError) {
      console.error("Error actualizando perfil:", profileError);
      return NextResponse.json(
        { error: "Error actualizando perfil", details: profileError },
        { status: 500 }
      );
    }

    console.log(`✅ Suscripción activada manualmente para usuario ${userId}`);

    return NextResponse.json({
      success: true,
      message: "Suscripción activada correctamente",
      subscription: {
        userId,
        reveniuSubscriptionId,
        status: "active",
        renewalDate,
      },
    });
  } catch (error: any) {
    console.error("Error en activate-subscription-manual:", error);
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

