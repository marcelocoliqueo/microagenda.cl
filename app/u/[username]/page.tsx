"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle, Sparkles, Star, Phone, Mail } from "lucide-react";
import Link from "next/link";
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
import { useToast } from "@/components/ui/use-toast";
import { supabase, type Profile, type Service } from "@/lib/supabaseClient";
import { formatCurrency, formatDate, formatDateFriendly, generateTimeSlots, generateAvailableSlots, getDayName, sanitizePhone } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { InlineDatePicker } from "@/components/InlineDatePicker";
import { cn } from "@/lib/utils";

export default function PublicAgendaPage() {
  const params = useParams();
  const username = params?.username as string;
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [availability, setAvailability] = useState<Record<string, Array<{ start: string; end: string }>>>({});
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    service_id: "",
    date: "",
    time: "",
  });

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const cats = new Set<string>();
    services.forEach(service => {
      cats.add(service.category || "General");
    });
    return ["all", ...Array.from(cats).sort()];
  }, [services]);

  // Filtrar servicios por categoría
  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return services;
    return services.filter(s => (s.category || "General") === selectedCategory);
  }, [services, selectedCategory]);

  // Calcular horarios disponibles basados en configuración
  const getAvailableTimeSlots = (): string[] => {
    if (!formData.date) return [];

    const dayName = getDayName(formData.date);
    const dayAvailability = availability[dayName];

    if (!dayAvailability || dayAvailability.length === 0) {
      console.log(`❌ Día ${dayName} sin disponibilidad configurada`);
      return []; // Día no disponible
    }

    // Obtener duración del servicio seleccionado si existe
    const selectedService = services.find(s => s.id === formData.service_id);
    const serviceDuration = selectedService?.duration;

    // Debug: log de bloques y duración con estructura completa
    console.log(`📋 Bloques para ${dayName}:`, JSON.stringify(dayAvailability, null, 2));
    console.log(`⏱️ Duración del servicio:`, serviceDuration);
    console.log(`🔍 Servicio seleccionado:`, selectedService ? {
      id: selectedService.id,
      name: selectedService.name,
      duration: selectedService.duration
    } : 'NINGUNO');

    // Generar slots usando los bloques exactos configurados
    const availableSlots = generateAvailableSlots(dayAvailability, 30, serviceDuration);
    
    console.log(`✅ Slots generados:`, availableSlots);
    console.log(`🚫 Slots ocupados:`, bookedSlots);
    
    // Filtrar horarios ya reservados
    const filtered = availableSlots.filter(slot => !bookedSlots.includes(slot));
    console.log(`🎯 Slots finales disponibles:`, filtered);
    
    return filtered;
  };

  useEffect(() => {
    if (username) {
      fetchProfessionalData();
    }
  }, [username]);

  async function fetchProfessionalData() {
    if (!username) return;

    try {
      setLoading(true);

      // Find profile by username
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (profileError || !profile) {
        toast({
          title: "Error",
          description: "Profesional no encontrado. Verifica que el enlace sea correcto.",
          variant: "destructive",
        });
        return;
      }

      const professionalProfile = profile;
      setProfile(professionalProfile);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", professionalProfile.id)
        .order("category")
        .order("created_at", { ascending: true });

      if (servicesError) throw servicesError;

      setServices(servicesData || []);

      // Fetch availability
      const { data: availabilityData, error: availabilityError } = await supabase
        .from("availability")
        .select("*")
        .eq("user_id", professionalProfile.id)
        .eq("enabled", true)
        .order("day_of_week")
        .order("start_time");

      if (!availabilityError && availabilityData) {
        // Agrupar por día
        const availabilityMap: Record<string, Array<{ start: string; end: string }>> = {};
        availabilityData.forEach((item) => {
          const day = item.day_of_week;
          if (!availabilityMap[day]) {
            availabilityMap[day] = [];
          }
          // Extraer solo HH:mm del formato TIME de PostgreSQL
          // Supabase puede devolver TIME como string "HH:mm:ss" o como objeto
          let startStr = '';
          let endStr = '';
          
          if (typeof item.start_time === 'string') {
            startStr = item.start_time.substring(0, 5);
          } else if (item.start_time) {
            // Si es un objeto, intentar extraer como string
            const startTimeStr = String(item.start_time);
            startStr = startTimeStr.substring(0, 5);
          }
          
          if (typeof item.end_time === 'string') {
            endStr = item.end_time.substring(0, 5);
          } else if (item.end_time) {
            const endTimeStr = String(item.end_time);
            endStr = endTimeStr.substring(0, 5);
          }
          
          // Validar formato HH:mm
          if (!startStr.match(/^\d{2}:\d{2}$/) || !endStr.match(/^\d{2}:\d{2}$/)) {
            console.warn(`⚠️ Formato de tiempo inválido para ${day}:`, {
              start_time: item.start_time,
              end_time: item.end_time,
              startStr,
              endStr
            });
            return; // Saltar este bloque
          }
          
          availabilityMap[day].push({
            start: startStr,
            end: endStr,
          });
        });
        
        // Debug: log de disponibilidad cargada con detalles completos
        console.log('📅 Disponibilidad cargada:', JSON.parse(JSON.stringify(availabilityMap)));
        setAvailability(availabilityMap);
      }
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Cargar horarios ocupados cuando se selecciona una fecha
  useEffect(() => {
    if (formData.date && profile) {
      fetchBookedSlots(formData.date, profile.id);
    } else {
      setBookedSlots([]);
    }
  }, [formData.date, profile]);

  async function fetchBookedSlots(date: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select("time")
        .eq("user_id", userId)
        .eq("date", date)
        .in("status", ["pending", "confirmed"]);

      if (error) throw error;

      const booked = (data || []).map(apt => apt.time.substring(0, 5));
      setBookedSlots(booked);
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      setBookedSlots([]);
    }
  }

  // Seleccionar servicio desde tarjeta
  const handleServiceSelect = (serviceId: string) => {
    setFormData({ ...formData, service_id: serviceId });
    // Scroll suave al formulario
    const formElement = document.getElementById("booking-form");
    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!profile) return;

    // Mostrar resumen antes de confirmar
    if (!showSummary) {
      setShowSummary(true);
      return;
    }

    // Confirmar reserva
    try {
      setLoading(true);

      // Create appointment
      const { error } = await supabase.from("appointments").insert([
        {
          user_id: profile.id,
          client_name: formData.client_name,
          client_phone: sanitizePhone(formData.client_phone),
          service_id: formData.service_id,
          date: formData.date,
          time: formData.time,
          status: profile.auto_confirm ? "confirmed" : "pending",
        },
      ]);

      if (error) throw error;

      // Show success
      setBookingSuccess(true);

      // Reset form
      setFormData({
        client_name: "",
        client_phone: "",
        service_id: "",
        date: "",
        time: "",
      });
      setShowSummary(false);
      setSelectedCategory("all");

      toast({
        title: "¡Reserva exitosa!",
        description: profile.auto_confirm
          ? "Tu cita ha sido confirmada automáticamente"
          : "Recibirás una confirmación pronto",
      });
    } catch (error: any) {
      console.error("Booking error:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la reserva",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md shadow-xl">
          <CardHeader>
            <CardTitle>Profesional no encontrado</CardTitle>
            <CardDescription>
              El profesional que buscas no existe o su agenda no está disponible
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md shadow-xl">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-2xl">¡Reserva Exitosa!</CardTitle>
              <CardDescription className="text-base">
                {profile.auto_confirm
                  ? "Tu cita ha sido confirmada automáticamente"
                  : "Recibirás una confirmación pronto"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-center text-slate-600">
                  Te hemos enviado un recordatorio por email. Si tienes alguna duda, contacta
                  directamente con {profile.business_name || profile.name}.
                </p>
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent hover:brightness-110"
                  onClick={() => setBookingSuccess(false)}
                >
                  Hacer otra reserva
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const selectedService = services.find(s => s.id === formData.service_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header mejorado */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {profile.business_logo_url ? (
              <img 
                src={profile.business_logo_url}
                alt={`${profile.business_name || profile.name} Logo`}
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-lg"
              />
            ) : (
              profile.photo_url && (
                <img 
                  src={profile.photo_url}
                  alt={`${profile.business_name || profile.name}`}
                  className="h-10 w-10 sm:h-12 sm:w-12 object-cover rounded-full"
                />
              )
            )}
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {profile.business_name || profile.name}
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-transparent py-16">
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,transparent)]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {profile.business_logo_url && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-8 flex justify-center"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-2xl blur-xl"></div>
                  <img
                    src={profile.business_logo_url}
                    alt={`${profile.business_name || profile.name} Logo`}
                    className="relative h-32 w-auto object-contain max-w-xs rounded-2xl shadow-lg"
                  />
                </div>
              </motion.div>
            )}
            <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              {profile.business_name || profile.name}
            </h1>
            {profile.bio && (
              <p className="text-lg text-slate-600 max-w-2xl mx-auto mt-4 leading-relaxed">
                {profile.bio}
              </p>
            )}
            {profile.auto_confirm && (
              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm text-green-700">
                <Sparkles className="w-4 h-4" />
                <span>Confirmación instantánea</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Services Section con categorías */}
        {services.length > 0 && (
          <section className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Nuestros Servicios
                </h2>
                <p className="text-slate-600">Elige el servicio que mejor se adapte a tus necesidades</p>
              </div>

              {/* Categorías */}
              {categories.length > 2 && (
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setFormData({ ...formData, service_id: "" });
                      }}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all",
                        selectedCategory === category
                          ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg scale-105"
                          : "bg-white border border-slate-200 text-slate-700 hover:border-primary/50 hover:shadow-md"
                      )}
                    >
                      {category === "all" ? "Todos" : category}
                    </button>
                  ))}
                </div>
              )}

              {/* Tarjetas de servicios mejoradas */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service, index) => {
                  const isSelected = formData.service_id === service.id;
                  return (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <Card
                        className={cn(
                          "cursor-pointer transition-all duration-300 h-full",
                          "hover:shadow-xl hover:scale-[1.02] hover:border-primary/50",
                          isSelected
                            ? "border-2 border-primary shadow-xl bg-gradient-to-br from-primary/5 to-accent/5 scale-[1.02]"
                            : "border border-slate-200 hover:border-slate-300"
                        )}
                        onClick={() => handleServiceSelect(service.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between mb-2">
                            <CardTitle className="text-xl font-bold text-slate-900 pr-2">
                              {service.name}
                            </CardTitle>
                            {isSelected && (
                              <div className="flex-shrink-0">
                                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              </div>
                            )}
                          </div>
                          {service.category && service.category !== "General" && (
                            <span className="inline-block px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full">
                              {service.category}
                            </span>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">{service.duration} min</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                {formatCurrency(service.price)}
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-4 pt-4 border-t border-primary/20"
                            >
                              <p className="text-sm text-primary font-medium flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Seleccionado
                              </p>
                            </motion.div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </section>
        )}

        {/* Booking Form mejorado */}
        <section id="booking-form">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-xl border-slate-200 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 p-6 border-b border-slate-200">
                <CardHeader className="p-0">
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    Reservar una cita
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Completa tus datos y selecciona fecha y hora
                  </CardDescription>
                </CardHeader>
              </div>
              <CardContent className="p-6">
                {services.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <Calendar className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">
                      Pronto podrás agendar con este link
                    </h3>
                    <p className="text-slate-600 max-w-md mx-auto mb-2">
                      {profile.business_name || profile.name} está configurando sus servicios. 
                      Muy pronto podrás agendar tu cita aquí.
                    </p>
                    <p className="text-sm text-slate-500">
                      Si tienes dudas, contacta directamente con el profesional.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Servicio seleccionado destacado */}
                    {selectedService && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border-2 border-primary/20"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-slate-600 mb-1">Servicio seleccionado</p>
                            <p className="font-bold text-slate-900">{selectedService.name}</p>
                            <p className="text-sm text-slate-500 mt-1 flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {selectedService.duration} min
                              </span>
                              <span className="font-semibold text-primary">
                                {formatCurrency(selectedService.price)}
                              </span>
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setFormData({ ...formData, service_id: "" })}
                          >
                            Cambiar
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="client_name" className="text-base font-medium">
                          Tu nombre completo
                        </Label>
                        <Input
                          id="client_name"
                          type="text"
                          placeholder="Juan Pérez"
                          required
                          value={formData.client_name}
                          onChange={(e) =>
                            setFormData({ ...formData, client_name: e.target.value })
                          }
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="client_phone" className="text-base font-medium">
                          Tu teléfono (WhatsApp)
                        </Label>
                        <Input
                          id="client_phone"
                          type="tel"
                          placeholder="+56912345678"
                          required
                          value={formData.client_phone}
                          onChange={(e) =>
                            setFormData({ ...formData, client_phone: e.target.value })
                          }
                          className="h-11"
                        />
                      </div>
                    </div>

                    {/* Select de servicio (fallback si no seleccionó desde tarjeta) */}
                    {!selectedService && (
                      <div className="space-y-2">
                        <Label htmlFor="service_id">Servicio</Label>
                        <input
                          type="hidden"
                          id="service_id"
                          name="service_id"
                          value={formData.service_id}
                          required
                        />
                        <Select
                          value={formData.service_id}
                          onValueChange={(value) =>
                            setFormData({ ...formData, service_id: value })
                          }
                          required
                        >
                          <SelectTrigger aria-labelledby="service_id" className="h-11">
                            <SelectValue placeholder="Selecciona un servicio" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredServices.map((service) => (
                              <SelectItem key={service.id} value={service.id}>
                                {service.name} - {formatCurrency(service.price)} ({service.duration} min)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Selecciona Fecha y Hora</Label>
                        <input
                          type="hidden"
                          id="date"
                          name="date"
                          value={formData.date}
                          required
                        />
                        <input
                          type="hidden"
                          id="time"
                          name="time"
                          value={formData.time}
                          required
                        />
                        <InlineDatePicker
                          value={formData.date}
                          onChange={(date) => setFormData({ ...formData, date, time: "" })}
                          minDate={new Date().toISOString().split("T")[0]}
                          availability={availability}
                          bookedSlots={bookedSlots}
                          selectedTime={formData.time}
                          onTimeSelect={(time) => setFormData({ ...formData, time })}
                          serviceDuration={selectedService?.duration}
                        />
                      </div>
                      {formData.date && getAvailableTimeSlots().length === 0 && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-sm text-amber-700 flex items-center gap-2">
                            <span>⚠️</span>
                            No hay horarios disponibles para este día. Por favor, selecciona otra fecha.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Resumen antes de confirmar */}
                    {showSummary && selectedService && formData.date && formData.time && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 rounded-xl border-2 border-primary/20 space-y-4"
                      >
                        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-primary" />
                          Resumen de tu Reserva
                        </h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-600 block mb-1">Servicio:</span>
                            <span className="font-semibold text-slate-900">{selectedService.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block mb-1">Duración:</span>
                            <span className="font-semibold text-slate-900">{selectedService.duration} min</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block mb-1">Fecha:</span>
                            <span className="font-semibold text-slate-900">{formatDateFriendly(formData.date)}</span>
                          </div>
                          <div>
                            <span className="text-slate-600 block mb-1">Hora:</span>
                            <span className="font-semibold text-slate-900">{formData.time}</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                          <span className="text-slate-900 font-bold text-lg">Total:</span>
                          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {formatCurrency(selectedService.price)}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowSummary(false)}
                          className="w-full"
                        >
                          Modificar
                        </Button>
                      </motion.div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-accent hover:brightness-110 shadow-lg"
                      disabled={loading || !formData.service_id || !formData.date || !formData.time}
                    >
                      {loading 
                        ? "Reservando..." 
                        : showSummary 
                        ? "Confirmar Reserva" 
                        : "Revisar y Confirmar"}
                    </Button>

                    <p className="text-xs text-slate-500 text-center leading-relaxed">
                      Al agendar, aceptas el uso de tus datos personales para gestionar
                      esta cita, conforme a la{" "}
                      <Link href="/privacy" className="text-primary hover:underline font-medium" target="_blank">
                        Ley 19.628
                      </Link>
                      .
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </section>
      </div>

      {/* Footer mejorado */}
      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm py-12 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img 
              src="/logo.png" 
              alt={`${APP_NAME} Logo`}
              className="h-6 w-6 object-contain"
            />
            <p className="text-sm text-slate-600">
              Agenda powered by{" "}
              <Link href="/" className="text-primary hover:underline font-semibold">
                {APP_NAME}
              </Link>
            </p>
          </div>
          <div className="flex justify-center gap-6 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
