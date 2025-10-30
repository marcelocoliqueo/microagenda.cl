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
  Building2,
  Upload,
  X,
  Image as ImageIcon,
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
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);
  const [showBusinessConfigDialog, setShowBusinessConfigDialog] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newBusinessName, setNewBusinessName] = useState("");
  const [businessLogoFile, setBusinessLogoFile] = useState<File | null>(null);
  const [businessLogoPreview, setBusinessLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  // Función para normalizar el username (reemplazar espacios con guiones y limpiar)
  const normalizeUsername = (input: string): string => {
    return input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Reemplazar espacios múltiples con un solo guión
      .replace(/[^a-z0-9_-]/g, '') // Eliminar caracteres inválidos
      .replace(/--+/g, '-') // Reemplazar múltiples guiones con uno solo
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
  };
  
  // Validar si el username es válido después de normalizar
  const isValidUsername = (input: string): boolean => {
    if (!input.trim()) return false;
    const normalized = normalizeUsername(input);
    return normalized.length >= 3 && /^[a-z0-9][a-z0-9_-]*[a-z0-9]$|^[a-z0-9]$/.test(normalized);
  };

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
      // Inicializar valores para configuración de negocio
      if (profileData) {
        setNewBusinessName(profileData.business_name || "");
        setBusinessLogoPreview(profileData.business_logo_url || null);
      }

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
    try {
      // Cerrar todas las conexiones de Realtime antes de hacer logout
      const channels = supabase.getChannels();
      channels.forEach((channel) => {
        supabase.removeChannel(channel);
      });

      // Cerrar sesión
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Error al cerrar sesión:", error);
        toast({
          title: "Error",
          description: "No se pudo cerrar sesión correctamente",
          variant: "destructive",
        });
        return;
      }

      // Limpiar estado local
      setUser(null);
      setProfile(null);
      setServices([]);

      // Redirigir a la landing page
      router.push("/");
      router.refresh(); // Forzar refresh del router
    } catch (error: any) {
      console.error("Error inesperado al cerrar sesión:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al cerrar sesión",
        variant: "destructive",
      });
    }
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

    // Normalizar el username (reemplazar espacios con guiones)
    const normalizedUsername = normalizeUsername(newUsername);

    // Validar que el username normalizado sea válido
    if (!isValidUsername(newUsername)) {
      toast({
        title: "Error",
        description: normalizedUsername.length < 3 
          ? "El nombre de usuario debe tener al menos 3 caracteres" 
          : "El nombre de usuario contiene caracteres inválidos o formato incorrecto",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: normalizedUsername })
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
      setProfile({ ...profile!, username: normalizedUsername });
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

  async function handleLogoUpload(file: File): Promise<string | null> {
    if (!user) return null;

    try {
      setUploadingLogo(true);

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona una imagen",
          variant: "destructive",
        });
        return null;
      }

      // Validar tamaño (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen debe ser menor a 5MB",
          variant: "destructive",
        });
        return null;
      }

      // Crear nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `business-logos/${fileName}`;

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Si el bucket no existe, intentar crearlo y luego subir
        if (uploadError.message.includes('Bucket not found')) {
          toast({
            title: "Error",
            description: "El sistema de almacenamiento no está configurado. Contacta al soporte.",
            variant: "destructive",
          });
          return null;
        }
        throw uploadError;
      }

      // Obtener URL pública
      const { data } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error("Logo upload error:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir el logo",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingLogo(false);
    }
  }

  async function handleUpdateBusinessInfo() {
    if (!user) return;

    try {
      let logoUrl = businessLogoPreview;

      // Si hay un nuevo archivo, subirlo primero
      if (businessLogoFile) {
        const uploadedUrl = await handleLogoUpload(businessLogoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          return; // Error al subir, no continuar
        }
      }

      // Actualizar perfil
      const { error } = await supabase
        .from("profiles")
        .update({
          business_name: newBusinessName.trim() || null,
          business_logo_url: logoUrl,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Actualizar perfil local
      setProfile({
        ...profile!,
        business_name: newBusinessName.trim() || null,
        business_logo_url: logoUrl,
      });

      setShowBusinessConfigDialog(false);
      setBusinessLogoFile(null);

      toast({
        title: "¡Perfecto!",
        description: "La información de tu negocio ha sido actualizada",
      });
    } catch (error: any) {
      console.error("Update business info error:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información del negocio",
        variant: "destructive",
      });
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusinessLogoFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBusinessLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveLogo() {
    setBusinessLogoFile(null);
    setBusinessLogoPreview(null);
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

  // Calculate stats - memoizar para evitar re-renderizados innecesarios
  // IMPORTANTE: Hooks deben estar ANTES de cualquier early return
  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter(a => a.status === APPOINTMENT_STATUSES.CONFIRMED).length;
    const pending = appointments.filter(a => a.status === APPOINTMENT_STATUSES.PENDING).length;
    const revenue = appointments
      .filter(a => a.status === APPOINTMENT_STATUSES.COMPLETED)
      .reduce((sum, a) => sum + (a.service?.price || 0), 0);
    
    return {
      totalAppointments: total,
      confirmedAppointments: confirmed,
      pendingAppointments: pending,
      totalRevenue: revenue,
      confirmationRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
    };
  }, [appointments]);

  const { totalAppointments, confirmedAppointments, pendingAppointments, totalRevenue, confirmationRate } = stats;
  
  // Memoizar estilos para evitar recálculos
  const cardStyles = useMemo(() => {
    const primaryColor = brandColor.primary;
    return {
      borderColor: hexToRgba(primaryColor, 0.3),
      background: `linear-gradient(to bottom right, ${hexToRgba(primaryColor, 0.1)}, white)`,
      backgroundColor: hexToRgba(primaryColor, 0.15),
      hoverBackground: `linear-gradient(to bottom right, ${hexToRgba(primaryColor, 0.1)}, transparent)`,
    };
  }, [brandColor.primary]);

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

  return (
    <div className="min-h-screen pb-8">
      {/* User Welcome Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/70 bg-white/95 backdrop-blur-md shadow-sm" style={{ zIndex: 10 }}>
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleLogout();
              }}
              className="cursor-pointer pointer-events-auto"
              type="button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </motion.div>
        </div>
      </header>

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
            style={{ position: 'relative', zIndex: 20 }}
          >
            <Card className="border-slate-200/70 bg-white/70 backdrop-blur shadow-lg hover:shadow-xl transition-shadow" style={{ position: 'relative', zIndex: 20 }}>
              <CardContent className="p-6" style={{ position: 'relative', zIndex: 30 }}>
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
                    <div className="flex flex-col gap-2 relative z-20">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigator.clipboard.writeText(publicUrl);
                          toast({ title: "¡Copiado!", description: "Enlace copiado al portapapeles" });
                        }}
                        className="whitespace-nowrap relative z-20 pointer-events-auto"
                        type="button"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Copiar Enlace
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setNewUsername(profile.username || "");
                          setShowUsernameDialog(true);
                        }}
                        className="text-xs relative z-20 pointer-events-auto"
                        type="button"
                      >
                        Editar nombre de usuario
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 relative z-20">
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNewUsername("");
                        setShowUsernameDialog(true);
                      }}
                      className="bg-gradient-to-r from-primary to-accent hover:brightness-110 relative z-20 pointer-events-auto"
                      style={{
                        backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                      }}
                      type="button"
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

        {/* Business Configuration Card */}
        {profile && profile.username && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <Card className="border-slate-200/70 bg-white/70 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(var(--color-primary), 0.1)' }}>
                        <Building2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div>
                        <Label className="text-sm font-semibold text-slate-900">Información del Negocio</Label>
                        <p className="text-xs text-slate-500">Personaliza cómo apareces en tu agenda pública</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {profile.business_name && (
                        <p className="text-sm text-slate-700">
                          <span className="font-medium">Nombre:</span> {profile.business_name}
                        </p>
                      )}
                      {profile.business_logo_url && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-700">Logo:</span>
                          <img
                            src={profile.business_logo_url}
                            alt="Logo del negocio"
                            className="h-12 w-12 object-contain rounded-lg border border-slate-200"
                          />
                        </div>
                      )}
                      {!profile.business_name && !profile.business_logo_url && (
                        <p className="text-sm text-slate-500 italic">
                          No has configurado información del negocio aún
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNewBusinessName(profile.business_name || "");
                        setBusinessLogoPreview(profile.business_logo_url || null);
                        setBusinessLogoFile(null);
                        setShowBusinessConfigDialog(true);
                      }}
                      className="whitespace-nowrap"
                      type="button"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      {profile.business_name || profile.business_logo_url ? "Editar" : "Configurar"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            layout
          >
            <Card className="border-slate-200/70 bg-white/70 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group will-change-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="w-6 h-6 text-slate-700" />
                  </div>
                  <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">Total Citas</p>
                <p className="text-3xl font-bold text-slate-900 tabular-nums">{totalAppointments}</p>
                <p className="text-xs text-slate-500 mt-2">Este mes</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            layout
          >
            <Card 
              className="border-slate-200/70 bg-gradient-to-br from-white to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group will-change-transform"
              style={{ 
                borderColor: cardStyles.borderColor,
                background: cardStyles.background
              }}
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: cardStyles.hoverBackground }}
              />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                    style={{ backgroundColor: cardStyles.backgroundColor }}
                  >
                    <CheckCircle2 className="w-6 h-6" style={{ color: brandColor.primary }} />
                  </div>
                  <span 
                    className="text-xs font-semibold px-2 py-1 rounded-full tabular-nums"
                    style={{ 
                      backgroundColor: cardStyles.backgroundColor,
                      color: brandColor.primary
                    }}
                  >
                    {confirmationRate}%
                  </span>
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">Confirmadas</p>
                <p className="text-3xl font-bold tabular-nums" style={{ color: brandColor.primary }}>{confirmedAppointments}</p>
                <p className="text-xs text-slate-500 mt-2">Tasa de confirmación</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            layout
          >
            <Card className="border-amber-200/70 bg-gradient-to-br from-amber-50/50 to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group will-change-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  {pendingAppointments > 0 && (
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">Pendientes</p>
                <p className="text-3xl font-bold text-amber-600 tabular-nums">{pendingAppointments}</p>
                <p className="text-xs text-slate-500 mt-2">Requieren confirmación</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            layout
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group will-change-transform">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <CardContent className="p-6 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">Ingresos</p>
                <p className="text-3xl font-bold text-primary tabular-nums">{formatCurrency(totalRevenue)}</p>
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

      </div>

      {/* Username Configuration Dialog */}
      <Dialog open={showUsernameDialog} onOpenChange={(open) => {
        setShowUsernameDialog(open);
        if (!open) {
          setNewUsername("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Nombre de Usuario</DialogTitle>
            <DialogDescription>
              Elige un nombre único para tu página de reservas. Puedes usar espacios (se convertirán automáticamente en guiones), letras, números, guiones y guiones bajos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nombre de Usuario</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">microagenda.cl/u/</span>
                <Input
                  id="username"
                  placeholder="tu nombre o tu-nombre"
                  value={newUsername}
                  onChange={(e) => {
                    // Permitir cualquier carácter mientras se escribe
                    setNewUsername(e.target.value);
                  }}
                  className="flex-1"
                  maxLength={30}
                />
              </div>
              
              {/* Mostrar preview del username normalizado */}
              {newUsername.trim() && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-600 mb-1">Vista previa de tu URL:</p>
                  <code className="text-sm font-mono text-slate-900 break-all">
                    microagenda.cl/u/{normalizeUsername(newUsername) || <span className="text-slate-400 italic">tu-nombre</span>}
                  </code>
                  {newUsername.includes(' ') && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Los espacios se reemplazarán con guiones
                    </p>
                  )}
                </div>
              )}
              
              {/* Mensaje de validación */}
              {newUsername.trim() && !isValidUsername(newUsername) && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {normalizeUsername(newUsername).length < 3 
                    ? "El nombre debe tener al menos 3 caracteres" 
                    : "El nombre contiene caracteres inválidos. Usa letras, números, espacios, guiones y guiones bajos"}
                </p>
              )}
              
              <p className="text-xs text-slate-500">
                Ejemplo: "Juan Pérez" se convertirá en "juan-perez"
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
                disabled={!isValidUsername(newUsername)}
                className="bg-gradient-to-r from-primary to-accent hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Business Configuration Dialog */}
      <Dialog open={showBusinessConfigDialog} onOpenChange={(open) => {
        setShowBusinessConfigDialog(open);
        if (!open) {
          setBusinessLogoFile(null);
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar Negocio</DialogTitle>
            <DialogDescription>
              Personaliza el nombre y logo que aparecerán en tu agenda pública
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Nombre del Negocio</Label>
              <Input
                id="business_name"
                placeholder="Ej: Salón de Belleza María"
                value={newBusinessName}
                onChange={(e) => setNewBusinessName(e.target.value)}
                maxLength={100}
              />
              <p className="text-xs text-slate-500">
                Este nombre aparecerá en lugar de tu nombre personal en la agenda pública
              </p>
            </div>

            <div className="space-y-2">
              <Label>Logo del Negocio</Label>
              {businessLogoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={businessLogoPreview}
                    alt="Preview del logo"
                    className="h-32 w-auto object-contain rounded-lg border-2 border-slate-200"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={handleRemoveLogo}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <ImageIcon className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                  <Label
                    htmlFor="logo-upload"
                    className="cursor-pointer text-sm text-slate-600 hover:text-primary"
                  >
                    <span className="font-medium">Haz clic para subir un logo</span>
                    <p className="text-xs text-slate-500 mt-1">
                      PNG, JPG o WEBP (máx. 5MB)
                    </p>
                  </Label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </div>
              )}
              {businessLogoFile && !businessLogoPreview && (
                <p className="text-xs text-amber-600">
                  Se cargará el logo al guardar
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBusinessConfigDialog(false);
                  setBusinessLogoFile(null);
                  setBusinessLogoPreview(profile?.business_logo_url || null);
                  setNewBusinessName(profile?.business_name || "");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateBusinessInfo}
                disabled={uploadingLogo}
                className="bg-gradient-to-r from-primary to-accent hover:brightness-110 disabled:opacity-50"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                }}
              >
                {uploadingLogo ? "Subiendo..." : "Guardar"}
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

