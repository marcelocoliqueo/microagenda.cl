"use client";

import { useMemo } from "react";
import { DaySchedule } from "../hooks/useAgendaSnapshot";

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
  monthTitle?: string;
  horasText?: string;
  disponiblesText?: string;
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
  monthTitle,
  horasText = "HORAS",
  disponiblesText = "Disponibles",
}: AgendaPreviewCardProps) {
  // Obtener el mes actual
  const currentMonth = useMemo(() => {
    if (monthTitle) return monthTitle;
    return weekStartDate.toLocaleDateString("es-CL", { month: "long" }).toUpperCase();
  }, [weekStartDate, monthTitle]);

  return (
    <div
      id="agenda-preview-card"
      className="relative w-[1080px] h-[1920px] mx-auto overflow-hidden"
      style={{
        fontFamily: fontFamily || "'Inter', sans-serif",
        backgroundColor: backgroundUrl ? "transparent" : "#FFE4E4",
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : "linear-gradient(135deg, #FFE4E4 0%, #FFC9C9 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Contenido principal */}
      <div className="relative z-10 h-full flex flex-col items-center justify-start px-16 py-24">

        {/* Mes en la parte superior */}
        <div className="mb-12">
          <h1
            className="text-[120px] font-light tracking-[0.3em] text-center"
            style={{
              color: primaryColor,
              fontFamily: "'Cormorant Garamond', serif",
              letterSpacing: "0.3em",
            }}
          >
            {currentMonth}
          </h1>
        </div>

        {/* Recuadro blanco central */}
        <div
          className="w-[880px] bg-white/95 backdrop-blur-sm rounded-[60px] shadow-2xl p-16"
          style={{
            boxShadow: "0 30px 60px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Título "HORAS Disponibles" */}
          <div className="text-center mb-16">
            <div className="flex items-baseline justify-center gap-3">
              <span
                className="text-[72px] font-bold tracking-[0.15em]"
                style={{
                  color: primaryColor,
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: "0.15em",
                }}
              >
                {horasText}
              </span>
              <span
                className="text-[72px] font-light italic"
                style={{
                  color: primaryColor,
                  fontFamily: "'Dancing Script', cursive",
                }}
              >
                {disponiblesText}
              </span>
            </div>
          </div>

          {/* Horarios por día */}
          <div className="space-y-12">
            {weekSchedule.map((day) => {
              const hasAvailability = day.freeSlots.length > 0;

              if (!hasAvailability) return null;

              return (
                <div key={day.day} className="space-y-6">
                  {/* Nombre del día */}
                  <h3
                    className="text-[52px] font-bold tracking-[0.1em] text-center"
                    style={{
                      color: primaryColor,
                      fontFamily: "'Montserrat', sans-serif",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {day.dayName.toUpperCase()} {day.day}
                  </h3>

                  {/* Horarios en formato píldora */}
                  <div className="flex flex-wrap justify-center gap-6">
                    {day.freeSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className="px-10 py-4 rounded-full text-[48px] font-medium"
                        style={{
                          border: `3px solid ${primaryColor}`,
                          color: primaryColor,
                          fontFamily: "'Montserrat', sans-serif",
                        }}
                      >
                        {slot}
                      </div>
                    ))}
                  </div>

                  {/* Separador */}
                  {weekSchedule.indexOf(day) < weekSchedule.filter(d => d.freeSlots.length > 0).length - 1 && (
                    <div
                      className="h-[2px] w-full mx-auto mt-8"
                      style={{
                        background: `linear-gradient(to right, transparent, ${primaryColor}40, transparent)`
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Texto final dentro del recuadro */}
          {footerText && (
            <div className="mt-16 pt-12">
              <p
                className="text-[40px] text-center font-light tracking-wide"
                style={{
                  color: primaryColor,
                  fontFamily: "'Montserrat', sans-serif",
                  opacity: 0.8,
                }}
              >
                {footerText}
              </p>
            </div>
          )}
        </div>

        {/* Instagram handle o logo al final (opcional) */}
        {businessName && (
          <div className="mt-12">
            <p
              className="text-[44px] font-light tracking-wider"
              style={{
                color: primaryColor,
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              @{businessName.toLowerCase().replace(/\s+/g, '_')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

