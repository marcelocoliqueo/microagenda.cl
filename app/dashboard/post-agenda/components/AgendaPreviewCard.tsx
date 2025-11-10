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
  backgroundColor?: string;
  textColor?: string;
  boxBackgroundColor?: string;
  boxOpacity?: number;
  borderRadius?: number;
  showBusinessName?: boolean;
  instagramHandle?: string;
  monthFontSize?: number;
  titleFontSize?: number;
  dayFontSize?: number;
  slotFontSize?: number;
  monthFontFamily?: string;
  titleFontFamily?: string;
  dayFontFamily?: string;
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
  backgroundColor = "#FFE4E4",
  textColor = "#000000",
  boxBackgroundColor = "#FFFFFF",
  boxOpacity = 95,
  borderRadius = 60,
  showBusinessName = true,
  instagramHandle,
  monthFontSize = 120,
  titleFontSize = 72,
  dayFontSize = 52,
  slotFontSize = 48,
  monthFontFamily = "Cormorant Garamond",
  titleFontFamily = "Montserrat",
  dayFontFamily = "Montserrat",
}: AgendaPreviewCardProps) {
  // Obtener el mes actual
  const currentMonth = useMemo(() => {
    if (monthTitle) return monthTitle;
    return weekStartDate.toLocaleDateString("es-CL", { month: "long" }).toUpperCase();
  }, [weekStartDate, monthTitle]);

  // Verificar si hay disponibilidad en algún día
  const hasAnyAvailability = useMemo(() => {
    return weekSchedule.some(day => day.freeSlots.length > 0);
  }, [weekSchedule]);

  // Mapear nombres de fuentes a familias CSS
  const getFontFamily = (fontName: string) => {
    const fontMap: Record<string, string> = {
      "Cormorant Garamond": "'Cormorant Garamond', serif",
      "Montserrat": "'Montserrat', sans-serif",
      "Dancing Script": "'Dancing Script', cursive",
      "Inter": "'Inter', sans-serif",
      "Playfair Display": "'Playfair Display', serif",
      "Poppins": "'Poppins', sans-serif",
    };
    return fontMap[fontName] || "'Montserrat', sans-serif";
  };

  // Determinar el Instagram handle a mostrar
  const displayInstagramHandle = instagramHandle || businessName?.toLowerCase().replace(/\s+/g, '_') || "";

  return (
    <div
      id="agenda-preview-card"
      className="relative w-[1080px] h-[1920px] mx-auto overflow-hidden"
      style={{
        fontFamily: fontFamily || "'Inter', sans-serif",
        backgroundColor: backgroundUrl ? "transparent" : backgroundColor,
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}CC 100%)`,
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
            className="font-light tracking-[0.3em] text-center"
            style={{
              fontSize: `${monthFontSize}px`,
              color: primaryColor,
              fontFamily: getFontFamily(monthFontFamily),
              letterSpacing: "0.3em",
            }}
          >
            {currentMonth}
          </h1>
        </div>

        {/* Recuadro blanco central */}
        <div
          className="w-[880px] backdrop-blur-sm shadow-2xl p-16"
          style={{
            backgroundColor: `${boxBackgroundColor}${Math.round((boxOpacity / 100) * 255).toString(16).padStart(2, '0')}`,
            borderRadius: `${borderRadius}px`,
            boxShadow: "0 30px 60px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Título "HORAS Disponibles" */}
          <div className="text-center mb-16">
            <div className="flex items-baseline justify-center gap-3">
              <span
                className="font-bold tracking-[0.15em]"
                style={{
                  fontSize: `${titleFontSize}px`,
                  color: primaryColor,
                  fontFamily: getFontFamily(titleFontFamily),
                  letterSpacing: "0.15em",
                }}
              >
                {horasText}
              </span>
              <span
                className="font-light italic"
                style={{
                  fontSize: `${titleFontSize}px`,
                  color: primaryColor,
                  fontFamily: getFontFamily(titleFontFamily),
                }}
              >
                {disponiblesText}
              </span>
            </div>
          </div>

          {/* Horarios por día o mensaje vacío */}
          <div className="space-y-12">
            {!hasAnyAvailability ? (
              // Mensaje cuando no hay disponibilidad configurada
              <div className="text-center py-16">
                <p
                  className="text-[48px] font-light italic mb-8"
                  style={{
                    color: primaryColor,
                    fontFamily: "'Dancing Script', cursive",
                    opacity: 0.7,
                  }}
                >
                  📅
                </p>
                <p
                  className="text-[42px] font-medium tracking-wide"
                  style={{
                    color: primaryColor,
                    fontFamily: "'Montserrat', sans-serif",
                    opacity: 0.8,
                  }}
                >
                  Configura tus horarios
                </p>
                <p
                  className="text-[36px] font-light mt-6"
                  style={{
                    color: primaryColor,
                    fontFamily: "'Montserrat', sans-serif",
                    opacity: 0.6,
                  }}
                >
                  en el panel de Horarios
                </p>
              </div>
            ) : (
              // Mostrar días con disponibilidad
              weekSchedule.map((day) => {
                const hasAvailability = day.freeSlots.length > 0;

                if (!hasAvailability) return null;

                return (
                  <div key={day.day} className="space-y-6">
                    {/* Nombre del día */}
                    <h3
                      className="font-bold tracking-[0.1em] text-center"
                      style={{
                        fontSize: `${dayFontSize}px`,
                        color: primaryColor,
                        fontFamily: getFontFamily(dayFontFamily),
                        letterSpacing: "0.1em",
                      }}
                    >
                      {day.dayName.toUpperCase()} {day.dayNumber}
                    </h3>

                    {/* Horarios en formato píldora */}
                    <div className="flex flex-wrap justify-center gap-6">
                      {day.freeSlots.map((slot, idx) => (
                        <div
                          key={idx}
                          className="px-10 py-4 rounded-full font-medium"
                          style={{
                            fontSize: `${slotFontSize}px`,
                            border: `3px solid ${primaryColor}`,
                            color: primaryColor,
                            fontFamily: getFontFamily(dayFontFamily),
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
              })
            )}
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

        {/* Instagram handle al final (opcional) */}
        {displayInstagramHandle && showBusinessName && (
          <div className="mt-12">
            <p
              className="text-[44px] font-light tracking-wider"
              style={{
                color: primaryColor,
                fontFamily: getFontFamily(dayFontFamily),
              }}
            >
              @{displayInstagramHandle}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

