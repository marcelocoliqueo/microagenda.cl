import { supabase, type Appointment } from "./supabaseClient";

/**
 * Sistema de auto-actualización de estados de citas
 *
 * Flujo de estados:
 * 1. pending → confirmed (automático después de 2 horas de creación)
 * 2. confirmed → completed (automático después de la hora de finalización)
 * 3. completed → archived (automático después de 7 días)
 */

export type AppointmentStatus =
  | "pending"    // Recién creada, esperando confirmación
  | "confirmed"  // Confirmada y lista
  | "completed"  // Ya ocurrió
  | "cancelled"  // Cancelada por el profesional o cliente
  | "archived"   // Completada hace más de 7 días
  | "no-show";   // Cliente no asistió

export interface AutoUpdateConfig {
  pendingToConfirmedHours: number;  // Horas antes de auto-confirmar (default: 2)
  completedToArchivedDays: number;   // Días antes de archivar (default: 7)
}

const DEFAULT_CONFIG: AutoUpdateConfig = {
  pendingToConfirmedHours: 2,
  completedToArchivedDays: 7,
};

/**
 * Calcula el timestamp de finalización de una cita
 */
function getAppointmentEndTime(appointment: Appointment): Date {
  const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);

  // Si tiene servicio con duración, usar esa duración
  const durationMinutes = appointment.service?.duration || 60;

  const endTime = new Date(appointmentDate.getTime() + durationMinutes * 60000);
  return endTime;
}

/**
 * Auto-actualiza citas pendientes a confirmadas
 * Ejecuta después de X horas de creación
 */
export async function autoConfirmPendingAppointments(
  config: Partial<AutoUpdateConfig> = {}
): Promise<{ updated: number; errors: string[] }> {
  const { pendingToConfirmedHours } = { ...DEFAULT_CONFIG, ...config };
  const errors: string[] = [];

  try {
    // Calcular el timestamp límite
    const thresholdTime = new Date();
    thresholdTime.setHours(thresholdTime.getHours() - pendingToConfirmedHours);

    // Buscar citas pendientes creadas hace más de X horas
    const { data: pendingAppointments, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("status", "pending")
      .lt("created_at", thresholdTime.toISOString());

    if (fetchError) {
      errors.push(`Error fetching pending appointments: ${fetchError.message}`);
      return { updated: 0, errors };
    }

    if (!pendingAppointments || pendingAppointments.length === 0) {
      return { updated: 0, errors };
    }

    // Actualizar a confirmadas
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status: "confirmed" })
      .eq("status", "pending")
      .lt("created_at", thresholdTime.toISOString());

    if (updateError) {
      errors.push(`Error updating to confirmed: ${updateError.message}`);
      return { updated: 0, errors };
    }

    return { updated: pendingAppointments.length, errors };
  } catch (error: any) {
    errors.push(`Unexpected error in autoConfirmPendingAppointments: ${error.message}`);
    return { updated: 0, errors };
  }
}

/**
 * Auto-actualiza citas confirmadas a completadas
 * Ejecuta después de que termine la hora de la cita
 */
export async function autoCompleteConfirmedAppointments(): Promise<{
  updated: number;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    const now = new Date();

    // Buscar citas confirmadas
    const { data: confirmedAppointments, error: fetchError } = await supabase
      .from("appointments")
      .select(`
        *,
        service:services(*)
      `)
      .eq("status", "confirmed");

    if (fetchError) {
      errors.push(`Error fetching confirmed appointments: ${fetchError.message}`);
      return { updated: 0, errors };
    }

    if (!confirmedAppointments || confirmedAppointments.length === 0) {
      return { updated: 0, errors };
    }

    // Filtrar las que ya pasaron
    const appointmentsToComplete = confirmedAppointments.filter((apt) => {
      const endTime = getAppointmentEndTime(apt);
      const shouldComplete = endTime < now;

      // Debug logging
      console.log(`Cita ${apt.id}:`, {
        date: apt.date,
        time: apt.time,
        endTime: endTime.toISOString(),
        now: now.toISOString(),
        shouldComplete,
        hasService: !!apt.service,
        serviceDuration: apt.service?.duration || 'sin servicio'
      });

      return shouldComplete;
    });

    if (appointmentsToComplete.length === 0) {
      return { updated: 0, errors };
    }

    // Actualizar cada una
    const updatePromises = appointmentsToComplete.map((apt) =>
      supabase
        .from("appointments")
        .update({ status: "completed" })
        .eq("id", apt.id)
    );

    const results = await Promise.all(updatePromises);
    const failedUpdates = results.filter((r) => r.error);

    if (failedUpdates.length > 0) {
      failedUpdates.forEach((r) => {
        errors.push(`Error updating appointment: ${r.error?.message}`);
      });
    }

    return {
      updated: appointmentsToComplete.length - failedUpdates.length,
      errors,
    };
  } catch (error: any) {
    errors.push(`Unexpected error in autoCompleteConfirmedAppointments: ${error.message}`);
    return { updated: 0, errors };
  }
}

/**
 * Auto-actualiza citas completadas a archivadas
 * Ejecuta después de X días de completarse
 */
export async function autoArchiveCompletedAppointments(
  config: Partial<AutoUpdateConfig> = {}
): Promise<{ updated: number; errors: string[] }> {
  const { completedToArchivedDays } = { ...DEFAULT_CONFIG, ...config };
  const errors: string[] = [];

  try {
    // Calcular el timestamp límite (X días atrás)
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - completedToArchivedDays);

    // Buscar citas completadas hace más de X días
    // Usando la fecha de la cita, no created_at
    const { data: completedAppointments, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("status", "completed")
      .lt("date", thresholdDate.toISOString().split("T")[0]); // Comparar solo fecha

    if (fetchError) {
      errors.push(`Error fetching completed appointments: ${fetchError.message}`);
      return { updated: 0, errors };
    }

    if (!completedAppointments || completedAppointments.length === 0) {
      return { updated: 0, errors };
    }

    // Actualizar a archivadas
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status: "archived" })
      .eq("status", "completed")
      .lt("date", thresholdDate.toISOString().split("T")[0]);

    if (updateError) {
      errors.push(`Error updating to archived: ${updateError.message}`);
      return { updated: 0, errors };
    }

    return { updated: completedAppointments.length, errors };
  } catch (error: any) {
    errors.push(`Unexpected error in autoArchiveCompletedAppointments: ${error.message}`);
    return { updated: 0, errors };
  }
}

/**
 * Ejecuta todas las auto-actualizaciones
 */
export async function runAllAutoUpdates(
  config: Partial<AutoUpdateConfig> = {}
): Promise<{
  confirmed: number;
  completed: number;
  archived: number;
  errors: string[];
}> {
  const allErrors: string[] = [];

  // Ejecutar todas las actualizaciones en paralelo
  const [confirmedResult, completedResult, archivedResult] = await Promise.all([
    autoConfirmPendingAppointments(config),
    autoCompleteConfirmedAppointments(),
    autoArchiveCompletedAppointments(config),
  ]);

  return {
    confirmed: confirmedResult.updated,
    completed: completedResult.updated,
    archived: archivedResult.updated,
    errors: [
      ...confirmedResult.errors,
      ...completedResult.errors,
      ...archivedResult.errors,
    ],
  };
}
