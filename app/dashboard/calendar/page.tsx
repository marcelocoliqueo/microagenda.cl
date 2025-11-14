"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { formatTime, STATUS_LABELS } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";

type Appointment = {
  id: string;
  date: string;
  time: string;
  status: string;
  client_name: string;
  client_phone: string;
  service: {
    name: string;
    duration: number;
    price: number;
  }[] | null;
};

export default function CalendarPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { brandColor } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMonthAppointments();
    }
  }, [user, currentDate]);

  async function checkAuth() {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
    } else {
      setUser(user);
    }
  }

  async function fetchMonthAppointments() {
    try {
      setLoading(true);

      // Get first and last day of the month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const startDate = firstDay.toISOString().split("T")[0];
      const endDate = lastDay.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          date,
          time,
          status,
          client_name,
          client_phone,
          service:services(name, duration, price)
        `)
        .eq("user_id", user.id)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("time", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      console.error("Error fetching appointments:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function getDaysInMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  }

  function getAppointmentsForDate(date: number) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateString = new Date(year, month, date).toISOString().split("T")[0];
    return appointments.filter((apt) => apt.date === dateString);
  }

  function goToPreviousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  }

  function goToNextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  }

  function goToToday() {
    setCurrentDate(new Date());
    setSelectedDate(null);
  }

  function handleDateClick(date: number) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateString = new Date(year, month, date).toISOString().split("T")[0];
    setSelectedDate(selectedDate === dateString ? null : dateString);
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-3 h-3 text-red-600" />;
      case "pending":
        return <AlertCircle className="w-3 h-3 text-amber-600" />;
      case "confirmed":
        return <CheckCircle className="w-3 h-3 text-blue-600" />;
      default:
        return <Clock className="w-3 h-3 text-slate-600" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-300";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const monthName = currentDate.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const selectedDateAppointments = selectedDate
    ? appointments.filter((apt) => apt.date === selectedDate)
    : [];

  const today = new Date().toISOString().split("T")[0];

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <span style={{ color: brandColor.primary }}>
              <CalendarDays className="w-8 h-8" />
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
              Calendario de Citas
            </h1>
          </div>
          <p className="text-slate-600">Vista mensual de todas tus citas</p>
        </motion.div>

        {/* Calendar Controls */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6 mb-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-slate-900 capitalize">
              {monthName}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="font-medium hover:bg-opacity-10"
                style={{
                  borderColor: brandColor.primary,
                  color: brandColor.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${brandColor.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                Hoy
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousMonth}
                style={{
                  borderColor: brandColor.primary,
                  color: brandColor.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${brandColor.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToNextMonth}
                style={{
                  borderColor: brandColor.primary,
                  color: brandColor.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${brandColor.primary}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm border-2 border-slate-200 p-4 md:p-6"
          >
            {/* Day names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-slate-600 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {/* Empty cells for days before month starts */}
              {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Days of the month */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const date = index + 1;
                const dayAppointments = getAppointmentsForDate(date);
                const dateString = new Date(
                  currentDate.getFullYear(),
                  currentDate.getMonth(),
                  date
                ).toISOString().split("T")[0];
                const isToday = dateString === today;
                const isSelected = dateString === selectedDate;

                return (
                  <motion.button
                    key={date}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDateClick(date)}
                    style={{
                      borderColor: isToday ? brandColor.primary : undefined,
                      backgroundColor: isToday ? `${brandColor.primary}10` : isSelected ? `${brandColor.primary}20` : undefined,
                      boxShadow: isSelected ? `0 0 0 2px ${brandColor.primary}` : undefined,
                    }}
                    className={`
                      aspect-square rounded-lg border-2 p-1 md:p-2 transition-all
                      ${!isToday ? "border-slate-200" : ""}
                      ${dayAppointments.length > 0 ? "hover:shadow-md" : "hover:bg-slate-50"}
                    `}
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      {date}
                    </div>
                    {dayAppointments.length > 0 && (
                      <div className="mt-1 space-y-1">
                        {dayAppointments.slice(0, 2).map((apt) => (
                          <div
                            key={apt.id}
                            className={`text-[8px] md:text-[10px] px-1 py-0.5 rounded border ${getStatusColor(apt.status)}`}
                          >
                            {formatTime(apt.time)}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-[8px] md:text-[10px] text-slate-500 font-medium">
                            +{dayAppointments.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Selected Date Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {selectedDate
                ? `Citas del ${new Date(selectedDate + "T00:00:00").toLocaleDateString("es-CL", {
                    day: "numeric",
                    month: "long",
                  })}`
                : "Selecciona una fecha"}
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div
                  className="w-8 h-8 border-4 rounded-full animate-spin mx-auto"
                  style={{
                    borderColor: `${brandColor.primary}20`,
                    borderTopColor: brandColor.primary
                  }}
                ></div>
                <p className="text-sm text-slate-500 mt-2">Cargando...</p>
              </div>
            ) : selectedDate ? (
              selectedDateAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No hay citas este día</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {selectedDateAppointments.map((apt) => (
                    <motion.div
                      key={apt.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border-2 ${getStatusColor(apt.status)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(apt.status)}
                          <span className="font-semibold text-sm">
                            {STATUS_LABELS[apt.status] || apt.status}
                          </span>
                        </div>
                        <span className="text-sm font-bold">
                          {formatTime(apt.time)}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-3 h-3" />
                          <span className="font-medium">{apt.client_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3" />
                          <span>{apt.client_phone}</span>
                        </div>
                        {apt.service && apt.service[0] && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-3 h-3" />
                            <span>
                              {apt.service[0].name} ({apt.service[0].duration} min)
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-8">
                <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">
                  Haz clic en una fecha para ver sus citas
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Total",
              count: appointments.length,
              color: "bg-slate-100 text-slate-700",
            },
            {
              label: "Confirmadas",
              count: appointments.filter((a) => a.status === "confirmed").length,
              color: "bg-blue-100 text-blue-700",
            },
            {
              label: "Completadas",
              count: appointments.filter((a) => a.status === "completed").length,
              color: "bg-green-100 text-green-700",
            },
            {
              label: "Canceladas",
              count: appointments.filter((a) => a.status === "cancelled").length,
              color: "bg-red-100 text-red-700",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.color} rounded-lg p-4 border-2 border-opacity-20`}
            >
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
