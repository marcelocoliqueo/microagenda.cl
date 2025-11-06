"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle, Sparkles, Check, ChevronRight, User, Phone as PhoneIcon } from "lucide-react";
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
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Stepper y formulario
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    service_id: "",
    date: "",
    time: "",
  });

  const selectedService = services.find(s => s.id === formData.service_id);

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

  // Horarios disponibles
  const getAvailableTimeSlots = (): string[] => {
    if (!formData.date) return [];
    const dayName = getDayName(formData.date);
    const dayAvailability = availability[dayName];
    if (!dayAvailability || dayAvailability.length === 0) return [];
    const serviceDuration = selectedService?.duration;
    const availableSlots = generateAvailableSlots(dayAvailability, 30, serviceDuration);
    return availableSlots.filter(slot => !bookedSlots.includes(slot));
  };

  // Agrupar horarios por período
  const groupedTimeSlots = useMemo(() => {
    const slots = getAvailableTimeSlots();
    const morning: string[] = [];
    const afternoon: string[] = [];
    const evening: string[] = [];
    slots.forEach(slot => {
      const [hour] = slot.split(':').map(Number);
      if (hour < 12) morning.push(slot);
      else if (hour < 18) afternoon.push(slot);
      else evening.push(slot);
    });
    return { morning, afternoon, evening };
  }, [formData.date, bookedSlots, availability, selectedService]);

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
      if (profileError || !profile) {
        toast({ title: "Error", description: "Profesional no encontrado", variant: "destructive" });
        return;
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
      setAvailability(availMap);
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
      const { data } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("user_id", profile.id)
        .eq("appointment_date", formData.date)
        .neq("status", "cancelled");
      const slots = (data || []).map((a: any) => a.appointment_time.substring(0, 5));
      setBookedSlots(slots);
    } catch (error: any) {
      console.error("Fetch booked slots error:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile || !selectedService) return;
    try {
      setSubmitting(true);
      const { error } = await supabase.from("appointments").insert([{
        user_id: profile.id,
        service_id: formData.service_id,
        client_name: formData.client_name,
        client_phone: sanitizePhone(formData.client_phone),
        appointment_date: formData.date,
        appointment_time: formData.time + ":00",
        status: profile.auto_confirm ? "confirmed" : "pending",
      }]);
      if (error) throw error;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200/70 bg-white/60 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {(profile.business_logo_url || profile.photo_url) && (
              <img src={profile.business_logo_url || profile.photo_url || ''} alt="Logo" className="h-10 w-10 object-cover rounded-lg" />
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
                  <div className={cn("w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-300", step === s.number ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-110" : step > s.number ? "bg-primary/10 text-primary ring-2 ring-primary/20" : "bg-slate-100 text-slate-400")}>
                    {step > s.number ? <Check className="w-6 h-6" /> : s.number}
                  </div>
                  <span className={cn("text-xs sm:text-sm font-medium transition-colors text-center max-w-[80px]", step === s.number ? "text-slate-900" : "text-slate-500")}>{s.title}</span>
                </div>
                {i < steps.length - 1 && <div className={cn("h-1 w-8 sm:w-12 mx-2 sm:mx-3 rounded transition-all duration-300", step > s.number ? "bg-primary/30" : "bg-slate-200")} />}
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
                  {profile.bio && <p className="text-sm text-slate-600">{profile.bio}</p>}
                </div>
                {services.length === 0 ? (
                  <div className="text-center py-8"><Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" /><p className="text-slate-600 font-medium">Pronto podrás agendar con este link</p><p className="text-sm text-slate-500 mt-2">El profesional aún no ha configurado sus servicios</p></div>
                ) : (
                  <>
                    {categories.length > 2 && (
                      <div className="flex flex-wrap gap-2 justify-center mb-4">
                        {categories.map((cat) => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={cn("px-3 py-1 rounded-full text-xs font-medium transition-all", selectedCategory === cat ? "bg-primary text-white shadow-md" : "bg-slate-100 text-slate-700 hover:bg-slate-200")}>{cat === "all" ? "Todos" : cat}</button>))}
                      </div>
                    )}
                    <h5 className="font-semibold text-slate-900 mb-3">Elige tu servicio</h5>
                    <div className="space-y-3">
                      {filteredServices.map((service) => (<button key={service.id} onClick={() => handleServiceSelect(service.id)} className="w-full rounded-lg border-2 border-slate-200 bg-white p-3 hover:border-primary/50 hover:shadow-md transition-all"><div className="flex items-center justify-between"><div className="text-left"><div className="font-medium text-slate-900">{service.name}</div><div className="text-xs text-slate-600 flex items-center gap-1 mt-1"><Clock className="w-3 h-3" />{service.duration} min</div></div><div className="flex items-center gap-2"><div className="font-bold text-slate-900">{formatCurrency(service.price)}</div><ChevronRight className="w-5 h-5 text-slate-400" /></div></div></button>))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 2: Fecha y Hora */}
            {step === 2 && selectedService && (
              <div className="flex-1">
                <h5 className="font-semibold text-slate-900 mb-3">Selecciona fecha y hora</h5>
                <div className="space-y-4">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-2 text-xs">
                    <div className="flex items-center justify-between"><span className="font-medium text-slate-900">{selectedService.name}</span><span className="text-slate-600">{formatCurrency(selectedService.price)}</span></div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1.5">Fecha</label>
                    <input type="date" id="date" name="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })} min={new Date().toISOString().split("T")[0]} required className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
                  </div>
                  {formData.date && (
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-700 block">Hora</label>
                      <input type="hidden" id="time" name="time" value={formData.time} required />
                      {getAvailableTimeSlots().length > 0 ? (
                        <div className="space-y-3">
                          {groupedTimeSlots.morning.length > 0 && (<div><h6 className="text-xs font-semibold text-slate-600 mb-2">Mañana</h6><div className="grid grid-cols-3 gap-1.5">{groupedTimeSlots.morning.map((time) => (<button key={time} type="button" onClick={() => setFormData({ ...formData, time })} className={cn("px-2 py-2 rounded-lg text-xs font-medium transition-all", formData.time === time ? "bg-primary text-white shadow-md" : "border border-slate-200 hover:bg-slate-50 text-slate-700")}>{time}</button>))}</div></div>)}
                          {groupedTimeSlots.afternoon.length > 0 && (<div><h6 className="text-xs font-semibold text-slate-600 mb-2">Tarde</h6><div className="grid grid-cols-3 gap-1.5">{groupedTimeSlots.afternoon.map((time) => (<button key={time} type="button" onClick={() => setFormData({ ...formData, time })} className={cn("px-2 py-2 rounded-lg text-xs font-medium transition-all", formData.time === time ? "bg-primary text-white shadow-md" : "border border-slate-200 hover:bg-slate-50 text-slate-700")}>{time}</button>))}</div></div>)}
                          {groupedTimeSlots.evening.length > 0 && (<div><h6 className="text-xs font-semibold text-slate-600 mb-2">Noche</h6><div className="grid grid-cols-3 gap-1.5">{groupedTimeSlots.evening.map((time) => (<button key={time} type="button" onClick={() => setFormData({ ...formData, time })} className={cn("px-2 py-2 rounded-lg text-xs font-medium transition-all", formData.time === time ? "bg-primary text-white shadow-md" : "border border-slate-200 hover:bg-slate-50 text-slate-700")}>{time}</button>))}</div></div>)}
                        </div>
                      ) : (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center"><p className="text-sm text-amber-700">No hay horarios disponibles para este día</p></div>
                      )}
                    </div>
                  )}
                  <button onClick={() => { setStep(1); setFormData({ ...formData, date: "", time: "" }); }} className="text-xs text-primary hover:underline flex items-center gap-1 font-medium mt-2">← Cambiar servicio</button>
                </div>
              </div>
            )}

            {/* Step 3: Datos */}
            {step === 3 && selectedService && (
              <div className="flex-1">
                <h5 className="font-semibold text-slate-900 mb-4">Completa tus datos</h5>
                <form onSubmit={handleSubmit} className="space-y-3">
                  {formData.date && formData.time && (<div className="rounded-lg bg-primary/5 border border-primary/20 p-2 text-xs space-y-1"><div className="flex justify-between"><span className="font-medium">{selectedService.name}</span><span>{formatCurrency(selectedService.price)}</span></div><div className="text-slate-600">{formatDateFriendly(formData.date)} · {formData.time}</div></div>)}
                  <div><label htmlFor="client_name" className="text-xs font-medium text-slate-700 block mb-1">Nombre</label><Input id="client_name" name="client_name" placeholder="Tu nombre completo" value={formData.client_name} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} required className="h-10" /></div>
                  <div><label htmlFor="client_phone" className="text-xs font-medium text-slate-700 block mb-1">Teléfono</label><Input id="client_phone" name="client_phone" type="tel" placeholder="+56 9 1234 5678" value={formData.client_phone} onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })} required className="h-10" /></div>
                </form>
              </div>
            )}

            {/* Step 4: Confirmación */}
            {step === 4 && selectedService && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"><Check className="w-8 h-8 text-primary" /></div>
                <h5 className="text-xl font-bold text-slate-900 mb-2">¡Reserva confirmada!</h5>
                <p className="text-sm text-slate-600 mb-4">{profile.auto_confirm ? "Tu cita ha sido confirmada automáticamente" : "Recibirás confirmación pronto"}</p>
                <div className="w-full bg-slate-50 rounded-lg p-4 text-left"><div className="text-xs text-slate-600 space-y-1"><div><span className="font-medium">Servicio:</span> {selectedService.name}</div><div><span className="font-medium">Duración:</span> {selectedService.duration} min</div><div><span className="font-medium">Fecha:</span> {formatDateFriendly(formData.date)}, {formData.time}</div><div><span className="font-medium">Cliente:</span> {formData.client_name}</div><div><span className="font-medium">Total:</span> {formatCurrency(selectedService.price)}</div></div></div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <Button variant="outline" size="sm" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1 || step === 4} className="text-sm">Anterior</Button>
              {step < 3 ? (
                <Button size="sm" onClick={() => setStep(Math.min(totalSteps, step + 1))} disabled={(step === 1 && !formData.service_id) || (step === 2 && (!formData.date || !formData.time))} className="bg-gradient-to-r from-primary to-accent text-white text-sm disabled:opacity-50">Siguiente<ChevronRight className="w-4 h-4 ml-1" /></Button>
              ) : step === 3 ? (
                <Button size="sm" onClick={handleSubmit} disabled={submitting || !formData.client_name || !formData.client_phone} className="bg-gradient-to-r from-primary to-accent text-white text-sm disabled:opacity-50">{submitting ? "Reservando..." : "Confirmar"}</Button>
              ) : (
                <Button size="sm" onClick={() => { setStep(1); setFormData({ client_name: "", client_phone: "", service_id: "", date: "", time: "" }); }} variant="outline" className="text-sm">Nueva reserva</Button>
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
          <div className="flex items-center justify-center gap-2 mb-4"><img src="/logo.png" alt={APP_NAME} className="h-6 w-6 object-contain" /><p className="text-sm text-slate-600">Agenda powered by <Link href="/" className="text-primary hover:underline font-semibold">{APP_NAME}</Link></p></div>
          <p className="text-xs text-slate-500">© 2025 {APP_NAME}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
