"use client";

import { useMemo } from "react";
import { Clock, Phone, DollarSign, CheckCircle2, AlertCircle, XCircle, User } from "lucide-react";
import { Appointment } from "@/lib/supabaseClient";
import { formatTime, formatCurrency, STATUS_LABELS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TodayTimelineProps {
  appointments: Appointment[];
  onStatusChange: (appointmentId: string, newStatus: string) => void;
  onDelete: (appointmentId: string) => void;
}

export function TodayTimeline({
  appointments,
  onStatusChange,
  onDelete,
}: TodayTimelineProps) {
  // Ordenar citas por hora
  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments]);

  // Determinar el estado actual basado en la hora
  function getAppointmentState(appointment: Appointment) {
    const now = new Date();
    const [hours, minutes] = appointment.time.split(":").map(Number);
    const appointmentTime = new Date();
    appointmentTime.setHours(hours, minutes, 0, 0);

    const duration = appointment.service?.duration || 60;
    const endTime = new Date(appointmentTime.getTime() + duration * 60000);

    const isPast = now > endTime;
    const isNow = now >= appointmentTime && now <= endTime;
    const isUpcoming = now < appointmentTime;

    return { isPast, isNow, isUpcoming, appointmentTime, endTime };
  }

  // Obtener color según estado y tiempo
  function getStatusColor(appointment: Appointment, state: ReturnType<typeof getAppointmentState>) {
    if (appointment.status === "cancelled") {
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        icon: "text-red-500",
        badge: "bg-red-100 text-red-700",
      };
    }

    if (appointment.status === "completed") {
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-700",
        icon: "text-green-500",
        badge: "bg-green-100 text-green-700",
      };
    }

    if (state.isNow) {
      return {
        bg: "bg-blue-50",
        border: "border-blue-300",
        text: "text-blue-900",
        icon: "text-blue-600",
        badge: "bg-blue-100 text-blue-700",
      };
    }

    if (state.isPast) {
      return {
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-600",
        icon: "text-slate-400",
        badge: "bg-slate-100 text-slate-600",
      };
    }

    if (appointment.status === "pending") {
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-900",
        icon: "text-amber-600",
        badge: "bg-amber-100 text-amber-700",
      };
    }

    return {
      bg: "bg-white",
      border: "border-slate-200",
      text: "text-slate-900",
      icon: "text-primary",
      badge: "bg-primary/10 text-primary",
    };
  }

  // Obtener icono de estado
  function getStatusIcon(appointment: Appointment) {
    if (appointment.status === "completed") return CheckCircle2;
    if (appointment.status === "cancelled") return XCircle;
    if (appointment.status === "pending") return AlertCircle;
    return Clock;
  }

  return (
    <div className="space-y-4">
      {sortedAppointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium mb-2">No tienes citas para hoy</p>
          <p className="text-sm text-slate-500">Disfruta tu día libre</p>
        </div>
      ) : (
        <div className="relative space-y-4">
          {/* Línea de tiempo vertical */}
          <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-primary/30 via-primary/20 to-primary/10" />

          {sortedAppointments.map((appointment, index) => {
            const state = getAppointmentState(appointment);
            const colors = getStatusColor(appointment, state);
            const StatusIcon = getStatusIcon(appointment);

            return (
              <div key={appointment.id} className="relative pl-12">
                {/* Dot indicator */}
                <div
                  className={`
                    absolute left-0 w-10 h-10 rounded-full border-4 border-white shadow-lg
                    flex items-center justify-center z-10
                    ${state.isNow ? "bg-blue-500 animate-pulse" : ""}
                    ${state.isPast && appointment.status !== "completed" ? "bg-slate-300" : ""}
                    ${state.isUpcoming && appointment.status === "pending" ? "bg-amber-400" : ""}
                    ${state.isUpcoming && appointment.status === "confirmed" ? "bg-green-400" : ""}
                    ${appointment.status === "completed" ? "bg-green-500" : ""}
                    ${appointment.status === "cancelled" ? "bg-red-400" : ""}
                  `}
                >
                  <StatusIcon className="w-5 h-5 text-white" />
                </div>

                {/* Card de cita */}
                <div
                  className={`
                    relative rounded-xl p-4 border-2 transition-all duration-200
                    ${colors.bg} ${colors.border}
                    ${state.isNow ? "shadow-xl ring-2 ring-blue-200" : "shadow-md hover:shadow-lg"}
                  `}
                >
                  {/* Hora y estado */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-bold ${colors.text}`}>
                        {formatTime(appointment.time)}
                      </span>
                      {state.isNow && (
                        <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded-full font-semibold animate-pulse">
                          En curso
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${colors.badge}`}>
                      {STATUS_LABELS[appointment.status]}
                    </span>
                  </div>

                  {/* Información del cliente */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <User className={`w-4 h-4 ${colors.icon}`} />
                      <span className={`font-semibold ${colors.text}`}>
                        {appointment.client_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className={`w-4 h-4 ${colors.icon}`} />
                      <span className={`text-sm ${colors.text}`}>
                        {appointment.client_phone}
                      </span>
                    </div>
                  </div>

                  {/* Servicio y precio */}
                  <div className={`p-3 rounded-lg border ${colors.border} ${colors.bg} mb-3`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${colors.text}`}>
                          {appointment.service?.name}
                        </p>
                        <p className={`text-xs ${colors.icon}`}>
                          {appointment.service?.duration} minutos
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className={`w-4 h-4 ${colors.icon}`} />
                        <span className={`font-bold ${colors.text}`}>
                          {formatCurrency(appointment.service?.price || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones rápidas contextuales */}
                  <div className="flex gap-2">
                    {/* Botón de acción principal basado en estado */}
                    {state.isNow && appointment.status !== "completed" && (
                      <Button
                        size="sm"
                        onClick={() => onStatusChange(appointment.id, "completed")}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Marcar Completada
                      </Button>
                    )}

                    {appointment.status === "pending" && state.isUpcoming && (
                      <Button
                        size="sm"
                        onClick={() => onStatusChange(appointment.id, "confirmed")}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Confirmar
                      </Button>
                    )}

                    {/* Selector de estado */}
                    <Select
                      value={appointment.status}
                      onValueChange={(value) => onStatusChange(appointment.id, value)}
                    >
                      <SelectTrigger className="flex-1 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Botón eliminar */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(appointment.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
