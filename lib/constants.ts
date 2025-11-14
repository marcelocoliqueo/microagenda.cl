// Updated for MicroAgenda MVP Final
export const APP_NAME = "MicroAgenda";
export const APP_SLOGAN = "Tu agenda simple, cercana y profesional";
export const APP_DESCRIPTION =
  "Automatiza tus reservas sin perder cercanía - Sistema de agendamiento para profesionales independientes";
export const SUPPORT_EMAIL = "soporte@microagenda.cl";

export const PLAN_PRICE = 8500;
export const PLAN_CURRENCY = "CLP";
export const PLAN_NAME = "Único";

export const APPOINTMENT_STATUSES = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
} as const;

export const SUBSCRIPTION_STATUSES = {
  TRIAL: "trial",
  ACTIVE: "active",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  completed: "Completada",
  trial: "Prueba",
  active: "Activa",
  expired: "Expirada",
};

export const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
  trial: "bg-blue-100 text-blue-800",
  active: "bg-green-100 text-green-800",
  expired: "bg-red-100 text-red-800",
};

// Re-export utility functions from utils.ts
export { formatCurrency, formatDate, formatTime } from "./utils";
