"use client";

import { useEffect, useState, useMemo } from "react";
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
  CheckCircle2,
  AlertCircle,
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
import { useTheme } from "@/contexts/ThemeContext";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { brandColor } = useTheme();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAppointmentDialog, setShowNewAppointmentDialog] = useState(false);
  const [showNewServiceDialog, setShowNewServiceDialog] = useState(false);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  const { appointments, loading: appointmentsLoading, updateAppointment, deleteAppointment, refresh } = useAppointments(user?.id);

  // Memoizar userId para evitar re-suscripciones innecesarias
  const userId = useMemo(() => user?.id || null, [user?.id]);

  // Real-time updates - solo cuando user.id está disponible y es estable
  useRealtime("appointments", userId, refresh);

  // Helper para convertir hex a rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

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

  async function handleUpdateUsername() {
    if (!user || !newUsername.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre de usuario",
        variant: "destructive",
      });
      return;
    }

    // Validate username format
    if (!/^[a-z0-9_-]+$/.test(newUsername)) {
      toast({
        title: "Error",
        description: "Solo puedes usar letras minúsculas, números, guiones y guiones bajos",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: newUsername.toLowerCase() })
        .eq("id", user.id);

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: "Error",
            description: "Este nombre de usuario ya está en uso",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      // Update local profile
      setProfile({ ...profile!, username: newUsername.toLowerCase() });
      setShowUsernameDialog(false);
      setNewUsername("");

      toast({
        title: "¡Perfecto!",
        description: "Tu nombre de usuario ha sido actualizado",
      });
    } catch (error: any) {
      console.error("Update username error:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el nombre de usuario",
        variant: "destructive",
      });
    }
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
          <p className="text-slate-600 font-medium">Cargando tu dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const publicUrl = profile && profile.username
    ? `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/u/${profile.username}`
    : "";

  // Calculate stats
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter(a => a.status === APPOINTMENT_STATUSES.CONFIRMED).length;
  const pendingAppointments = appointments.filter(a => a.status === APPOINTMENT_STATUSES.PENDING).length;
  const totalRevenue = appointments
    .filter(a => a.status === APPOINTMENT_STATUSES.COMPLETED)
    .reduce((sum, a) => sum + (a.service?.price || 0), 0);

  return (
    <div className="min-h-screen">
      {/* User Welcome Header */}
      <div className="border-b border-slate-200/70 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                ¡Hola, {profile?.name || "Usuario"}! 👋
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                Así va tu negocio hoy
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
        {/* Premium Subscription Banner */}
        {profile && profile.subscription_status !== "active" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 overflow-hidden relative shadow-lg">
              <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] opacity-10" />
              <CardContent className="p-6 relative">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        {profile.subscription_status === "trial" ? "🎉 Prueba Gratuita de 3 Días Activa" : "⚠️ Suscripción Inactiva"}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {profile.subscription_status === "trial" 
                          ? "Disfruta de todas las funciones premium durante 3 días. Luego solo " + formatCurrency(PLAN_PRICE) + "/mes"
                          : "Activa tu plan por solo " + formatCurrency(PLAN_PRICE) + "/mes y desbloquea todo el potencial"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2 py-1 bg-white rounded-full text-slate-700 font-medium">✓ Citas ilimitadas</span>
                        <span className="text-xs px-2 py-1 bg-white rounded-full text-slate-700 font-medium">✓ Recordatorios automáticos</span>
                        <span className="text-xs px-2 py-1 bg-white rounded-full text-slate-700 font-medium">✓ Estadísticas detalladas</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={handleSubscribe} size="lg" className="bg-gradient-to-r from-primary to-accent hover:brightness-110 whitespace-nowrap shadow-lg">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Activar Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Premium Public URL Card */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="border-slate-200/70 bg-white/70 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                {profile.username ? (
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary), 0.1)' }}>
                          <ExternalLink className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                          <Label className="text-sm font-semibold text-slate-900">Tu Agenda Pública</Label>
                          <p className="text-xs text-slate-500">Comparte este enlace con tus clientes</p>
                        </div>
                      </div>
                      <code className="block text-sm bg-slate-100 px-4 py-3 rounded-lg border border-slate-200 font-mono break-all" style={{ color: 'var(--color-primary)' }}>
                        {publicUrl}
                      </code>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => {
                          navigator.clipboard.writeText(publicUrl);
                          toast({ title: "¡Copiado!", description: "Enlace copiado al portapapeles" });
                        }}
                        className="whitespace-nowrap"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Copiar Enlace
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setNewUsername(profile.username || "");
                          setShowUsernameDialog(true);
                        }}
                        className="text-xs"
                      >
                        Editar nombre de usuario
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                      <ExternalLink className="w-8 h-8 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Configura tu nombre de usuario
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      Elige un nombre único para tu página de reservas
                    </p>
                    <Button
                      onClick={() => setShowUsernameDialog(true)}
                      className="bg-gradient-to-r from-primary to-accent hover:brightness-110"
                      style={{
                        backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Configurar Ahora
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-slate-200/70 bg-white/70 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6 text-slate-700" />
                  </div>
                  <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">Total Citas</p>
                <p className="text-3xl font-bold text-slate-900">{totalAppointments}</p>
                <p className="text-xs text-slate-500 mt-2">Este mes</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card 
              className="border-slate-200/70 bg-gradient-to-br from-white to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
              style={{ 
                borderColor: hexToRgba(brandColor.primary, 0.3),
                background: `linear-gradient(to bottom right, ${hexToRgba(brandColor.primary, 0.1)}, white)`
              }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: `linear-gradient(to bottom right, ${hexToRgba(brandColor.primary, 0.1)}, transparent)` }}
              />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
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
                    {totalAppointments > 0 ? Math.round((confirmedAppointments / totalAppointments) * 100) : 0}%
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">Confirmadas</p>
                <p className="text-3xl font-bold" style={{ color: brandColor.primary }}>{confirmedAppointments}</p>
                <p className="text-xs text-slate-500 mt-2">Tasa de confirmación</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-amber-200/70 bg-gradient-to-br from-amber-50/50 to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  {pendingAppointments > 0 && (
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-amber-600">{pendingAppointments}</p>
                <p className="text-xs text-slate-500 mt-2">Requieren confirmación</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">Ingresos</p>
                <p className="text-3xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
                <p className="text-xs text-slate-500 mt-2">Citas completadas</p>
              </CardContent>
            </Card>
          </motion.div>
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

      {/* Username Configuration Dialog */}
      <Dialog open={showUsernameDialog} onOpenChange={setShowUsernameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Nombre de Usuario</DialogTitle>
            <DialogDescription>
              Elige un nombre único para tu página de reservas. Solo puedes usar letras minúsculas, números, guiones (-) y guiones bajos (_).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">microagenda.cl/u/</span>
                <Input
                  id="username"
                  placeholder="tu-nombre"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-slate-500">
                Ejemplo: juan-perez, maria_garcia, consultoraluz
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowUsernameDialog(false);
                  setNewUsername("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateUsername}
                className="bg-gradient-to-r from-primary to-accent hover:brightness-110"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                }}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
