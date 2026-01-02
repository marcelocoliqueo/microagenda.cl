import { Appointment } from "./supabaseClient";

/**
 * Parsea un string YYYY-MM-DD a un objeto Date en hora local (medianoche)
 */
function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export type AppointmentFilter = "today" | "pending" | "upcoming" | "completed" | "all";

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

    case "pending":
      // Citas que requieren acción inmediata (confirmación)
      return activeAppointments
        .filter((apt) => apt.status === "pending")
        .sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.time.localeCompare(b.time);
        });

    case "upcoming":
      // Citas agendadas a futuro (próximos 7 días para mantenerlo resumido)
      return activeAppointments
        .filter((apt) => {
          const aptDate = parseLocalDate(apt.date);
          return (
            aptDate > today &&
            aptDate < sevenDaysFromNow &&
            apt.status === "confirmed"
          );
        })
        .sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date);
          if (dateCompare !== 0) return dateCompare;
          return a.time.localeCompare(b.time);
        });

    case "completed":
      // Citas finalizadas recientemente
      return activeAppointments
        .filter((apt) => apt.status === "completed")
        .sort((a, b) => {
          const dateCompare = b.date.localeCompare(a.date);
          if (dateCompare !== 0) return dateCompare;
          return b.time.localeCompare(a.time);
        });

    case "all":
    default:
      return activeAppointments.sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.time.localeCompare(a.time);
      });
  }
}

/**
 * Obtiene el título según el filtro activo
 */
export function getFilterTitle(filter: AppointmentFilter): string {
  switch (filter) {
    case "today":
      return "Agenda de Hoy";
    case "pending":
      return "Por Confirmar";
    case "upcoming":
      return "Próximos Días";
    case "completed":
      return "Finalizadas";
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
      return "Lo que tienes para hoy";
    case "pending":
      return "Requieren tu atención";
    case "upcoming":
      return "Vistazo a lo que viene";
    case "completed":
      return "Servicios realizados";
    case "all":
    default:
      return "Listado completo";
  }
}
