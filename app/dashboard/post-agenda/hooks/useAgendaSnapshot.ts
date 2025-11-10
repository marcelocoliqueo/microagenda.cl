import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { generateAvailableSlots, getDayName } from "@/lib/utils";

export interface DaySchedule {
  day: string;
  dayName: string;
  dayNumber: number;
  availableSlots: string[];
  bookedSlots: string[];
  freeSlots: string[];
}

export function useAgendaSnapshot(userId: string | null) {
  const [availability, setAvailability] = useState<Record<string, Array<{ start: string; end: string }>>>({});
  const [bookedAppointments, setBookedAppointments] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  // Obtener disponibilidad del profesional
  useEffect(() => {
    if (!userId) return;

    async function fetchAvailability() {
      try {
        const { data, error } = await supabase
          .from("availability")
          .select("*")
          .eq("user_id", userId)
          .eq("enabled", true);

        if (error) throw error;

        // Convertir a formato esperado
        const availabilityMap: Record<string, Array<{ start: string; end: string }>> = {};
        
        if (data && data.length > 0) {
          // Agrupar por día de la semana
          data.forEach((item: any) => {
            const dayName = item.day_of_week.toLowerCase();
            if (!availabilityMap[dayName]) {
              availabilityMap[dayName] = [];
            }
            
            // Cada registro en availability es un bloque individual
            // Formato: start_time y end_time en formato TIME (HH:mm:ss)
            if (item.start_time && item.end_time) {
              const start = item.start_time.substring(0, 5); // HH:mm
              const end = item.end_time.substring(0, 5); // HH:mm
              
              // Validar que no esté duplicado
              const exists = availabilityMap[dayName].some(
                block => block.start === start && block.end === end
              );
              
              if (!exists) {
                availabilityMap[dayName].push({ start, end });
              }
            }
          });
        }

        setAvailability(availabilityMap);
      } catch (error: any) {
        console.error("Error fetching availability:", error);
      }
    }

    fetchAvailability();
  }, [userId]);

  // Obtener citas reservadas de la semana actual
  useEffect(() => {
    if (!userId) return;

    async function fetchBookedAppointments() {
      try {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sábado
        endOfWeek.setHours(23, 59, 59, 999);

        const { data, error } = await supabase
          .from("appointments")
          .select("date, time")
          .eq("user_id", userId)
          .in("status", ["pending", "confirmed"])
          .gte("date", startOfWeek.toISOString().split("T")[0])
          .lte("date", endOfWeek.toISOString().split("T")[0]);

        if (error) throw error;

        // Agrupar por fecha
        const bookedMap: Record<string, string[]> = {};
        if (data) {
          data.forEach((apt: any) => {
            const dateStr = apt.date;
            if (!bookedMap[dateStr]) {
              bookedMap[dateStr] = [];
            }
            bookedMap[dateStr].push(apt.time.substring(0, 5)); // HH:mm
          });
        }

        setBookedAppointments(bookedMap);
      } catch (error: any) {
        console.error("Error fetching booked appointments:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookedAppointments();
  }, [userId]);

  // Generar horarios de la semana actual
  const weekSchedule = useMemo(() => {
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    
    const today = new Date();
    const startOfWeek = new Date(today);
    // Calcular lunes de la semana actual (getDay(): 0=domingo, 1=lunes, ..., 6=sábado)
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Si es domingo, retroceder 6 días; si no, calcular diferencia a lunes
    startOfWeek.setDate(today.getDate() + diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const schedule: DaySchedule[] = [];

    days.forEach((dayKey, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      
      const dateStr = date.toISOString().split("T")[0];
      const dayAvailability = availability[dayKey] || [];
      
      // Generar slots disponibles
      const availableSlots = generateAvailableSlots(dayAvailability, 30);
      
      // Obtener slots reservados para esta fecha
      const bookedForDate = bookedAppointments[dateStr] || [];
      
      // Filtrar slots libres
      const freeSlots = availableSlots.filter(slot => !bookedForDate.includes(slot));

      schedule.push({
        day: dateStr,
        dayName: dayNames[index],
        dayNumber: date.getDate(),
        availableSlots,
        bookedSlots: bookedForDate,
        freeSlots,
      });
    });

    return schedule;
  }, [availability, bookedAppointments]);

  // Obtener fecha de inicio de semana para el título
  const weekStartDate = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(today.getDate() + diff);
    return startOfWeek;
  }, []);

  return {
    weekSchedule,
    weekStartDate,
    loading,
  };
}

