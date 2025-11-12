"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { generateAvailableSlots, getDayName } from "@/lib/utils";

interface SimpleDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  availability?: Record<string, Array<{ start: string; end: string }>>;
  bookedSlots?: string[]; // Nuevo prop para horarios ocupados
  className?: string;
  id?: string;
  name?: string;
  onTimeSelect?: (time: string) => void; // Callback para seleccionar hora
  selectedTime?: string; // Hora seleccionada
  serviceDuration?: number; // Duración del servicio en minutos
  bufferTimeMinutes?: number; // Tiempo de buffer entre citas (default: 0)
}

export function SimpleDatePicker({
  value,
  onChange,
  minDate,
  availability = {},
  bookedSlots = [],
  className,
  id = "date",
  name = "date",
  onTimeSelect,
  selectedTime,
  serviceDuration,
  bufferTimeMinutes = 0,
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
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [calendarPosition, setCalendarPosition] = useState({ top: 0, left: 0 });

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"];

  // Calcular posición del calendario
  useEffect(() => {
    if (showCalendar && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollX = window.scrollX || window.pageXOffset;
      
      // Posicionar debajo del botón o arriba si no hay espacio
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const calendarHeight = 400; // Altura aproximada del calendario
      
      let top = rect.bottom + scrollY + 8;
      if (spaceBelow < calendarHeight && spaceAbove > spaceBelow) {
        top = rect.top + scrollY - calendarHeight - 8;
      }
      
      // Centrar horizontalmente con el botón
      const left = rect.left + scrollX + (rect.width / 2) - 180; // 180px = mitad del ancho del calendario
      
      setCalendarPosition({ top, left });
    }
  }, [showCalendar]);

  // Obtener horarios disponibles para una fecha
  const getTimeSlotsForDate = (dateStr: string): string[] => {
    if (!dateStr) return [];
    
    const dayName = getDayName(dateStr);
    const dayAvailability = availability[dayName];
    
    if (!dayAvailability || dayAvailability.length === 0) {
      return [];
    }
    
    const availableSlots = generateAvailableSlots(dayAvailability, 30, serviceDuration, bufferTimeMinutes);

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
    
    // Mostrar horarios disponibles para esta fecha
    const slots = getTimeSlotsForDate(dateStr);
    if (slots.length > 0) {
      setShowTimeSlots(true);
    } else {
      setShowTimeSlots(false);
      setShowCalendar(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    if (onTimeSelect) {
      onTimeSelect(time);
    }
    setShowCalendar(false);
    setShowTimeSlots(false);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const days = getDaysInMonth();
  const availableTimeSlots = value ? getTimeSlotsForDate(value) : [];

  const calendarContent = (
    <AnimatePresence>
      {showCalendar && (
        <>
          {/* Overlay para cerrar al hacer click fuera */}
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => {
              setShowCalendar(false);
              setShowTimeSlots(false);
            }}
          />
          
          {/* Calendario con horarios */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed z-[101] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
            style={{
              top: `${calendarPosition.top}px`,
              left: `${Math.max(8, calendarPosition.left)}px`,
              width: showTimeSlots && availableTimeSlots.length > 0 ? '640px' : '360px',
              maxWidth: 'calc(100vw - 16px)',
              maxHeight: 'calc(100vh - 16px)',
            }}
          >
            <div className="flex">
              {/* Calendario */}
              <div className="p-5 flex-shrink-0" style={{ width: showTimeSlots && availableTimeSlots.length > 0 ? '360px' : '100%' }}>
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
                  
                  <h3 className="font-semibold text-slate-900 text-base">
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
                      className="text-xs font-medium text-slate-500 text-center py-2"
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
                    const slotsCount = getTimeSlotsForDate(dateStr).length;

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDateSelect(date)}
                        disabled={!isSelectable}
                        className={cn(
                          "h-10 w-10 rounded-lg text-sm font-medium transition-colors relative",
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
                            : slotsCount > 0
                            ? `${slotsCount} horario${slotsCount !== 1 ? "s" : ""} disponible${slotsCount !== 1 ? "s" : ""}`
                            : "Sin horarios disponibles"
                        }
                      >
                        {date.getDate()}
                        {isSelectable && slotsCount > 0 && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary/60"></div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Leyenda */}
                <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-center gap-4 text-xs text-slate-500">
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
              </div>

              {/* Panel de Horarios */}
              {showTimeSlots && availableTimeSlots.length > 0 && value && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="border-l border-slate-200 p-5 bg-slate-50/50 flex-1 overflow-y-auto"
                  style={{ maxHeight: 'calc(100vh - 16px)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <h3 className="font-semibold text-slate-900">Horarios Disponibles</h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTimeSlots(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimeSlots.map((slot) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleTimeSelect(slot)}
                          className={cn(
                            "px-4 py-3 rounded-lg text-sm font-medium transition-all",
                            "hover:bg-primary/10 hover:border-primary/50",
                            isSelected
                              ? "bg-primary text-white border-2 border-primary shadow-md"
                              : "bg-white border border-slate-200 text-slate-700 hover:shadow-sm"
                          )}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-4 text-center">
                    {availableTimeSlots.length} horario{availableTimeSlots.length !== 1 ? "s" : ""} disponible{availableTimeSlots.length !== 1 ? "s" : ""}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className={cn("relative", className)} ref={buttonRef}>
      {/* Input con botón para abrir calendario */}
      <div className="flex gap-2">
        <input
          id={id}
          name={name}
          type="date"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowTimeSlots(false);
          }}
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

      {/* Calendario usando Portal para evitar cortes */}
      {typeof window !== 'undefined' && createPortal(calendarContent, document.body)}
    </div>
  );
}
