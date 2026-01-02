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

/**
 * Convierte una fecha local a formato YYYY-MM-DD sin usar UTC
 * Esto evita problemas de timezone donde una fecha puede cambiar de día
 */
export function formatDateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(date: Date | string): string {
  // Si es un string tipo "YYYY-MM-DD", crear fecha en hora local para evitar problemas de timezone
  let d: Date;
  if (typeof date === "string") {
    const [year, month, day] = date.split('-').map(Number);
    d = new Date(year, month - 1, day);
  } else {
    d = new Date(date);
  }
  
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
 * @param availabilityBlocks - Array de bloques con start y end en formato "HH:mm"
 * @param intervalMinutes - Intervalo entre slots (default: 30 minutos)
 * @param serviceDuration - Duración del servicio en minutos (opcional, para validar que quepa en el bloque)
 * @param bufferTimeMinutes - Tiempo de buffer entre citas (default: 0 minutos)
 * @returns Array de horarios disponibles en formato "HH:mm"
 */
export function generateAvailableSlots(
  availabilityBlocks: Array<{ start: string; end: string }>,
  intervalMinutes: number = 30,
  serviceDuration?: number,
  bufferTimeMinutes: number = 0
): string[] {
  const slots: string[] = [];

  if (!availabilityBlocks || availabilityBlocks.length === 0) {
    console.warn('⚠️ generateAvailableSlots: No hay bloques de disponibilidad');
    return [];
  }

  availabilityBlocks.forEach((block, index) => {
    // Validar formato de tiempo
    if (!block.start || !block.end) {
      console.warn(`⚠️ Bloque ${index} inválido:`, block);
      return;
    }

    const startMatch = block.start.match(/^(\d{1,2}):(\d{2})/);
    const endMatch = block.end.match(/^(\d{1,2}):(\d{2})/);
    
    if (!startMatch || !endMatch) {
      console.warn(`⚠️ Formato de tiempo inválido en bloque ${index}:`, block);
      return;
    }

    const startHour = parseInt(startMatch[1], 10);
    const startMin = parseInt(startMatch[2], 10);
    const endHour = parseInt(endMatch[1], 10);
    const endMin = parseInt(endMatch[2], 10);
    
    // Validar valores
    if (isNaN(startHour) || isNaN(startMin) || isNaN(endHour) || isNaN(endMin)) {
      console.warn(`⚠️ Valores numéricos inválidos en bloque ${index}:`, block);
      return;
    }

    if (startHour < 0 || startHour > 23 || startMin < 0 || startMin > 59 ||
        endHour < 0 || endHour > 23 || endMin < 0 || endMin > 59) {
      console.warn(`⚠️ Valores de hora fuera de rango en bloque ${index}:`, block);
      return;
    }
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime >= endTime) {
      console.warn(`⚠️ Hora de inicio >= hora de fin en bloque ${index}:`, block);
      return;
    }

    // Generar slots desde start hasta end (sin incluir end)
    // Si hay serviceDuration, validar que el slot + duración + buffer no exceda el end
    for (let time = startTime; time < endTime; time += intervalMinutes) {
      // Calcular tiempo total necesario: servicio + buffer
      const totalTimeNeeded = (serviceDuration || 0) + bufferTimeMinutes;

      // Validar que el servicio + buffer quepa en el tiempo restante
      if (totalTimeNeeded > 0 && (time + totalTimeNeeded) > endTime) {
        continue; // Este slot no cabe con la duración del servicio + buffer
      }

      const hours = Math.floor(time / 60);
      const minutes = time % 60;
      const timeString = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      slots.push(timeString);
    }
  });

  // Eliminar duplicados y ordenar
  const uniqueSlots = [...new Set(slots)].sort();
  
  return uniqueSlots;
}

/**
 * Obtiene el nombre del día de la semana en español
 */
export function getDayName(date: Date | string): string {
  let dayOfWeek: number;
  
  if (typeof date === "string") {
    // Parsear manualmente para evitar problemas de zona horaria
    const [year, month, day] = date.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    dayOfWeek = d.getDay();
  } else {
    dayOfWeek = date.getDay();
  }
  
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[dayOfWeek] || "monday";
}

/**
 * Formatea fecha para mostrar de forma amigable
 */
export function formatDateFriendly(date: Date | string): string {
  // Normalizar la fecha a medianoche en hora local para evitar problemas de zona horaria
  let d: Date;
  if (typeof date === "string") {
    // Si es un string tipo "YYYY-MM-DD", crear fecha en hora local
    const [year, month, day] = date.split('-').map(Number);
    d = new Date(year, month - 1, day);
  } else {
    d = new Date(date);
  }
  
  // Normalizar a medianoche en hora local
  d.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.getTime() === today.getTime()) {
    return "Hoy";
  }
  if (d.getTime() === tomorrow.getTime()) {
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
