import { NextRequest, NextResponse } from "next/server";
import { runAllAutoUpdates } from "@/lib/appointmentAutoUpdates";

/**
 * Endpoint para auto-actualizar estados de citas
 *
 * Este endpoint debe ser llamado por un cron job cada hora.
 *
 * Seguridad:
 * - Usa CRON_SECRET para autenticar requests
 * - Solo permite POST requests
 *
 * Para configurar en Vercel:
 * 1. Agregar CRON_SECRET en variables de entorno
 * 2. Configurar cron job en vercel.json
 */

export async function POST(req: NextRequest) {
  try {
    // Verificar autorización del cron job
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("❌ CRON_SECRET no está configurado");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("❌ Intento de acceso no autorizado al cron job");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Ejecutar todas las auto-actualizaciones
    console.log("🔄 Iniciando auto-actualización de citas...");
    const startTime = Date.now();

    const result = await runAllAutoUpdates();

    const duration = Date.now() - startTime;

    // Log de resultados
    console.log("✅ Auto-actualización completada:", {
      duration: `${duration}ms`,
      confirmed: result.confirmed,
      completed: result.completed,
      archived: result.archived,
      totalUpdated: result.confirmed + result.completed + result.archived,
      errors: result.errors.length,
    });

    if (result.errors.length > 0) {
      console.error("⚠️ Errores durante la actualización:", result.errors);
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration,
      updates: {
        confirmed: result.confirmed,
        completed: result.completed,
        archived: result.archived,
        total: result.confirmed + result.completed + result.archived,
      },
      errors: result.errors,
    });
  } catch (error: any) {
    console.error("❌ Error en cron job de auto-actualización:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Bloquear otros métodos HTTP
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}
