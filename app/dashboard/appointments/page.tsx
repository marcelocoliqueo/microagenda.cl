"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Trash2,
  Edit2,
  Phone,
  User,
  DollarSign,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase, type Profile, type Service } from "@/lib/supabaseClient";
import { useAppointments } from "@/hooks/useAppointments";
import { useRealtime } from "@/hooks/useRealtime";
import { useAutoUpdateAppointments } from "@/hooks/useAutoUpdateAppointments";
import { RescheduleDialog } from "@/components/RescheduleDialog";
import {
  STATUS_LABELS,
  STATUS_COLORS,
  APPOINTMENT_STATUSES,
  formatCurrency,
  formatDate,
  formatTime,
} from "@/lib/constants";

export default function AppointmentsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  // Filtros y búsqueda
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");

  const { appointments, loading: appointmentsLoading, updateAppointment, deleteAppointment, refresh } = useAppointments(user?.id);

  // Memoizar userId para evitar re-suscripciones innecesarias
  const userId = useMemo(() => user?.id || null, [user?.id]);

  // Real-time updates
  useRealtime("appointments", userId, refresh);

  // Auto-actualizar estados de citas cada 1 minuto
  // Esto marca automáticamente las citas como "completed" cuando terminan
  useAutoUpdateAppointments(1, true);

  const checkAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch services
      await fetchServices(session.user.id);
    } catch (error: any) {
      console.error("Auth check error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar tu perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Escuchar eventos de auto-actualización para refrescar las citas
  useEffect(() => {
    const handleAppointmentsUpdated = () => {
      console.log("🔄 Citas actualizadas automáticamente, refrescando...");
      refresh();
    };

    window.addEventListener("appointmentsUpdated", handleAppointmentsUpdated);

    return () => {
      window.removeEventListener("appointmentsUpdated", handleAppointmentsUpdated);
    };
  }, [refresh]);

  async function fetchServices(userId: string) {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Services fetch error:", error);
      return;
    }

    setServices(data || []);
  }

  // Filtrar y buscar citas
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    // Búsqueda por nombre o teléfono
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.client_name.toLowerCase().includes(query) ||
          a.client_phone.includes(query)
      );
    }

    // Filtro por fecha
    if (dateFilter) {
      filtered = filtered.filter((a) => a.date === dateFilter);
    }

    // Ordenar: primero por fecha, luego por hora
    filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    return filtered;
  }, [appointments, statusFilter, searchQuery, dateFilter]);

  // Estadísticas de citas filtradas
  const stats = useMemo(() => {
    const total = filteredAppointments.length;
    const pending = filteredAppointments.filter(
      (a) => a.status === APPOINTMENT_STATUSES.PENDING
    ).length;
    const confirmed = filteredAppointments.filter(
      (a) => a.status === APPOINTMENT_STATUSES.CONFIRMED
    ).length;
    const completed = filteredAppointments.filter(
      (a) => a.status === APPOINTMENT_STATUSES.COMPLETED
    ).length;
    const cancelled = filteredAppointments.filter(
      (a) => a.status === APPOINTMENT_STATUSES.CANCELLED
    ).length;

    return { total, pending, confirmed, completed, cancelled };
  }, [filteredAppointments]);

  async function handleStatusChange(appointmentId: string, newStatus: string) {
    // Obtener el estado anterior para detectar cambios
    const appointment = appointments.find(a => a.id === appointmentId);
    const previousStatus = appointment?.status;

    const result = await updateAppointment(appointmentId, { status: newStatus });

    if (result.success) {
      toast({
        title: "Estado actualizado",
        description: `Cita marcada como ${STATUS_LABELS[newStatus]}`,
      });

      // Enviar emails según el cambio de estado
      try {
        // Si la cita fue confirmada manualmente (de pending a confirmed)
        if (previousStatus === "pending" && newStatus === "confirmed") {
          await fetch("/api/send-appointment-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "manual-confirmation",
              appointmentId,
            }),
          });
        }

        // Si la cita fue cancelada
        if (newStatus === "cancelled") {
          // Email al cliente
          await fetch("/api/send-appointment-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "cancellation-client",
              appointmentId,
            }),
          });
          // Email al profesional
          await fetch("/api/send-appointment-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "cancellation-professional",
              appointmentId,
            }),
          });
        }

        // Si la cita fue completada
        if (newStatus === "completed") {
          await fetch("/api/send-appointment-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "completed",
              appointmentId,
            }),
          });
        }

        // Si la cita fue marcada como no-show
        if (newStatus === "no-show") {
          await fetch("/api/send-appointment-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "no-show",
              appointmentId,
            }),
          });
        }
      } catch (emailError) {
        console.error("Error enviando emails:", emailError);
        // No mostrar error al usuario, los emails son opcionales
      }
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  async function handleDeleteAppointment(appointmentId: string) {
    if (!confirm("¿Quieres quitar esta cita de tu vista? Podrás seguir viéndola en tus estadísticas generales.")) return;

    const result = await updateAppointment(appointmentId, { status: "archived" });

    if (result.success) {
      toast({
        title: "Cita quitada",
        description: "La cita se ha movido a tu historial.",
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo quitar la cita",
        variant: "destructive",
      });
    }
  }

  async function handleReschedule(appointmentId: string, newDate: string, newTime: string) {
    try {
      const response = await fetch("/api/reschedule-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId, newDate, newTime }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al reagendar");
      }

      toast({
        title: "Cita reagendada",
        description: `La cita ha sido reagendada para el ${formatDate(newDate)} a las ${formatTime(newTime)}`,
      });

      refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Calendar className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Cargando tus citas...</p>
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8" style={{ color: "var(--color-primary)" }} />
              Mis Citas
            </h1>
            <p className="text-slate-600">
              Gestiona todas tus citas y reservas
            </p>
          </div>
          <NewAppointmentDialog
            services={services}
            userId={user?.id}
            onSuccess={refresh}
          />
        </div>
      </motion.div>

      {/* Filtros y búsqueda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o teléfono..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filtro por estado */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las citas</SelectItem>
                  <SelectItem value={APPOINTMENT_STATUSES.PENDING}>Pendientes</SelectItem>
                  <SelectItem value={APPOINTMENT_STATUSES.CONFIRMED}>Confirmadas</SelectItem>
                  <SelectItem value={APPOINTMENT_STATUSES.COMPLETED}>Completadas</SelectItem>
                  <SelectItem value={APPOINTMENT_STATUSES.CANCELLED}>Canceladas</SelectItem>
                </SelectContent>
              </Select>

              {/* Filtro por fecha */}
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full"
                placeholder="Filtrar por fecha"
              />

              {/* Limpiar filtros */}
              {(statusFilter !== "all" || searchQuery || dateFilter) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStatusFilter("all");
                    setSearchQuery("");
                    setDateFilter("");
                  }}
                  className="w-full"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card className="border-slate-200/70">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500 mb-1">Total</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200/70 bg-amber-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3 h-3 text-amber-600" />
              <p className="text-xs text-slate-600">Pendientes</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="border-green-200/70 bg-green-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              <p className="text-xs text-slate-600">Confirmadas</p>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-200/70 bg-slate-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-3 h-3 text-slate-600" />
              <p className="text-xs text-slate-600">Completadas</p>
            </div>
            <p className="text-2xl font-bold text-slate-700">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card className="border-red-200/70 bg-red-50/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-3 h-3 text-red-600" />
              <p className="text-xs text-slate-600">Canceladas</p>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Citas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {filteredAppointments.length === appointments.length
                    ? "Todas las Citas"
                    : `${filteredAppointments.length} Cita${filteredAppointments.length !== 1 ? "s" : ""} Filtrada${filteredAppointments.length !== 1 ? "s" : ""}`}
                </CardTitle>
                <CardDescription>
                  {appointments.length} cita{appointments.length !== 1 ? "s" : ""} en total
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600">Cargando citas...</p>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {appointments.length === 0
                    ? "No tienes citas programadas"
                    : "No se encontraron citas con los filtros aplicados"}
                </h3>
                <p className="text-slate-600 mb-4">
                  {appointments.length === 0
                    ? "Crea tu primera cita usando el botón de arriba"
                    : "Intenta cambiar los filtros o la búsqueda"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAppointments.map((appointment) => (
                  <motion.div
                    key={appointment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50/50 transition-all group"
                  >
                    <div className="flex-1 w-full md:w-auto mb-4 md:mb-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          {appointment.client_name}
                        </h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-lg font-medium ${STATUS_COLORS[appointment.status]}`}
                        >
                          {STATUS_LABELS[appointment.status]}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>
                            {formatDate(appointment.date)} · {formatTime(appointment.time)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span>{appointment.client_phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-900">
                            {appointment.service?.name || "Sin servicio"} - {appointment.service?.price ? formatCurrency(appointment.service.price) : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Select
                        value={appointment.status}
                        onValueChange={(value) => handleStatusChange(appointment.id, value)}
                      >
                        <SelectTrigger className="w-[140px] md:w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS)
                            .filter(([key]) => Object.values(APPOINTMENT_STATUSES).includes(key as any))
                            .map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <RescheduleDialog
                        appointment={appointment}
                        onReschedule={handleReschedule}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
}

// New Appointment Dialog Component
function NewAppointmentDialog({
  services,
  userId,
  onSuccess,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  services: Service[];
  userId: string;
  onSuccess: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    service_id: "",
    date: "",
    time: "",
  });

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled && controlledOnOpenChange ? controlledOnOpenChange : setInternalOpen;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);

    try {
      const { error } = await supabase.from("appointments").insert([
        {
          ...formData,
          user_id: userId,
          status: "pending",
        },
      ]);

      if (error) throw error;

      toast({
        title: "Cita creada",
        description: "La cita ha sido creada exitosamente",
      });

      setOpen(false);
      setFormData({
        client_name: "",
        client_phone: "",
        service_id: "",
        date: "",
        time: "",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="hover:brightness-110 text-white"
          style={{
            background: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Cita</DialogTitle>
          <DialogDescription>
            Registra una nueva cita para un cliente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_name">Nombre del cliente</Label>
            <Input
              id="client_name"
              required
              value={formData.client_name}
              onChange={(e) =>
                setFormData({ ...formData, client_name: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_phone">Teléfono</Label>
            <Input
              id="client_phone"
              type="tel"
              required
              value={formData.client_phone}
              onChange={(e) =>
                setFormData({ ...formData, client_phone: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Servicio</Label>
            {services.length === 0 ? (
              <div className="space-y-2">
                <Select disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="No hay servicios disponibles" />
                  </SelectTrigger>
                </Select>
                <p className="text-sm text-amber-600 flex items-center gap-2">
                  <span>⚠️</span>
                  No tienes servicios. Crea uno primero en la página de{" "}
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-amber-600 underline"
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = "/dashboard/services";
                    }}
                  >
                    Servicios
                  </Button>
                </p>
              </div>
            ) : (
              <Select
                value={formData.service_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, service_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - {formatCurrency(service.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                required
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading || services.length === 0 || !formData.service_id}
          >
            {loading ? "Creando..." : services.length === 0 ? "Crear servicios primero" : "Crear Cita"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
