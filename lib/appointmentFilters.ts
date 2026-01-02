import { Appointment } from "./supabaseClient";

/**
 * Parsea un string YYYY-MM-DD a un objeto Date en hora local (medianoche)
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export type AppointmentFilter = "today" | "upcoming" | "completed" | "all";

/**
 * Filtra citas según el filtro seleccionado
 */
export function filterAppointments(
  appointments: Appointment[],
  filter: AppointmentFilter
): Appointment[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  // No mostrar citas archivadas en ningún filtro
  const activeAppointments = appointments.filter(
    (apt) => apt.status !== "archived"
  );

  switch (filter) {
    case "today":
      // Solo citas de hoy que no estén canceladas o archivadas
      return activeAppointments
        .filter((apt) => {
          const aptDate = parseLocalDate(apt.date);
          return (
            aptDate.getTime() === today.getTime() &&
            apt.status !== "cancelled"
          );
        })
        .sort((a, b) => {
          // Ordenar por hora
          return a.time.localeCompare(b.time);
        });

    case "upcoming":
      // Citas agendadas a futuro que no estén completadas, canceladas o archivadas
      return activeAppointments
        .filter((apt) => {
          const aptDate = parseLocalDate(apt.date);
          return (
            aptDate >= today &&
            apt.status !== "completed" &&
            apt.status !== "cancelled"
          );
        })
        .sort((a, b) => {
          // Ordenar por fecha y hora
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.time.localeCompare(b.time);
        });

    case "completed":
      // Solo citas completadas
      return activeAppointments
        .filter((apt) => {
          const aptDate = parseLocalDate(apt.date);
          return apt.status === "completed";
        })
        .sort((a, b) => {
          // Ordenar por fecha descendente (más reciente primero)
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare !== 0) return dateCompare;
          return b.time.localeCompare(a.time);
        });

    case "all":
    default:
      // Todas las citas activas (no archivadas)
      return activeAppointments.sort((a, b) => {
        // Ordenar por fecha y hora
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });
  }
}

/**
 * Obtiene el título según el filtro activo
 */
export function getFilterTitle(filter: AppointmentFilter): string {
  switch (filter) {
    case "today":
      return "Citas de Hoy";
    case "upcoming":
      return "Próximas Citas";
    case "completed":
      return "Citas Completadas";
    case "all":
    default:
      return "Todas las Citas";
  }
}

/**
 * Obtiene la descripción según el filtro activo
 */
export function getFilterDescription(filter: AppointmentFilter): string {
  switch (filter) {
    case "today":
      return "Tus citas programadas para el día de hoy";
    case "upcoming":
      return "Tus próximas citas agendadas a futuro";
    case "completed":
      return "Historial de citas finalizadas exitosamente";
    case "all":
    default:
      return "Listado completo de todas tus citas activas";
  }
}
