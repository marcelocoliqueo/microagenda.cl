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
 * @param availabilityBlocks - Array de bloques con start y end en formato "HH:mm"
 * @param intervalMinutes - Intervalo entre slots (default: 30 minutos)
 * @param serviceDuration - Duración del servicio en minutos (opcional, para validar que quepa en el bloque)
 * @returns Array de horarios disponibles en formato "HH:mm"
 */
export function generateAvailableSlots(
  availabilityBlocks: Array<{ start: string; end: string }>,
  intervalMinutes: number = 30,
  serviceDuration?: number
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

    console.log(`📦 Procesando bloque ${index}: ${block.start} - ${block.end}`);

    // Generar slots desde start hasta end (sin incluir end)
    // Si hay serviceDuration, validar que el slot + duración no exceda el end
    for (let time = startTime; time < endTime; time += intervalMinutes) {
      // Validar que el servicio quepa en el tiempo restante
      if (serviceDuration && (time + serviceDuration) > endTime) {
        console.log(`   ⏭️ Saltando slot ${Math.floor(time/60)}:${time%60} (no cabe servicio de ${serviceDuration}min)`);
        continue; // Este slot no cabe con la duración del servicio
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
  console.log(`📊 Slots únicos generados:`, uniqueSlots);
  
  return uniqueSlots;
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
