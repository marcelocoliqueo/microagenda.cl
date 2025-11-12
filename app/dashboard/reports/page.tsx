"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { formatCurrency, formatDate, formatTime, APPOINTMENT_STATUSES } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Stats = {
  totalAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  totalRevenue: number;
  avgRevenuePerAppointment: number;
  conversionRate: number;
  topService: { name: string; count: number } | null;
  peakHour: { hour: string; count: number } | null;
  peakDay: { day: string; count: number } | null;
  recentAppointments: any[];
  dailyStats: { date: string; appointments: number; revenue: number }[];
  serviceBreakdown: { name: string; value: number }[];
  statusBreakdown: { name: string; value: number; color: string }[];
  growth: {
    appointments: number;
    revenue: number;
  };
};

export default function ReportsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { brandColor } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"week" | "month" | "year" | "all">("month");

  // Helper para convertir hex a rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Helper para mostrar el indicador de crecimiento
  const GrowthIndicator = ({ value }: { value: number }) => {
    if (value === 0) {
      return (
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <Minus className="w-3 h-3" />
          Sin cambios
        </span>
      );
    }
    const isPositive = value > 0;
    return (
      <span className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchStats(user.id);
    }
  }, [period, user]);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);
      await fetchStats(session.user.id);
    } catch (error: any) {
      console.error("Auth check error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats(userId: string) {
    try {
      // Calcular fecha de inicio según el período seleccionado
      let startDate = null;
      const now = new Date();

      if (period === "week") {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (period === "month") {
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (period === "year") {
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      }
      // Si period === "all", startDate permanece null y no filtramos

      let query = supabase
        .from("appointments")
        .select(`
          *,
          service:services(*)
        `)
        .eq("user_id", userId);

      // Aplicar filtro de fecha si hay período específico
      if (startDate) {
        query = query.gte("date", startDate.toISOString().split('T')[0]);
      }

      const { data: appointments, error } = await query;

      if (error) throw error;

      if (!appointments) {
        setStats({
          totalAppointments: 0,
          confirmedAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          pendingAppointments: 0,
          totalRevenue: 0,
          avgRevenuePerAppointment: 0,
          conversionRate: 0,
          topService: null,
          peakHour: null,
          peakDay: null,
          recentAppointments: [],
          dailyStats: [],
          serviceBreakdown: [],
          statusBreakdown: [],
          growth: { appointments: 0, revenue: 0 },
        });
        return;
      }

      // Calculate stats
      const total = appointments.length;
      const confirmed = appointments.filter(a => a.status === APPOINTMENT_STATUSES.CONFIRMED).length;
      const completed = appointments.filter(a => a.status === APPOINTMENT_STATUSES.COMPLETED).length;
      const cancelled = appointments.filter(a => a.status === APPOINTMENT_STATUSES.CANCELLED).length;
      const pending = appointments.filter(a => a.status === APPOINTMENT_STATUSES.PENDING).length;

      const revenue = appointments
        .filter(a => a.status === APPOINTMENT_STATUSES.COMPLETED && a.service)
        .reduce((sum, a) => sum + (a.service?.price || 0), 0);

      const avgRevenue = completed > 0 ? revenue / completed : 0;
      const conversionRate = total > 0 ? (confirmed / total) * 100 : 0;

      // Top service
      const serviceCounts = new Map<string, number>();
      appointments.forEach(apt => {
        if (apt.service) {
          const count = serviceCounts.get(apt.service.name) || 0;
          serviceCounts.set(apt.service.name, count + 1);
        }
      });
      
      let topService = null;
      if (serviceCounts.size > 0) {
        const [name, count] = Array.from(serviceCounts.entries()).reduce((a, b) => 
          a[1] > b[1] ? a : b
        );
        topService = { name, count };
      }

      // Peak hour
      const hourCounts = new Map<string, number>();
      appointments.forEach(apt => {
        const hour = apt.time.split(':')[0] + ':00';
        const count = hourCounts.get(hour) || 0;
        hourCounts.set(hour, count + 1);
      });

      let peakHour = null;
      if (hourCounts.size > 0) {
        const [hour, count] = Array.from(hourCounts.entries()).reduce((a, b) => 
          a[1] > b[1] ? a : b
        );
        peakHour = { hour, count };
      }

      // Peak day (day of week)
      const dayCounts = new Map<string, number>();
      const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      appointments.forEach(apt => {
        const dayOfWeek = new Date(apt.date).getDay();
        const dayName = dayNames[dayOfWeek];
        const count = dayCounts.get(dayName) || 0;
        dayCounts.set(dayName, count + 1);
      });

      let peakDay = null;
      if (dayCounts.size > 0) {
        const [day, count] = Array.from(dayCounts.entries()).reduce((a, b) => 
          a[1] > b[1] ? a : b
        );
        peakDay = { day, count };
      }

      // Recent appointments
      const recentAppointments = appointments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      // Daily stats (last 7 days or by period)
      const dailyStatsMap = new Map<string, { appointments: number; revenue: number }>();
      appointments.forEach(apt => {
        const existing = dailyStatsMap.get(apt.date) || { appointments: 0, revenue: 0 };
        dailyStatsMap.set(apt.date, {
          appointments: existing.appointments + 1,
          revenue: existing.revenue + (apt.status === APPOINTMENT_STATUSES.COMPLETED && apt.service ? apt.service.price : 0),
        });
      });
      const dailyStats = Array.from(dailyStatsMap.entries())
        .map(([date, stats]) => ({ date, ...stats }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-7);

      // Service breakdown for pie chart
      const serviceBreakdown = Array.from(serviceCounts.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

      // Status breakdown for pie chart
      const COLORS = {
        completed: '#10b981',
        confirmed: '#3b82f6',
        pending: '#f59e0b',
        cancelled: '#ef4444',
      };
      const statusBreakdown = [
        { name: 'Completadas', value: completed, color: COLORS.completed },
        { name: 'Confirmadas', value: confirmed, color: COLORS.confirmed },
        { name: 'Pendientes', value: pending, color: COLORS.pending },
        { name: 'Canceladas', value: cancelled, color: COLORS.cancelled },
      ].filter(s => s.value > 0);

      // Calculate growth (compare with previous period)
      let growthAppointments = 0;
      let growthRevenue = 0;

      if (period !== 'all' && startDate) {
        const periodLength = now.getTime() - startDate.getTime();
        const previousStartDate = new Date(startDate.getTime() - periodLength);

        const { data: previousAppointments } = await supabase
          .from("appointments")
          .select(`*, service:services(*)`)
          .eq("user_id", userId)
          .gte("date", previousStartDate.toISOString().split('T')[0])
          .lt("date", startDate.toISOString().split('T')[0]);

        if (previousAppointments) {
          const previousTotal = previousAppointments.length;
          const previousRevenue = previousAppointments
            .filter(a => a.status === APPOINTMENT_STATUSES.COMPLETED && a.service)
            .reduce((sum, a) => sum + (a.service?.price || 0), 0);

          growthAppointments = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;
          growthRevenue = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;
        }
      }

      setStats({
        totalAppointments: total,
        confirmedAppointments: confirmed,
        completedAppointments: completed,
        cancelledAppointments: cancelled,
        pendingAppointments: pending,
        totalRevenue: revenue,
        avgRevenuePerAppointment: avgRevenue,
        conversionRate,
        topService,
        peakHour,
        peakDay,
        recentAppointments,
        dailyStats,
        serviceBreakdown,
        statusBreakdown,
        growth: {
          appointments: growthAppointments,
          revenue: growthRevenue,
        },
      });
    } catch (error: any) {
      console.error("Fetch stats error:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar las estadísticas",
        variant: "destructive",
      });
    }
  }

  function handleExport() {
    if (!stats) {
      toast({
        title: "Error",
        description: "No hay datos para exportar",
        variant: "destructive",
      });
      return;
    }

    // Crear CSV con estadísticas
    const csvRows = [
      ["Métrica", "Valor"],
      ["Total de Citas", stats.totalAppointments.toString()],
      ["Citas Confirmadas", stats.confirmedAppointments.toString()],
      ["Citas Completadas", stats.completedAppointments.toString()],
      ["Citas Canceladas", stats.cancelledAppointments.toString()],
      ["Citas Pendientes", stats.pendingAppointments.toString()],
      ["Ingresos Totales", formatCurrency(stats.totalRevenue)],
      ["Promedio por Cita", formatCurrency(stats.avgRevenuePerAppointment)],
      ["Tasa de Conversión", `${stats.conversionRate.toFixed(2)}%`],
      [""],
      ["Servicio Más Popular", stats.topService ? `${stats.topService.name} (${stats.topService.count} citas)` : "N/A"],
      ["Hora Pico", stats.peakHour ? `${stats.peakHour.hour} (${stats.peakHour.count} citas)` : "N/A"],
      ["Día Más Concurrido", stats.peakDay ? `${stats.peakDay.day} (${stats.peakDay.count} citas)` : "N/A"],
    ];

    const csvContent = csvRows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

    // Descargar archivo
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `informes-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "¡Exportado!",
      description: "Informes exportados correctamente",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <BarChart3 className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Generando informes...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <BarChart3 className="w-8 h-8" style={{ color: "var(--color-primary)" }} />
              Informes y Analytics
            </h1>
            <p className="text-slate-600 mt-1">
              Análisis detallado de tu negocio
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mes</SelectItem>
                <SelectItem value="year">Último año</SelectItem>
                <SelectItem value="all">Todo el tiempo</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={handleExport}
              className="bg-gradient-to-r from-primary to-accent hover:brightness-110"
              style={{
                backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-200/70 bg-white/70 backdrop-blur hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-slate-700" />
                </div>
                <TrendingUp className="w-5 h-5" style={{ color: brandColor.primary }} />
              </div>
              <p className="text-sm text-slate-600 font-medium mb-1">Total Citas</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-slate-900">{stats?.totalAppointments || 0}</p>
                {period !== 'all' && <GrowthIndicator value={stats?.growth.appointments || 0} />}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-white hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-slate-600 font-medium mb-1">Ingresos Totales</p>
              <div className="flex items-end justify-between">
                <p className="text-3xl font-bold text-primary">{formatCurrency(stats?.totalRevenue || 0)}</p>
                {period !== 'all' && <GrowthIndicator value={stats?.growth.revenue || 0} />}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card 
            className="border-slate-200/70 bg-gradient-to-br from-white to-white hover:shadow-xl transition-all"
            style={{ 
              borderColor: hexToRgba(brandColor.primary, 0.3),
              background: `linear-gradient(to bottom right, ${hexToRgba(brandColor.primary, 0.1)}, white)`
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: hexToRgba(brandColor.primary, 0.15) }}
                >
                  <CheckCircle2 className="w-6 h-6" style={{ color: brandColor.primary }} />
                </div>
                <span 
                  className="text-xs font-semibold px-2 py-1 rounded-full"
                  style={{ 
                    backgroundColor: hexToRgba(brandColor.primary, 0.15),
                    color: brandColor.primary
                  }}
                >
                  {stats?.conversionRate.toFixed(0)}%
                </span>
              </div>
              <p className="text-sm text-slate-600 font-medium mb-1">Confirmadas</p>
              <p className="text-3xl font-bold" style={{ color: brandColor.primary }}>{stats?.confirmedAppointments || 0}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-slate-200/70 bg-white/70 backdrop-blur hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium mb-1">Promedio por Cita</p>
              <p className="text-3xl font-bold text-slate-900">
                {formatCurrency(stats?.avgRevenuePerAppointment || 0)}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Status Breakdown */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card 
            className="border-slate-200/70 bg-gradient-to-br from-white to-white"
            style={{ 
              borderColor: hexToRgba(brandColor.primary, 0.3),
              background: `linear-gradient(to bottom right, ${hexToRgba(brandColor.primary, 0.1)}, white)`
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: brandColor.primary }}>
                <CheckCircle2 className="w-5 h-5" />
                Completadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold mb-2" style={{ color: brandColor.primary }}>
                {stats?.completedAppointments || 0}
              </p>
              <p className="text-sm text-slate-600">
                {formatCurrency(stats?.totalRevenue || 0)} generados
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-amber-200/70 bg-gradient-to-br from-amber-50/50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="w-5 h-5" />
                Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-amber-600 mb-2">
                {stats?.pendingAppointments || 0}
              </p>
              <p className="text-sm text-slate-600">
                Requieren confirmación
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-red-200/70 bg-gradient-to-br from-red-50/50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                Canceladas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-600 mb-2">
                {stats?.cancelledAppointments || 0}
              </p>
              <p className="text-sm text-slate-600">
                {(stats && stats.totalAppointments > 0)
                  ? ((stats.cancelledAppointments / stats.totalAppointments) * 100).toFixed(1) 
                  : 0}% del total
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Insights */}
      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-slate-200/70 bg-white/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Servicio Más Popular
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.topService ? (
                <>
                  <p className="text-2xl font-bold text-slate-900 mb-1">
                    {stats.topService.name}
                  </p>
                  <p className="text-sm text-slate-600">
                    {stats.topService.count} citas realizadas
                  </p>
                </>
              ) : (
                <p className="text-slate-500">Sin datos suficientes</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Card className="border-slate-200/70 bg-white/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Hora Pico
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.peakHour ? (
                <>
                  <p className="text-2xl font-bold text-slate-900 mb-1">
                    {stats.peakHour.hour}
                  </p>
                  <p className="text-sm text-slate-600">
                    {stats.peakHour.count} citas en promedio
                  </p>
                </>
              ) : (
                <p className="text-slate-500">Sin datos suficientes</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
        >
          <Card className="border-slate-200/70 bg-white/70 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Día Más Concurrido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats?.peakDay ? (
                <>
                  <p className="text-2xl font-bold text-slate-900 mb-1">
                    {stats.peakDay.day}
                  </p>
                  <p className="text-sm text-slate-600">
                    {stats.peakDay.count} citas
                  </p>
                </>
              ) : (
                <p className="text-slate-500">Sin datos suficientes</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      {stats && stats.dailyStats.length > 0 && (
        <>
          {/* Daily Stats Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="mt-8"
          >
            <Card className="border-slate-200/70 bg-white/70 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Tendencia de Citas e Ingresos
                </CardTitle>
                <CardDescription>
                  Últimos 7 días de actividad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                      stroke="#64748b"
                    />
                    <YAxis yAxisId="left" stroke="#64748b" />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                      labelFormatter={(date) => new Date(date).toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' })}
                      formatter={(value: any, name: string) => {
                        if (name === 'revenue') {
                          return [formatCurrency(value), 'Ingresos'];
                        }
                        return [value, 'Citas'];
                      }}
                    />
                    <Legend
                      formatter={(value) => value === 'appointments' ? 'Citas' : 'Ingresos'}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="appointments"
                      stroke={brandColor.primary}
                      strokeWidth={2}
                      dot={{ fill: brandColor.primary, r: 4 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="revenue"
                      stroke={brandColor.accent}
                      strokeWidth={2}
                      dot={{ fill: brandColor.accent, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Pie Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            {/* Service Breakdown */}
            {stats.serviceBreakdown.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
              >
                <Card className="border-slate-200/70 bg-white/70 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Distribución de Servicios
                    </CardTitle>
                    <CardDescription>
                      Top 5 servicios más solicitados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.serviceBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stats.serviceBreakdown.map((entry, index) => {
                            const colors = [brandColor.primary, brandColor.accent, '#10b981', '#f59e0b', '#ef4444'];
                            return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                          })}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Status Breakdown */}
            {stats.statusBreakdown.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 }}
              >
                <Card className="border-slate-200/70 bg-white/70 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Estado de Citas
                    </CardTitle>
                    <CardDescription>
                      Distribución por estado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.statusBreakdown}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stats.statusBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Recent Appointments Table */}
          {stats.recentAppointments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="mt-8"
            >
              <Card className="border-slate-200/70 bg-white/70 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Últimas Citas
                  </CardTitle>
                  <CardDescription>
                    Historial reciente de citas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Fecha</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Hora</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Cliente</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Servicio</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Estado</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentAppointments.map((apt) => {
                          const statusColors = {
                            completed: 'bg-green-100 text-green-700',
                            confirmed: 'bg-blue-100 text-blue-700',
                            pending: 'bg-amber-100 text-amber-700',
                            cancelled: 'bg-red-100 text-red-700',
                          };
                          const statusLabels = {
                            completed: 'Completada',
                            confirmed: 'Confirmada',
                            pending: 'Pendiente',
                            cancelled: 'Cancelada',
                          };
                          return (
                            <tr key={apt.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-4 text-sm text-slate-900">
                                {new Date(apt.date).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-900">
                                {formatTime(apt.time)}
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-900">
                                {apt.client_name}
                              </td>
                              <td className="py-3 px-4 text-sm text-slate-700">
                                {apt.service?.name || 'N/A'}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColors[apt.status as keyof typeof statusColors] || 'bg-slate-100 text-slate-700'}`}>
                                  {statusLabels[apt.status as keyof typeof statusLabels] || apt.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-sm text-right font-medium text-slate-900">
                                {apt.service ? formatCurrency(apt.service.price) : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

