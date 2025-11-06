"use client";

import { useMemo } from "react";
import { DaySchedule } from "../hooks/useAgendaSnapshot";
import { formatDate } from "@/lib/utils";

interface AgendaPreviewCardProps {
  weekSchedule: DaySchedule[];
  weekStartDate: Date;
  businessName: string | null;
  businessLogoUrl: string | null;
  backgroundUrl: string | null;
  primaryColor: string;
  fontFamily: string;
  bookedEmoji: string;
  footerText: string;
}

export function AgendaPreviewCard({
  weekSchedule,
  weekStartDate,
  businessName,
  businessLogoUrl,
  backgroundUrl,
  primaryColor,
  fontFamily,
  bookedEmoji,
  footerText,
}: AgendaPreviewCardProps) {
  // Formatear fecha de inicio de semana
  const weekTitle = useMemo(() => {
    const start = weekStartDate;
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const startStr = start.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
    const endStr = end.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
    
    return `${startStr} - ${endStr}`;
  }, [weekStartDate]);

  // Formatear horarios para mostrar
  const formatTimeRange = (slots: string[]): string => {
    if (slots.length === 0) return "Sin horarios";
    
    if (slots.length === 1) return slots[0];
    
    // Agrupar horarios consecutivos
    const sorted = [...slots].sort();
    const ranges: string[] = [];
    let start = sorted[0];
    let end = sorted[0];
    
    for (let i = 1; i < sorted.length; i++) {
      const current = sorted[i];
      const [currentHour, currentMin] = current.split(":").map(Number);
      const [endHour, endMin] = end.split(":").map(Number);
      
      // Calcular minutos totales
      const currentMinutes = currentHour * 60 + currentMin;
      const endMinutes = endHour * 60 + endMin;
      
      // Si la diferencia es 30 minutos (un slot), continuar el rango
      if (currentMinutes - endMinutes === 30) {
        end = current;
      } else {
        // Finalizar rango actual
        if (start === end) {
          ranges.push(start);
        } else {
          ranges.push(`${start} - ${end}`);
        }
        start = current;
        end = current;
      }
    }
    
    // Agregar último rango
    if (start === end) {
      ranges.push(start);
    } else {
      ranges.push(`${start} - ${end}`);
    }
    
    return ranges.join(", ");
  };

  return (
    <div
      id="agenda-preview-card"
      className="relative w-[270px] h-[480px] mx-auto rounded-2xl overflow-hidden shadow-2xl"
      style={{
        fontFamily: fontFamily || "Inter, sans-serif",
        backgroundColor: backgroundUrl ? "transparent" : "#ffffff",
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay sutil si hay fondo */}
      {backgroundUrl && (
        <div className="absolute inset-0 bg-black/20" />
      )}
      
      {/* Contenido */}
      <div className="relative z-10 h-full flex flex-col p-6 text-white" style={{ 
        backgroundColor: backgroundUrl ? "rgba(0,0,0,0.3)" : "transparent" 
      }}>
        {/* Header con logo y nombre */}
        <div className="flex items-center gap-3 mb-6">
          {businessLogoUrl && (
            <img
              src={businessLogoUrl}
              alt={businessName || "Negocio"}
              className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
            />
          )}
          <div>
            <h2 className="text-xl font-bold" style={{ color: primaryColor }}>
              {businessName || "Mi Negocio"}
            </h2>
            <p className="text-xs opacity-90">Agenda Semanal</p>
          </div>
        </div>

        {/* Título de la semana */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-1">Semana del {weekTitle}</h3>
          <div className="h-1 w-16 rounded-full" style={{ backgroundColor: primaryColor }} />
        </div>

        {/* Horarios por día */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          {weekSchedule.map((day) => {
            const hasAvailability = day.freeSlots.length > 0;
            const hasBooked = day.bookedSlots.length > 0;
            
            return (
              <div key={day.day} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">{day.dayName}</span>
                  {hasBooked && (
                    <span className="text-xs opacity-75">{bookedEmoji}</span>
                  )}
                </div>
                
                {hasAvailability ? (
                  <div className="text-sm leading-relaxed">
                    <span className="font-medium" style={{ color: primaryColor }}>
                      {formatTimeRange(day.freeSlots)}
                    </span>
                    {hasBooked && (
                      <span className="block text-xs opacity-75 mt-1">
                        Ocupado: {formatTimeRange(day.bookedSlots)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-white/60">
                    {hasBooked ? "Sin horarios disponibles" : "Sin disponibilidad"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer con texto personalizado */}
        {footerText && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-sm text-center font-medium">{footerText}</p>
          </div>
        )}
      </div>
    </div>
  );
}

