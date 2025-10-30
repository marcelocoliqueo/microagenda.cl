"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle } from "lucide-react";
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
import { SimpleDatePicker } from "@/components/SimpleDatePicker";

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
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    service_id: "",
    date: "",
    time: "",
  });

  // Calcular horarios disponibles basados en configuración
  const getAvailableTimeSlots = (): string[] => {
    if (!formData.date) return [];

    const dayName = getDayName(formData.date);
    const dayAvailability = availability[dayName];

    if (!dayAvailability || dayAvailability.length === 0) {
      return []; // Día no disponible
    }

    const availableSlots = generateAvailableSlots(dayAvailability);
    
    // Filtrar horarios ya reservados
    return availableSlots.filter(slot => !bookedSlots.includes(slot));
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
          availabilityMap[day].push({
            start: item.start_time.substring(0, 5),
            end: item.end_time.substring(0, 5),
          });
        });
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-accent" />
              </div>
              <CardTitle>¡Reserva Exitosa!</CardTitle>
              <CardDescription>
                {profile.auto_confirm
                  ? "Tu cita ha sido confirmada automáticamente"
                  : "Recibirás una confirmación pronto"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-center text-muted">
                  Te hemos enviado un recordatorio por email. Si tienes alguna duda, contacta
                  directamente con {profile.business_name || profile.name}.
                </p>
                <Button
                  className="w-full"
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
            <img 
              src="/logo.png" 
              alt={`${APP_NAME} Logo`}
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain group-hover:scale-110 transition-transform"
            />
            <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Professional Info */}
          <div className="text-center mb-12">
            {profile.business_logo_url && (
              <div className="mb-6 flex justify-center">
                <img
                  src={profile.business_logo_url}
                  alt={`${profile.business_name || profile.name} Logo`}
                  className="h-24 w-auto object-contain max-w-xs rounded-lg"
                />
              </div>
            )}
            <h1 className="text-4xl font-bold mb-2">
              {profile.business_name || profile.name}
            </h1>
            {profile.bio && (
              <p className="text-muted max-w-2xl mx-auto">{profile.bio}</p>
            )}
          </div>

          {/* Services */}
          {services.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-center">Servicios</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} min</span>
                        </div>
                        <span className="font-semibold text-text text-lg">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Reservar una cita
              </CardTitle>
              <CardDescription>
                Completa el formulario para agendar tu cita
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client_name">Tu nombre completo</Label>
                    <Input
                      id="client_name"
                      type="text"
                      placeholder="Juan Pérez"
                      required
                      value={formData.client_name}
                      onChange={(e) =>
                        setFormData({ ...formData, client_name: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client_phone">Tu teléfono (WhatsApp)</Label>
                    <Input
                      id="client_phone"
                      type="tel"
                      placeholder="+56912345678"
                      required
                      value={formData.client_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, client_phone: e.target.value })
                      }
                    />
                  </div>

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
                      <SelectTrigger aria-labelledby="service_id">
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

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha</Label>
                      <SimpleDatePicker
                        value={formData.date}
                        onChange={(date) => setFormData({ ...formData, date, time: "" })}
                        minDate={new Date().toISOString().split("T")[0]}
                        availability={availability}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Hora</Label>
                      <input
                        type="hidden"
                        id="time"
                        name="time"
                        value={formData.time}
                        required
                      />
                      {getAvailableTimeSlots().length === 0 && formData.date ? (
                        <div className="space-y-2">
                          <Select disabled>
                            <SelectTrigger aria-labelledby="time">
                              <SelectValue placeholder="No hay horarios disponibles" />
                            </SelectTrigger>
                          </Select>
                          <p className="text-sm text-amber-600">
                            ⚠️ No hay horarios disponibles para este día. Por favor, selecciona otra fecha.
                          </p>
                        </div>
                      ) : (
                        <>
                          <Select
                            value={formData.time}
                            onValueChange={(value) =>
                              setFormData({ ...formData, time: value })
                            }
                            required
                            disabled={!formData.date}
                          >
                            <SelectTrigger aria-labelledby="time">
                              <SelectValue placeholder={
                                !formData.date 
                                  ? "Primero selecciona una fecha" 
                                  : "Selecciona hora"
                              } />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableTimeSlots().map((slot) => (
                                <SelectItem key={slot} value={slot}>
                                  {slot}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formData.date && getAvailableTimeSlots().length > 0 && (
                            <p className="text-xs text-slate-500">
                              {getAvailableTimeSlots().length} horario{getAvailableTimeSlots().length !== 1 ? "s" : ""} disponible{getAvailableTimeSlots().length !== 1 ? "s" : ""}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Resumen antes de confirmar */}
                  {showSummary && formData.service_id && formData.date && formData.time && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg border-2 border-primary/20 space-y-3"
                    >
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Resumen de tu Reserva
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Servicio:</span>
                          <span className="font-semibold">
                            {services.find(s => s.id === formData.service_id)?.name}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Fecha:</span>
                          <span className="font-semibold">
                            {formatDateFriendly(formData.date)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Hora:</span>
                          <span className="font-semibold">{formData.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Duración:</span>
                          <span className="font-semibold">
                            {services.find(s => s.id === formData.service_id)?.duration} min
                          </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-200">
                          <span className="text-slate-900 font-semibold">Total:</span>
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(services.find(s => s.id === formData.service_id)?.price || 0)}
                          </span>
                        </div>
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
                    className="w-full" 
                    disabled={loading || !formData.service_id || !formData.date || !formData.time}
                    style={showSummary ? {
                      backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                    } : undefined}
                  >
                    {loading 
                      ? "Reservando..." 
                      : showSummary 
                      ? "Confirmar Reserva" 
                      : "Revisar y Confirmar"}
                  </Button>

                  <p className="text-xs text-muted text-center">
                    Al agendar, aceptas el uso de tus datos personales para gestionar
                    esta cita, conforme a la{" "}
                    <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                      Ley 19.628
                    </Link>
                    .
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img 
              src="/logo.png" 
              alt={`${APP_NAME} Logo`}
              className="h-6 w-6 object-contain"
            />
            <p className="text-sm text-muted">
              Agenda powered by{" "}
              <Link href="/" className="text-primary hover:underline font-medium">
                {APP_NAME}
              </Link>
            </p>
          </div>
          <div className="flex justify-center gap-4 text-xs text-muted">
            <Link href="/privacy" className="hover:text-text">
              Privacidad
            </Link>
            <Link href="/terms" className="hover:text-text">
              Términos
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
