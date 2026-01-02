import { NextRequest, NextResponse } from "next/server";
import {
  autoConfirmPendingAppointments,
  autoCompleteConfirmedAppointments,
  autoArchiveCompletedAppointments,
} from "@/lib/appointmentAutoUpdates";

/**
 * API Route para auto-actualizar estados de citas
 * 
 * Ejecuta todas las actualizaciones automáticas:
 * 1. pending → confirmed (después de 2 horas)
 * 2. confirmed → completed (después de que termine la cita)
 * 3. completed → archived (después de 7 días)
 */
export async function POST(request: NextRequest) {
  try {
    // Ejecutar todas las actualizaciones en paralelo
    const [confirmedResult, completedResult, archivedResult] = await Promise.all([
      autoConfirmPendingAppointments(),
      autoCompleteConfirmedAppointments(),
      autoArchiveCompletedAppointments(),
    ]);

    const totalUpdated =
      confirmedResult.updated + completedResult.updated + archivedResult.updated;

    const allErrors = [
      ...confirmedResult.errors,
      ...completedResult.errors,
      ...archivedResult.errors,
    ];

    return NextResponse.json({
      success: true,
      updates: {
        confirmed: confirmedResult.updated,
        completed: completedResult.updated,
        archived: archivedResult.updated,
        total: totalUpdated,
      },
      errors: allErrors,
      debug: completedResult.debug || [],
    });
  } catch (error: any) {
    console.error("Error en auto-update-appointments:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}

