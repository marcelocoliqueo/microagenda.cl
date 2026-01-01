"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, CheckCircle, Sparkles, Check, ChevronRight, User, Phone as PhoneIcon, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase, type Profile, type Service } from "@/lib/supabaseClient";
import { formatCurrency, formatDateFriendly, generateAvailableSlots, getDayName, sanitizePhone } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function PublicAgendaPage() {
  const params = useParams();
  const username = params?.username as string;
  const { toast } = useToast();
  
  // Estados principales
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<Record<string, Array<{ start: string; end: string }>>>({});
  const [bookedSlots, setBookedSlots] = useState<Array<{ time: string; duration: number }>>([]);
  const [blockedDates, setBlockedDates] = useState<Array<{ start_date: string; end_date: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Stepper y formulario
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [calendarWeekOffset, setCalendarWeekOffset] = useState(0); // Para navegar por semanas
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    service_id: "",
    date: "",
    time: "",
  });

  const selectedService = services.find(s => s.id === formData.service_id);

  // Función para convertir hex a RGB
  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : "16, 185, 129"; // Default emerald
  };

  // Aplicar el color de marca del profesional
  useEffect(() => {
    // Mapeo de colores desde la base de datos
    const colorMap: Record<string, { primary: string; accent: string }> = {
      emerald: { primary: "#10B981", accent: "#84CC16" },
      blue: { primary: "#3B82F6", accent: "#60A5FA" },
      purple: { primary: "#8B5CF6", accent: "#A78BFA" },
      pink: { primary: "#EC4899", accent: "#F472B6" },
      orange: { primary: "#F97316", accent: "#FB923C" },
      rose: { primary: "#F43F5E", accent: "#FB7185" },
      cyan: { primary: "#06B6D4", accent: "#22D3EE" },
      amber: { primary: "#F59E0B", accent: "#FCD34D" },
    };
    
    // Usar el color del profesional o el default emerald
    const brandColor = profile?.brand_color || "emerald";
    const colors = colorMap[brandColor] || colorMap.emerald;
    
    // Aplicar variables CSS
    document.documentElement.style.setProperty('--color-primary', colors.primary);
    document.documentElement.style.setProperty('--color-accent', colors.accent);
    document.documentElement.style.setProperty('--color-primary-rgb', hexToRgb(colors.primary));
    document.documentElement.style.setProperty('--color-accent-rgb', hexToRgb(colors.accent));
    
    // Cleanup: restaurar colores por defecto al salir
    return () => {
      document.documentElement.style.setProperty('--color-primary', '#10B981');
      document.documentElement.style.setProperty('--color-accent', '#84CC16');
      document.documentElement.style.setProperty('--color-primary-rgb', '16, 185, 129');
      document.documentElement.style.setProperty('--color-accent-rgb', '132, 204, 22');
    };
  }, [profile?.brand_color]);

  // Categorías
  const categories = useMemo(() => {
    const cats = new Set<string>();
    services.forEach(service => cats.add(service.category || "General"));
    return ["all", ...Array.from(cats).sort()];
  }, [services]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return services;
    return services.filter(s => (s.category || "General") === selectedCategory);
  }, [services, selectedCategory]);

  // Horarios disponibles - NUEVO: cada bloque = 1 slot
  const getAvailableTimeSlots = (): string[] => {
    if (!formData.date) {
      console.log('⚠️ No hay fecha seleccionada');
      return [];
    }

    const dayName = getDayName(formData.date);
    console.log('📅 Obteniendo horarios para:', formData.date, '→', dayName);

    const dayAvailability = availability[dayName];
    console.log('🕒 Disponibilidad del día:', dayAvailability);

    if (!dayAvailability || dayAvailability.length === 0) {
      console.log('❌ No hay disponibilidad configurada para', dayName);
      return [];
    }

    // NUEVO: Cada bloque configurado = 1 slot (solo hora de inicio)
    // NO generar intervalos cada 30 min
    const availableSlots = dayAvailability.map(block => block.start);
    console.log('✅ Slots (bloques completos):', availableSlots);

    const bookedForDay = bookedSlots;
    console.log('🚫 Slots ocupados:', bookedForDay);

    // Filtrar slots que están ocupados
    // Un slot está ocupado si hay una cita que se solapa con ese horario
    const finalSlots = availableSlots.filter(slot => {
      const slotMinutes = parseInt(slot.split(':')[0]) * 60 + parseInt(slot.split(':')[1]);

      // Verificar cada cita reservada para ver si hay conflicto
      for (const bookedSlot of bookedForDay) {
        const bookedMinutes = parseInt(bookedSlot.time.split(':')[0]) * 60 + parseInt(bookedSlot.time.split(':')[1]);

        // Verificar si el slot está ocupado exactamente (mismo horario)
        if (slotMinutes === bookedMinutes) {
          console.log(`🚫 Slot ${slot} está ocupado exactamente`);
          return false;
        }

        // Verificar si el slot empieza durante otra cita
        const bookedEndMinutes = bookedMinutes + bookedSlot.duration;
        if (slotMinutes < bookedEndMinutes && slotMinutes >= bookedMinutes) {
          console.log(`🚫 Slot ${slot} está dentro de la cita ${bookedSlot.time} (dura ${bookedSlot.duration}min)`);
          return false;
        }
      }

      return true;
    });
    console.log('🎯 Slots finales disponibles:', finalSlots);

    return finalSlots;
  };

  // Agrupar horarios por período
  const groupedTimeSlots = useMemo(() => {
    if (!formData.date) {
      return { morning: [], afternoon: [], evening: [] };
    }
    
    const slots = getAvailableTimeSlots();
    console.log('🔍 Agrupando slots para fecha:', formData.date, 'Total slots:', slots.length, slots);
    
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];
    slots.forEach(slot => {
      const [hour] = slot.split(':').map(Number);
      if (hour < 12) morning.push(slot);
      else if (hour < 18) afternoon.push(slot);
      else evening.push(slot);
    });
    
    console.log('📊 Agrupación:', { morning: morning.length, afternoon: afternoon.length, evening: evening.length });
    return { morning, afternoon, evening };
  }, [formData.date, formData.service_id, bookedSlots, availability]);

  // Fetch data
  useEffect(() => {
    if (username) fetchProfessionalData();
  }, [username]);

  useEffect(() => {
    if (formData.date && profile) fetchBookedSlots();
  }, [formData.date, profile]);

  async function fetchProfessionalData() {
    if (!username) return;
    try {
      setLoading(true);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();
      
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        // Si es un error de permisos (RLS), mostrar mensaje más específico
        if (profileError.code === "PGRST116" || profileError.message?.includes("permission")) {
          console.error("RLS Policy Error: El perfil existe pero no hay acceso público configurado");
        }
        toast({ title: "Error", description: "Profesional no encontrado", variant: "destructive" });
        setLoading(false);
        return;
      }
      
      if (!profile) {
        toast({ title: "Error", description: "Profesional no encontrado", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Verificar estado de suscripción del profesional
      // Si está expired o inactive, verificar si hay suscripción activa (sincronización)
      if (profile.subscription_status === "expired" || profile.subscription_status === "inactive") {
        const { data: activeSubscription } = await supabase
          .from("subscriptions")
          .select("id, status, renewal_date")
          .eq("user_id", profile.id)
          .eq("status", "active")
          .single();

        if (activeSubscription) {
          const renewalDate = new Date(activeSubscription.renewal_date);
          const now = new Date();

          // Si la fecha de renovación es futura, la suscripción está activa
          if (renewalDate > now) {
            console.log("✅ Encontrada suscripción activa desincronizada - Sincronizando...");
            
            // Sincronizar el estado del perfil
            await supabase
              .from("profiles")
              .update({ subscription_status: "active" })
              .eq("id", profile.id);

            profile.subscription_status = "active";
          }
        }
      }

      setProfile(profile);

      const { data: servicesData } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", profile.id);
      setServices(servicesData || []);
      const { data: availData } = await supabase
        .from("availability")
        .select("*")
        .eq("user_id", profile.id)
        .eq("enabled", true);
      const availMap: Record<string, Array<{ start: string; end: string }>> = {};
      availData?.forEach((item) => {
        const day = item.day_of_week as string;
        if (!availMap[day]) availMap[day] = [];
        availMap[day].push({
          start: item.start_time.substring(0, 5),
          end: item.end_time.substring(0, 5),
        });
      });
      console.log('📅 Disponibilidad cargada desde BD:', Object.keys(availMap));
      console.log('🗓️ Detalles completos:', availMap);
      setAvailability(availMap);

      // Fetch blocked dates
      const { data: blockedData } = await supabase
        .from("blocked_dates")
        .select("start_date, end_date")
        .eq("user_id", profile.id)
        .gte("end_date", new Date().toISOString().split('T')[0]); // Only future/current blocks

      if (blockedData) {
        setBlockedDates(blockedData);
        console.log('🚫 Fechas bloqueadas cargadas:', blockedData);
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast({ title: "Error", description: "Error al cargar datos", variant: "destructive" });
      setLoading(false);
    }
  }

  async function fetchBookedSlots() {
    if (!formData.date || !profile) return;
    try {
      // Obtener citas con su servicio para conocer la duración real
      const { data, error } = await supabase
        .from("appointments")
        .select("time, service_id, services(duration)")
        .eq("user_id", profile.id)
        .eq("date", formData.date)
        .in("status", ["pending", "confirmed"]);
      
      if (error) {
        console.error("Error fetching booked slots:", error);
        setBookedSlots([]);
        return;
      }
      
      const slots = (data || []).map((a: any) => {
        const timeStr = a.time;
        // Si viene como "HH:MM:SS", extraer "HH:MM"
        const time = typeof timeStr === 'string' ? timeStr.substring(0, 5) : timeStr;
        // Obtener duración del servicio (o 60 min por defecto)
        const duration = a.services?.duration || 60;
        return { time, duration };
      });
      console.log('🔒 Slots ocupados cargados para', formData.date, ':', slots);
      setBookedSlots(slots);
    } catch (error: any) {
      console.error("Fetch booked slots error:", error);
      setBookedSlots([]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !selectedService || !formData.client_email) return;
    try {
      setSubmitting(true);
      const { data: appointmentData, error } = await supabase.from("appointments").insert([{
          user_id: profile.id,
        service_id: formData.service_id,
          client_name: formData.client_name,
          client_phone: sanitizePhone(formData.client_phone),
          client_email: formData.client_email,
          date: formData.date,
        time: formData.time + ":00",
          status: profile.auto_confirm ? "confirmed" : "pending",
      }]).select().single();
      
      if (error) throw error;
      
      // Enviar emails después de crear la reserva
      if (appointmentData) {
        try {
          // Email al cliente (ahora siempre requerido)
          if (formData.client_email) {
            const clientEmailResponse = await fetch("/api/send-new-reservation-emails", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                appointmentId: appointmentData.id,
                type: "client",
              }),
            });
            
            if (!clientEmailResponse.ok) {
              console.warn("No se pudo enviar email al cliente:", clientEmailResponse.status);
            }
          }
          
          // Email al profesional
          const professionalEmailResponse = await fetch("/api/send-new-reservation-emails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              appointmentId: appointmentData.id,
              type: "professional",
            }),
          });
          
          if (!professionalEmailResponse.ok) {
            console.warn("No se pudo enviar email al profesional:", professionalEmailResponse.status);
          }
        } catch (emailError) {
          console.error("Error enviando emails:", emailError);
          // No fallar el flujo si los emails fallan
        }
      }
      
      toast({ title: "¡Reserva exitosa!", description: "Tu cita ha sido registrada" });
      setStep(4);
    } catch (error: any) {
      console.error("Submit error:", error);
      toast({ title: "Error", description: "No se pudo crear la reserva", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  const handleServiceSelect = (serviceId: string) => {
    setFormData({ ...formData, service_id: serviceId });
    setStep(2);
  };

  const steps = [
    { number: 1, title: "Servicio", desc: "Elige lo que necesitas" },
    { number: 2, title: "Fecha y hora", desc: "Cuándo quieres reservar" },
    { number: 3, title: "Tus datos", desc: "Nombre y teléfono" },
    { number: 4, title: "¡Listo!", desc: "Reserva confirmada" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4"></div><p className="text-slate-600">Cargando...</p></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4"><div className="text-center max-w-md"><h1 className="text-2xl font-bold text-slate-900 mb-4">Profesional no encontrado</h1><p className="text-slate-600 mb-6">El enlace que intentas acceder no existe o ha sido deshabilitado.</p><Link href="/"><Button>Volver al inicio</Button></Link></div></div>
    );
  }

  // Verificar si el profesional tiene suscripción activa
  if (profile.subscription_status === "expired" || profile.subscription_status === "inactive") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Servicio Temporalmente No Disponible</h1>
          <p className="text-slate-600 mb-6">
            El profesional {profile.business_name || profile.name} ha suspendido temporalmente su servicio de reservas.
            Por favor, intenta más tarde o contacta directamente con el profesional.
          </p>
          <Link href="/">
            <Button>Volver al inicio</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-white/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {profile.business_logo_url && (
              <img src={profile.business_logo_url} alt="Logo" className="h-10 w-10 object-cover rounded-lg" />
            )}
            <span className="text-xl font-bold text-slate-900">{profile.business_name || profile.name}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Stepper */}
        <div className="flex items-center justify-center mb-8 px-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center">
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-300", step === s.number ? "text-white shadow-lg scale-110" : step > s.number ? "ring-2" : "bg-slate-100 text-slate-400")}
                    style={step === s.number ? {
                      background: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                    } : step > s.number ? {
                      backgroundColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.1)`,
                      color: `var(--color-primary)`,
                      borderColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`
                    } : {}}
                  >
                    {step > s.number ? <Check className="w-6 h-6" /> : s.number}
                  </div>
                  <span className={cn("text-xs sm:text-sm font-medium transition-colors text-center max-w-[80px]", step === s.number ? "text-slate-900" : "text-slate-500")}>{s.title}</span>
                </div>
                {i < steps.length - 1 && (
                  <div 
                    className={cn("h-1 w-8 sm:w-12 mx-2 sm:mx-3 rounded transition-all duration-300", step > s.number ? "" : "bg-slate-200")}
                    style={step > s.number ? {
                      backgroundColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.3)`
                    } : {}}
                  />
                )}
              </div>
            ))}
          </div>
                        </div>

        {/* Content Card */}
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur shadow-xl overflow-hidden">
          {/* Header del Card */}
          <div className="border-b border-slate-200/70 bg-white/60 backdrop-blur px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt={APP_NAME} className="h-6 w-6 object-contain" />
                <span className="text-sm font-bold text-slate-900">{APP_NAME}</span>
              </div>
              <span className="text-xs text-slate-500">Paso {step} de {totalSteps}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[320px] flex flex-col">
            {/* Step 1: Servicios */}
            {step === 1 && (
              <div className="flex-1">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-slate-900 mb-1">{profile.business_name || profile.name}</h4>
                </div>
                {services.length === 0 ? (
                  <div className="text-center py-8"><Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-600 font-medium">Pronto podrás agendar con este link</p><p className="text-sm text-slate-500 mt-2">El profesional aún no ha configurado sus servicios</p></div>
                ) : (
                  <>
                    {categories.length > 2 && (
                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {categories.map((cat) => (
                          <button 
                            key={cat} 
                            onClick={() => setSelectedCategory(cat)} 
                            className={cn("px-3 py-1 rounded-full text-xs font-medium transition-all shadow-md", selectedCategory === cat ? "text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}
                            style={selectedCategory === cat ? {
                              backgroundColor: "var(--color-primary)"
                            } : {}}
                          >
                            {cat === "all" ? "Todos" : cat}
                          </button>
                        ))}
                      </div>
                    )}
                    <h5 className="font-semibold text-slate-900 mb-3">Elige tu servicio</h5>
                    <div className="space-y-3">
                      {filteredServices.map((service) => (
                        <button 
                          key={service.id} 
                          onClick={() => handleServiceSelect(service.id)} 
                          className="w-full rounded-lg border-2 border-slate-200 bg-white p-3 hover:shadow-md transition-all"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.5)`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "rgb(226, 232, 240)";
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <div className="font-medium text-slate-900">{service.name}</div>
                              <div className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                {service.duration} min
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-slate-900">{formatCurrency(service.price)}</div>
                              <ChevronRight className="w-5 h-5 text-slate-400" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 2: Fecha y Hora */}
            {step === 2 && selectedService && (
              <div className="flex-1 space-y-5">
                {/* Resumen del servicio */}
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl p-3 border"
                  style={{
                    background: `linear-gradient(to bottom right, rgba(var(--color-primary-rgb, 16, 185, 129), 0.1), rgba(var(--color-primary-rgb, 16, 185, 129), 0.05), rgba(var(--color-accent-rgb, 132, 204, 22), 0.1))`,
                    borderColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center">
                        <Sparkles className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{selectedService.name}</p>
                        <p className="text-xs text-slate-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {selectedService.duration} min
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>{formatCurrency(selectedService.price)}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Mini Calendario */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h6 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                        Selecciona tu fecha
                      </h6>
                      {formData.date && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, date: "", time: "" })}
                          className="text-xs text-slate-500 transition-colors"
                          onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
                          onMouseLeave={(e) => e.currentTarget.style.color = "rgb(100, 116, 139)"}
                        >
                          Cambiar
                        </button>
                      )}
                    </div>
                    {/* Mostrar mes actual */}
                    <p className="text-xs text-slate-500">
                      {(() => {
                        const today = new Date();
                        const offsetDate = new Date(today);
                        offsetDate.setDate(today.getDate() + (calendarWeekOffset * 14));
                        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
                        return `${monthNames[offsetDate.getMonth()]} ${offsetDate.getFullYear()}`;
                      })()}
                    </p>
                  </div>

                  {/* Selector de días (14 días por página) */}
                  <div className="grid grid-cols-7 gap-1.5">
                    {(() => {
                      const days = [];
                      const today = new Date();
                      const startOffset = calendarWeekOffset * 14;
                      
                      for (let i = 0; i < 14; i++) {
                        const date = new Date(today);
                        date.setDate(today.getDate() + startOffset + i);
                        const dateStr = date.toISOString().split("T")[0];
                        const dayOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][date.getDay()];

                        // Check if date is blocked
                        const isBlocked = blockedDates.some(block => {
                          return dateStr >= block.start_date && dateStr <= block.end_date;
                        });

                        const hasAvailability = !isBlocked && availability[dayOfWeek] && availability[dayOfWeek].length > 0;
                        const dayName = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][date.getDay()];
                        const isSelected = formData.date === dateStr;
                        const isToday = startOffset + i === 0;
                        
                        days.push(
                          <motion.button
                            key={dateStr}
                            type="button"
                            onClick={() => hasAvailability ? setFormData({ ...formData, date: dateStr, time: "" }) : null}
                            disabled={!hasAvailability}
                            whileHover={hasAvailability ? { scale: 1.05 } : {}}
                            whileTap={hasAvailability ? { scale: 0.95 } : {}}
                            className={cn(
                              "relative p-2 rounded-lg text-center transition-all duration-200",
                              isSelected && "text-white shadow-lg ring-2",
                              !isSelected && hasAvailability && "bg-white border border-slate-200 hover:shadow-md text-slate-700",
                              !hasAvailability && "bg-slate-50 text-slate-300 cursor-not-allowed",
                              isToday && !isSelected && "ring-2"
                            )}
                            style={isSelected ? {
                              background: `linear-gradient(to bottom right, var(--color-primary), var(--color-accent))`,
                              borderColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`
                            } : isToday && !isSelected ? {
                              borderColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`
                            } : {}}
                            onMouseEnter={(e) => {
                              if (!isSelected && hasAvailability) {
                                e.currentTarget.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.5)`;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected && hasAvailability) {
                                e.currentTarget.style.borderColor = "rgb(226, 232, 240)";
                              }
                            }}
                          >
                            <div className={cn("text-[10px] font-medium mb-0.5", isSelected ? "text-white/80" : "text-slate-500")}>
                              {dayName}
                            </div>
                            <div className={cn("text-sm font-bold", isSelected && "text-white")}>
                              {date.getDate()}
                            </div>
                            {hasAvailability && !isSelected && (
                              <div 
                                className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                                style={{ backgroundColor: "var(--color-primary)" }}
                              ></div>
                            )}
                          </motion.button>
                        );
                      }
                      return days;
                    })()}
                  </div>

                  {/* Navegación de calendario */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCalendarWeekOffset(Math.max(0, calendarWeekOffset - 1))}
                      disabled={calendarWeekOffset === 0}
                      className="h-8 px-3 text-xs"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                    <span className="text-xs text-slate-500">
                      {calendarWeekOffset === 0 ? "Esta semana" : `+${calendarWeekOffset * 14} días`}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setCalendarWeekOffset(calendarWeekOffset + 1)}
                      className="h-8 px-3 text-xs"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  <input type="hidden" id="date" name="date" value={formData.date} required />
                </div>

                {/* Horarios disponibles */}
                <AnimatePresence mode="wait">
                  {formData.date && (
                    <motion.div
                      key={formData.date}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <h6 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <Clock className="w-4 h-4" style={{ color: "var(--color-primary)" }} />
                          Elige tu horario
                        </h6>
                        {formData.time && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, time: "" })}
                            className="text-xs text-slate-500 transition-colors"
                            onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "rgb(100, 116, 139)"}
                          >
                            Cambiar
                          </button>
                        )}
                    </div>

                      <input type="hidden" id="time" name="time" value={formData.time} required />
                      
                      {getAvailableTimeSlots().length > 0 ? (
                        <div className="space-y-4">
                          {groupedTimeSlots.morning.length > 0 && (
                    <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                                  <span className="text-xs">🌅</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-700">Mañana</span>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {groupedTimeSlots.morning.map((time) => (
                                  <motion.button
                                    key={time}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, time })}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                      "relative py-2.5 rounded-lg text-xs font-semibold transition-all duration-200",
                                      formData.time === time
                                        ? "text-white shadow-lg ring-2"
                                        : "bg-white border-2 border-slate-200 text-slate-700 hover:shadow-md"
                                    )}
                                    style={formData.time === time ? {
                                      background: `linear-gradient(to bottom right, var(--color-primary), var(--color-accent))`,
                                      borderColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`
                                    } : {}}
                                    onMouseEnter={(e) => {
                                      if (formData.time !== time) {
                                        e.currentTarget.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.5)`;
                                        e.currentTarget.style.backgroundColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.05)`;
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (formData.time !== time) {
                                        e.currentTarget.style.borderColor = "rgb(226, 232, 240)";
                                        e.currentTarget.style.backgroundColor = "white";
                                      }
                                    }}
                                  >
                                    {time}
                                    {formData.time === time && (
                                      <motion.div
                                        layoutId="time-selected"
                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center"
                                      >
                                        <Check className="w-3 h-3" style={{ color: "var(--color-primary)" }} />
                                      </motion.div>
                                    )}
                                  </motion.button>
                                ))}
                    </div>
                  </div>
                          )}
                          
                          {groupedTimeSlots.afternoon.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center">
                                  <span className="text-xs">☀️</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-700">Tarde</span>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {groupedTimeSlots.afternoon.map((time) => (
                                  <motion.button
                                    key={time}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, time })}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                      "relative py-2.5 rounded-lg text-xs font-semibold transition-all duration-200",
                                      formData.time === time
                                        ? "text-white shadow-lg ring-2"
                                        : "bg-white border-2 border-slate-200 text-slate-700 hover:shadow-md"
                                    )}
                                    style={formData.time === time ? {
                                      background: `linear-gradient(to bottom right, var(--color-primary), var(--color-accent))`,
                                      borderColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`
                                    } : {}}
                                    onMouseEnter={(e) => {
                                      if (formData.time !== time) {
                                        e.currentTarget.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.5)`;
                                        e.currentTarget.style.backgroundColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.05)`;
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (formData.time !== time) {
                                        e.currentTarget.style.borderColor = "rgb(226, 232, 240)";
                                        e.currentTarget.style.backgroundColor = "white";
                                      }
                                    }}
                                  >
                                    {time}
                                    {formData.time === time && (
                                      <motion.div
                                        layoutId="time-selected"
                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center"
                                      >
                                        <Check className="w-3 h-3" style={{ color: "var(--color-primary)" }} />
                                      </motion.div>
                                    )}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {groupedTimeSlots.evening.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-md bg-indigo-100 flex items-center justify-center">
                                  <span className="text-xs">🌙</span>
                                </div>
                                <span className="text-xs font-semibold text-slate-700">Noche</span>
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {groupedTimeSlots.evening.map((time) => (
                                  <motion.button
                                    key={time}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, time })}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={cn(
                                      "relative py-2.5 rounded-lg text-xs font-semibold transition-all duration-200",
                                      formData.time === time
                                        ? "text-white shadow-lg ring-2"
                                        : "bg-white border-2 border-slate-200 text-slate-700 hover:shadow-md"
                                    )}
                                    style={formData.time === time ? {
                                      background: `linear-gradient(to bottom right, var(--color-primary), var(--color-accent))`,
                                      borderColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`
                                    } : {}}
                                    onMouseEnter={(e) => {
                                      if (formData.time !== time) {
                                        e.currentTarget.style.borderColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.5)`;
                                        e.currentTarget.style.backgroundColor = `rgba(var(--color-primary-rgb, 16, 185, 129), 0.05)`;
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      if (formData.time !== time) {
                                        e.currentTarget.style.borderColor = "rgb(226, 232, 240)";
                                        e.currentTarget.style.backgroundColor = "white";
                                      }
                                    }}
                                  >
                                    {time}
                                    {formData.time === time && (
                                      <motion.div
                                        layoutId="time-selected"
                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center"
                                      >
                                        <Check className="w-3 h-3" style={{ color: "var(--color-primary)" }} />
                                      </motion.div>
                                    )}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl text-center"
                        >
                          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
                            <span className="text-2xl">📅</span>
                          </div>
                          <p className="text-sm text-amber-800 font-semibold mb-1">
                            Sin horarios disponibles
                          </p>
                          <p className="text-xs text-amber-600">
                            Prueba con otra fecha
                          </p>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botón para volver */}
                <motion.button
                  onClick={() => { 
                    setStep(1); 
                    setFormData({ ...formData, date: "", time: "" }); 
                  }}
                  whileHover={{ x: -2 }}
                  className="flex items-center gap-2 text-xs text-slate-600 transition-colors font-medium pt-2 border-t border-slate-200"
                  onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"}
                  onMouseLeave={(e) => e.currentTarget.style.color = "rgb(71, 85, 105)"}
                >
                  <ChevronLeft className="w-3 h-3" />
                  Cambiar servicio
                </motion.button>
              </div>
            )}

            {/* Step 3: Datos */}
            {step === 3 && selectedService && (
              <div className="flex-1">
                <h5 className="font-semibold text-slate-900 mb-4">Completa tus datos</h5>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {formData.date && formData.time && (
                    <div 
                      className="rounded-lg p-2 text-xs space-y-1 border"
                      style={{
                        backgroundColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.1)`,
                        borderColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.2)`
                      }}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{selectedService.name}</span>
                        <span style={{ color: "var(--color-primary)" }}>{formatCurrency(selectedService.price)}</span>
                      </div>
                      <div className="text-slate-600">{formatDateFriendly(formData.date)} · {formData.time}</div>
                    </div>
                  )}
                  <div><label htmlFor="client_name" className="text-xs font-medium text-slate-700 block mb-1">Nombre</label><Input id="client_name" name="client_name" placeholder="Tu nombre completo" value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} required className="h-10" /></div>
                  <div><label htmlFor="client_email" className="text-xs font-medium text-slate-700 block mb-1">Email</label><Input id="client_email" name="client_email" type="email" placeholder="tu@email.com" value={formData.client_email} onChange={(e) => setFormData({ ...formData, client_email: e.target.value })} required className="h-10" /></div>
                  <div><label htmlFor="client_phone" className="text-xs font-medium text-slate-700 block mb-1">Teléfono</label><Input id="client_phone" name="client_phone" type="tel" placeholder="+56 9 1234 5678" value={formData.client_phone} onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })} required className="h-10" /></div>
                </form>
              </div>
              )}

            {/* Step 4: Confirmación */}
            {step === 4 && selectedService && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.1)`
                  }}
                >
                  <Check className="w-8 h-8" style={{ color: "var(--color-primary)" }} />
                </div>
                <h5 className="text-xl font-bold text-slate-900 mb-2">¡Reserva confirmada!</h5>
                <p className="text-sm text-slate-600 mb-4">{profile.auto_confirm ? "Tu cita ha sido confirmada automáticamente" : "Recibirás confirmación pronto"}</p>
                <div className="w-full bg-slate-50 rounded-lg p-4 text-left"><div className="text-xs text-slate-600 space-y-1"><div><span className="font-medium">Servicio:</span> {selectedService.name}</div><div><span className="font-medium">Duración:</span> {selectedService.duration} min</div><div><span className="font-medium">Fecha:</span> {formatDateFriendly(formData.date)}, {formData.time}</div><div><span className="font-medium">Cliente:</span> {formData.client_name}</div><div><span className="font-medium">Email:</span> {formData.client_email}</div><div><span className="font-medium">Total:</span> {formatCurrency(selectedService.price)}</div></div></div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || step === 4} className="text-sm">Anterior</Button>
              {step < 3 ? (
                <Button 
                  size="sm" 
                  onClick={() => setStep(Math.min(totalSteps, step + 1))} 
                  disabled={(step === 1 && !formData.service_id) || (step === 2 && (!formData.date || !formData.time))} 
                  className="text-white text-sm disabled:opacity-50"
                  style={{
                    background: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                  }}
                >
                  Siguiente<ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : step === 3 ? (
                <Button 
                  size="sm" 
                  onClick={handleSubmit} 
                  disabled={submitting || !formData.client_name || !formData.client_email || !formData.client_phone} 
                  className="text-white text-sm disabled:opacity-50"
                  style={{
                    background: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                  }}
                >
                  {submitting ? "Reservando..." : "Confirmar"}
                </Button>
              ) : (
                <Button size="sm" onClick={() => { setStep(1); setFormData({ client_name: "", client_phone: "", client_email: "", service_id: "", date: "", time: "" }); }} variant="outline" className="text-sm">Nueva reserva</Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <p className="text-center text-sm text-slate-600 mt-6">{steps[step - 1].desc}</p>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4"><img src="/logo.png" alt={APP_NAME} className="h-6 w-6 object-contain" /><p className="text-sm text-slate-600">Agenda powered by <Link href="/" className="hover:underline font-semibold" style={{ color: "var(--color-primary)" }} onMouseEnter={(e) => e.currentTarget.style.color = "var(--color-primary)"} onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-primary)"}>{APP_NAME}</Link></p></div>
          <p className="text-xs text-slate-500">© 2025 {APP_NAME}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
