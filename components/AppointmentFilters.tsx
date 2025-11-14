"use client";

import { useMemo } from "react";
import { Calendar, Clock, CheckCircle, ListFilter } from "lucide-react";
import { Appointment } from "@/lib/supabaseClient";
import { useTheme } from "@/contexts/ThemeContext";

export type AppointmentFilter = "today" | "upcoming" | "completed" | "all";

interface AppointmentFiltersProps {
  appointments: Appointment[];
  activeFilter: AppointmentFilter;
  onFilterChange: (filter: AppointmentFilter) => void;
}

export function AppointmentFilters({
  appointments,
  activeFilter,
  onFilterChange,
}: AppointmentFiltersProps) {
  const { brandColor } = useTheme();

  // Calcular contadores para cada filtro
  const counts = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(today);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return {
      today: appointments.filter((apt) => {
        const aptDate = new Date(apt.date);
        return (
          aptDate >= today &&
          aptDate < todayEnd &&
          apt.status !== "archived" &&
          apt.status !== "cancelled"
        );
      }).length,
      upcoming: appointments.filter((apt) => {
        const aptDate = new Date(apt.date);
        return (
          aptDate >= today &&
          aptDate < sevenDaysFromNow &&
          apt.status !== "completed" &&
          apt.status !== "archived" &&
          apt.status !== "cancelled"
        );
      }).length,
      completed: appointments.filter(
        (apt) =>
          apt.status === "completed"
      ).length,
      all: appointments.filter(
        (apt) => apt.status !== "archived"
      ).length,
    };
  }, [appointments]);

  const filters: Array<{
    id: AppointmentFilter;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count: number;
    description: string;
  }> = [
    {
      id: "today",
      label: "Hoy",
      icon: Clock,
      count: counts.today,
      description: "Citas de hoy",
    },
    {
      id: "upcoming",
      label: "Próximas",
      icon: Calendar,
      count: counts.upcoming,
      description: "Próximos 7 días",
    },
    {
      id: "completed",
      label: "Completadas",
      icon: CheckCircle,
      count: counts.completed,
      description: "Últimos 7 días",
    },
    {
      id: "all",
      label: "Todas",
      icon: ListFilter,
      count: counts.all,
      description: "Todas las citas activas",
    },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full mb-6">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = activeFilter === filter.id;

        return (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            style={
              isActive
                ? {
                    background: `linear-gradient(to right, ${brandColor.primary}, ${brandColor.accent})`,
                  }
                : {}
            }
            className={`
              flex-1 relative overflow-hidden rounded-xl px-4 py-3 transition-all duration-200
              ${
                isActive
                  ? "text-white shadow-lg scale-[1.02]"
                  : "bg-white/70 backdrop-blur-sm border-2 border-slate-200 hover:bg-slate-50"
              }
            `}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = `${brandColor.primary}66`;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = "";
              }
            }}
          >
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span style={{ color: isActive ? "white" : brandColor.primary }}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                </span>
                <div className="text-left flex-1 min-w-0">
                  <div
                    className={`font-semibold text-sm sm:text-base truncate ${
                      isActive ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {filter.label}
                  </div>
                  <div
                    className={`text-[10px] sm:text-xs truncate ${
                      isActive ? "text-white/90" : "text-slate-500"
                    }`}
                  >
                    {filter.description}
                  </div>
                </div>
              </div>
              <div
                className="flex items-center justify-center min-w-[24px] sm:min-w-[28px] h-6 sm:h-7 px-2 rounded-full text-xs sm:text-sm font-bold tabular-nums"
                style={
                  isActive
                    ? { backgroundColor: "rgba(255, 255, 255, 0.2)", color: "white" }
                    : {
                        backgroundColor: `${brandColor.primary}1A`,
                        color: brandColor.primary,
                      }
                }
              >
                {filter.count}
              </div>
            </div>

            {/* Efecto de brillo en hover */}
            {!isActive && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-transparent group-hover:via-white/10 transition-all duration-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
