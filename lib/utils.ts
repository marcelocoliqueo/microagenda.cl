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
