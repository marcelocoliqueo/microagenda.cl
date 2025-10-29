"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Settings,
  LogOut,
  TrendingUp,
  Users,
  Clock,
  DollarSign,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase, type Profile, type Service } from "@/lib/supabaseClient";
import { useAppointments } from "@/hooks/useAppointments";
import { useRealtime } from "@/hooks/useRealtime";
import {
  APP_NAME,
  STATUS_LABELS,
  STATUS_COLORS,
  APPOINTMENT_STATUSES,
  formatCurrency,
  formatDate,
  formatTime,
  PLAN_PRICE,
} from "@/lib/constants";
import { createSubscriptionPreference } from "@/lib/mercadopagoClient";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [showNewServiceDialog, setShowNewServiceDialog] = useState(false);

  const { appointments, loading: appointmentsLoading, updateAppointment, deleteAppointment, refresh } = useAppointments(user?.id);

  // Real-time updates
  useRealtime("appointments", user?.id, refresh);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
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
  }

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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleSubscribe() {
    if (!profile || !user) return;

    try {
      // Get plan
      const { data: plans } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .single();

      if (!plans) {
        toast({
          title: "Error",
          description: "No se encontró el plan",
          variant: "destructive",
        });
        return;
      }

      const result = await createSubscriptionPreference({
        userId: user.id,
        userEmail: profile.email,
        planId: plans.id,
        planName: plans.name,
        planPrice: plans.price,
      });

      if (result.success && result.init_point) {
        window.location.href = result.init_point;
      } else {
        throw new Error("No se pudo crear la preferencia de pago");
      }
    } catch (error: any) {
      console.error("Subscription error:", error);
      toast({
        title: "Error",
        description: "No se pudo iniciar el pago",
        variant: "destructive",
      });
    }
  }

  async function handleStatusChange(appointmentId: string, newStatus: string) {
    const result = await updateAppointment(appointmentId, { status: newStatus });

    if (result.success) {
      toast({
        title: "Estado actualizado",
        description: `Cita marcada como ${STATUS_LABELS[newStatus]}`,
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  async function handleDeleteAppointment(appointmentId: string) {
    if (!confirm("¿Estás seguro de eliminar esta cita?")) return;

    const result = await deleteAppointment(appointmentId);

    if (result.success) {
      toast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada",
      });
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("¿Estás seguro? Esta acción no se puede deshacer y eliminará todos tus datos.")) return;

    if (!user) return;

    try {
      // Delete all user data
      await supabase.from("appointments").delete().eq("user_id", user.id);
      await supabase.from("services").delete().eq("user_id", user.id);
      await supabase.from("subscriptions").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);

      // Sign out
      await supabase.auth.signOut();

      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta y todos tus datos han sido eliminados",
      });

      router.push("/");
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  const publicUrl = profile ? `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/u/${profile.email.split('@')[0]}` : "";

  // Calculate stats
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(a => a.status === APPOINTMENT_STATUSES.CONFIRMED).length;
  const pendingAppointments = appointments.filter(a => a.status === APPOINTMENT_STATUSES.PENDING).length;
  const totalRevenue = appointments
    .filter(a => a.status === APPOINTMENT_STATUSES.COMPLETED)
    .reduce((sum, a) => sum + (a.service?.price || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-primary">{APP_NAME}</h1>
            {profile && (
              <span className="text-sm text-muted">
                Hola, {profile.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Subscription Banner */}
        {profile && profile.subscription_status !== "active" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-primary bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">
                      {profile.subscription_status === "trial" ? "Período de prueba" : "Suscripción inactiva"}
                    </h3>
                    <p className="text-sm text-muted">
                      Activa tu suscripción por solo {formatCurrency(PLAN_PRICE)}/mes y desbloquea todas las funciones
                    </p>
                  </div>
                  <Button onClick={handleSubscribe}>
                    <DollarSign className="w-4 h-4 mr-2" />
                    Activar Suscripción
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Public Link */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex-1">
                    <Label className="text-sm text-muted mb-2 block">Tu agenda pública:</Label>
                    <code className="text-sm bg-background px-3 py-2 rounded-lg border border-border block">
                      {publicUrl}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(publicUrl);
                      toast({ title: "Copiado", description: "Enlace copiado al portapapeles" });
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted">Total Citas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted">Confirmadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-accent">{confirmedAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{pendingAppointments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted">Ingresos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{formatCurrency(totalRevenue)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Próximas Citas</CardTitle>
                <CardDescription>Gestiona tus citas programadas</CardDescription>
              </div>
              <NewAppointmentDialog
                services={services}
                userId={user?.id}
                onSuccess={refresh}
              />
            </div>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="text-center py-8 text-muted">Cargando citas...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-muted">
                No tienes citas programadas
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-xl hover:bg-background/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold">{appointment.client_name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-lg ${STATUS_COLORS[appointment.status]}`}>
                          {STATUS_LABELS[appointment.status]}
                        </span>
                      </div>
                      <div className="text-sm text-muted space-y-1">
                        <p>{appointment.service?.name}</p>
                        <p>
                          {formatDate(appointment.date)} · {formatTime(appointment.time)}
                        </p>
                        <p>{appointment.client_phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={appointment.status}
                        onValueChange={(value) => handleStatusChange(appointment.id, value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAppointment(appointment.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Settings Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Configuración</CardTitle>
            <CardDescription>Personaliza cómo funciona tu agenda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div className="space-y-1">
                <h4 className="font-medium">Confirmación automática</h4>
                <p className="text-sm text-muted">
                  Las citas se confirman automáticamente sin tu intervención
                </p>
              </div>
              <Button
                variant={profile?.auto_confirm ? "default" : "outline"}
                size="sm"
                onClick={async () => {
                  if (!user) return;
                  const newValue = !profile?.auto_confirm;
                  const { error } = await supabase
                    .from("profiles")
                    .update({ auto_confirm: newValue })
                    .eq("id", user.id);
                  
                  if (!error) {
                    setProfile({ ...profile!, auto_confirm: newValue });
                    toast({
                      title: "Configuración actualizada",
                      description: newValue 
                        ? "Las citas se confirmarán automáticamente" 
                        : "Ahora debes confirmar manualmente cada cita",
                    });
                  }
                }}
              >
                {profile?.auto_confirm ? "Activada" : "Desactivada"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Services Section */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mis Servicios</CardTitle>
                <CardDescription>Servicios que ofreces a tus clientes</CardDescription>
              </div>
              <NewServiceDialog userId={user?.id} onSuccess={() => fetchServices(user?.id)} />
            </div>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-8 text-muted">
                No has creado servicios aún
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="p-4 border border-border rounded-xl"
                  >
                    <h4 className="font-semibold mb-2">{service.name}</h4>
                    <div className="text-sm text-muted space-y-1">
                      <p>{service.duration} minutos</p>
                      <p className="font-semibold text-text">{formatCurrency(service.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
            <CardDescription>
              Acciones irreversibles que afectarán tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
            >
              Eliminar Cuenta y Todos los Datos
            </Button>
            <p className="text-xs text-muted mt-2">
              Esta acción eliminará permanentemente tu cuenta, citas, servicios y todos tus datos personales conforme a la Ley 19.628.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// New Appointment Dialog Component
function NewAppointmentDialog({ services, userId, onSuccess }: { services: Service[]; userId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    service_id: "",
    date: "",
    time: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva Cita</DialogTitle>
          <DialogDescription>Registra una nueva cita para un cliente</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client_name">Nombre del cliente</Label>
            <Input
              id="client_name"
              required
              value={formData.client_name}
              onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_phone">Teléfono</Label>
            <Input
              id="client_phone"
              type="tel"
              required
              value={formData.client_phone}
              onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="service">Servicio</Label>
            <Select
              value={formData.service_id}
              onValueChange={(value) => setFormData({ ...formData, service_id: value })}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando..." : "Crear Cita"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// New Service Dialog Component
function NewServiceDialog({ userId, onSuccess }: { userId: string; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    price: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("services").insert([
        {
          user_id: userId,
          name: formData.name,
          duration: parseInt(formData.duration),
          price: parseFloat(formData.price),
        },
      ]);

      if (error) throw error;

      toast({
        title: "Servicio creado",
        description: "El servicio ha sido creado exitosamente",
      });

      setOpen(false);
      setFormData({ name: "", duration: "", price: "" });
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
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Servicio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo Servicio</DialogTitle>
          <DialogDescription>Crea un nuevo servicio que ofreces</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del servicio</Label>
            <Input
              id="name"
              required
              placeholder="Ej: Corte de cabello"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duración (minutos)</Label>
            <Input
              id="duration"
              type="number"
              required
              min="1"
              placeholder="30"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio (CLP)</Label>
            <Input
              id="price"
              type="number"
              required
              min="0"
              placeholder="10000"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creando..." : "Crear Servicio"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
