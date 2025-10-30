"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SimpleDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  availability?: Record<string, Array<{ start: string; end: string }>>;
  className?: string;
  id?: string;
  name?: string;
}

export function SimpleDatePicker({
  value,
  onChange,
  minDate,
  availability = {},
  className,
  id = "date",
  name = "date",
}: SimpleDatePickerProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const selectedDate = new Date(value + "T00:00:00");
      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const [showCalendar, setShowCalendar] = useState(false);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

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
    setShowCalendar(false);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getDaysInMonth();

  return (
    <div className={cn("relative", className)}>
      {/* Input con botón para abrir calendario */}
      <div className="flex gap-2">
        <input
          id={id}
          name={name}
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          min={minDate}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowCalendar(!showCalendar)}
          className="shrink-0"
        >
          <Calendar className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendario Popup */}
      {showCalendar && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCalendar(false)}
          />
          
          {/* Calendario */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-xl border border-slate-200 p-4 w-[320px]"
          >
            {/* Header del calendario */}
            <div className="flex items-center justify-between mb-4">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={prevMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h3 className="font-semibold text-slate-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={nextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-xs font-medium text-slate-500 text-center py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Días del mes */}
            <div className="grid grid-cols-7 gap-1">
              {days.map(({ date, isCurrentMonth, isSelectable }, index) => {
                const dateStr = date.toISOString().split("T")[0];
                const isToday = dateStr === today.toISOString().split("T")[0];
                const isSelected = value === dateStr;

                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDateSelect(date)}
                    disabled={!isSelectable}
                    className={cn(
                      "h-9 w-9 rounded-md text-sm font-medium transition-colors",
                      !isCurrentMonth && "text-slate-300",
                      isCurrentMonth && !isSelectable && "text-slate-400 cursor-not-allowed bg-slate-100/50",
                      isCurrentMonth && isSelectable && !isSelected && !isToday && "text-slate-700 hover:bg-slate-100",
                      isToday && !isSelected && "bg-primary/10 text-primary font-semibold",
                      isSelected && "bg-primary text-white font-semibold",
                    )}
                    title={
                      !isSelectable
                        ? isCurrentMonth
                          ? "Sin disponibilidad"
                          : "Fuera del mes actual"
                        : undefined
                    }
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Leyenda */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary"></div>
                <span>Seleccionado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-primary/10"></div>
                <span>Hoy</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-100"></div>
                <span>No disponible</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

