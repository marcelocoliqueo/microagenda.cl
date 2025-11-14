import { NextRequest, NextResponse } from "next/server";
import { runAllAutoUpdates } from "@/lib/appointmentAutoUpdates";

/**
 * Endpoint para auto-actualizar estados de citas desde el cliente
 *
 * Este endpoint puede ser llamado desde el navegador del usuario.
 * Actualiza todas las citas pendientes en la base de datos.
 *
 * No requiere autenticación ya que solo actualiza estados basándose
 * en reglas de negocio (fecha/hora), no modifica datos sensibles.
 */

export async function POST(req: NextRequest) {
  try {
    console.log(`🔄 Auto-actualización iniciada desde cliente`);
    const startTime = Date.now();

    // Ejecutar actualizaciones
    const result = await runAllAutoUpdates();

    const duration = Date.now() - startTime;

    console.log("✅ Auto-actualización completada:", {
      duration: `${duration}ms`,
      confirmed: result.confirmed,
      completed: result.completed,
      archived: result.archived,
      totalUpdated: result.confirmed + result.completed + result.archived,
    });

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
      debug: result.debug, // Logs de debug para investigación
    });
  } catch (error: any) {
    console.error("❌ Error en auto-actualización:", error);
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

// Permitir GET también para facilidad
export async function GET(req: NextRequest) {
  return POST(req);
}
