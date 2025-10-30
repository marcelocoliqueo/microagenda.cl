"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateAvailableSlots, getDayName } from "@/lib/utils";

interface InlineDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  availability?: Record<string, Array<{ start: string; end: string }>>;
  bookedSlots?: string[];
  className?: string;
  selectedTime?: string;
  onTimeSelect?: (time: string) => void;
}

export function InlineDatePicker({
  value,
  onChange,
  minDate,
  availability = {},
  bookedSlots = [],
  className,
  selectedTime,
  onTimeSelect,
}: InlineDatePickerProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const selectedDate = new Date(value + "T00:00:00");
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

  // Obtener horarios disponibles para una fecha
  const getTimeSlotsForDate = (dateStr: string): string[] => {
    if (!dateStr) return [];
    
    const dayName = getDayName(dateStr);
    const dayAvailability = availability[dayName];
    
    if (!dayAvailability || dayAvailability.length === 0) {
      return [];
    }
    
    const availableSlots = generateAvailableSlots(dayAvailability);
    
    // Filtrar horarios ya reservados
    return availableSlots.filter(slot => !bookedSlots.includes(slot));
  };

  // Verificar si un día tiene disponibilidad
  const hasAvailability = (date: Date): boolean => {
    const dayOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][date.getDay()];
    const dayAvail = availability[dayOfWeek];
    return dayAvail && dayAvail.length > 0;
  };

  // Verificar si una fecha es válida para seleccionar
  const isDateSelectable = (date: Date): boolean => {
    const todayStr = today.toISOString().split("T")[0];
    const dateStr = date.toISOString().split("T")[0];
    
    // No permitir fechas pasadas
    if (dateStr < todayStr) return false;
    
    // Si hay minDate, verificar
    if (minDate && dateStr < minDate) return false;
    
    // Verificar disponibilidad
    return hasAvailability(date);
  };

  // Generar días del mes
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{ date: Date; isCurrentMonth: boolean; isSelectable: boolean }> = [];

    // Días del mes anterior (para completar la primera semana)
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date, isCurrentMonth: false, isSelectable: false });
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isSelectable: isDateSelectable(date),
      });
    }

    // Días del mes siguiente (para completar la última semana)
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({ date, isCurrentMonth: false, isSelectable: false });
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    if (!isDateSelectable(date)) return;
    
    const dateStr = date.toISOString().split("T")[0];
    onChange(dateStr);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getDaysInMonth();
  const availableTimeSlots = value ? getTimeSlotsForDate(value) : [];

  return (
    <div className={cn("flex flex-col sm:flex-row gap-4", className)}>
      {/* Calendario */}
      <div className="flex-shrink-0 w-full sm:w-auto">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-4">
          {/* Header del calendario */}
          <div className="flex items-center justify-between mb-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={prevMonth}
              className="h-7 w-7 p-0"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            
            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="h-7 w-7 p-0"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-[10px] sm:text-xs font-medium text-slate-500 text-center py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-0.5">
            {days.map(({ date, isCurrentMonth, isSelectable }, index) => {
              const dateStr = date.toISOString().split("T")[0];
              const isToday = dateStr === today.toISOString().split("T")[0];
              const isSelected = value === dateStr;
              const slotsCount = getTimeSlotsForDate(dateStr).length;

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(date)}
                  disabled={!isSelectable}
                  className={cn(
                    "h-8 w-8 sm:h-9 sm:w-9 rounded-md text-xs sm:text-sm font-medium transition-all relative",
                    !isCurrentMonth && "text-slate-300",
                    isCurrentMonth && !isSelectable && "text-slate-400 cursor-not-allowed bg-slate-100/50",
                    isCurrentMonth && isSelectable && !isSelected && !isToday && "text-slate-700 hover:bg-slate-100",
                    isToday && !isSelected && "bg-primary/10 text-primary font-semibold",
                    isSelected && "bg-primary text-white font-semibold shadow-md",
                  )}
                  title={
                    !isSelectable
                      ? isCurrentMonth
                        ? "Sin disponibilidad"
                        : "Fuera del mes actual"
                      : slotsCount > 0
                      ? `${slotsCount} horario${slotsCount !== 1 ? "s" : ""} disponible${slotsCount !== 1 ? "s" : ""}`
                      : "Sin horarios disponibles"
                  }
                >
                  {date.getDate()}
                  {isSelectable && slotsCount > 0 && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/60"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Leyenda compacta */}
          <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-center gap-3 text-[10px] sm:text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded bg-primary"></div>
              <span>Seleccionado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded bg-primary/10"></div>
              <span>Hoy</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded bg-slate-100"></div>
              <span>No disponible</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel de Horarios */}
      <motion.div
        initial={false}
        animate={{ 
          width: value && availableTimeSlots.length > 0 ? 'auto' : '0',
          opacity: value && availableTimeSlots.length > 0 ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className={cn(
          "overflow-hidden",
          value && availableTimeSlots.length > 0 ? "min-w-[240px] sm:min-w-[280px] sm:max-w-[320px]" : "w-0"
        )}
      >
        {value && availableTimeSlots.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-3 sm:p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Horarios Disponibles</h3>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-1">
              {availableTimeSlots.map((slot) => {
                const isSelected = selectedTime === slot;
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => onTimeSelect?.(slot)}
                    className={cn(
                      "px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all text-center",
                      "hover:bg-primary/10 hover:border-primary/50",
                      isSelected
                        ? "bg-primary text-white border-2 border-primary shadow-md font-semibold"
                        : "bg-slate-50 border border-slate-200 text-slate-700 hover:shadow-sm"
                    )}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
            
            <p className="text-[10px] sm:text-xs text-slate-500 mt-3 sm:mt-4 text-center">
              {availableTimeSlots.length} horario{availableTimeSlots.length !== 1 ? "s" : ""} disponible{availableTimeSlots.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

