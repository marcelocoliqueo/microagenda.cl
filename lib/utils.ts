import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "CLP"): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  return `${hours}:${minutes}`;
}

export function generateTimeSlots(
  startHour: number = 9,
  endHour: number = 19,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += intervalMinutes) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      slots.push(timeString);
    }
  }
  return slots;
}

/**
 * Genera horarios disponibles basados en bloques de disponibilidad configurados
 */
export function generateAvailableSlots(
  availabilityBlocks: Array<{ start: string; end: string }>,
  intervalMinutes: number = 30
): string[] {
  const slots: string[] = [];

  availabilityBlocks.forEach((block) => {
    const [startHour, startMin] = block.start.split(":").map(Number);
    const [endHour, endMin] = block.end.split(":").map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    for (let time = startTime; time < endTime; time += intervalMinutes) {
      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const timeString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      slots.push(timeString);
    }
  });

  // Eliminar duplicados y ordenar
  return [...new Set(slots)].sort();
}

/**
 * Obtiene el nombre del día de la semana en español
 */
export function getDayName(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date + "T00:00:00") : date;
  const dayOfWeek = d.getDay();
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[dayOfWeek] || "monday";
}

/**
 * Formatea fecha para mostrar de forma amigable
 */
export function formatDateFriendly(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) {
    return "Hoy";
  }
  if (d.toDateString() === tomorrow.toDateString()) {
    return "Mañana";
  }

  return formatDate(d);
}

export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters and add +56 for Chile if needed
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("56")) {
    return `+${digits}`;
  }
  if (digits.startsWith("9") && digits.length === 9) {
    return `+56${digits}`;
  }
  return `+56${digits}`;
}
