"use client";

import { use, useEffect, useState } from "react";
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
import { formatCurrency, formatDate, generateTimeSlots, sanitizePhone } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function PublicAgendaPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = use(params);
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    service_id: "",
    date: "",
    time: "",
  });

  const timeSlots = generateTimeSlots();

  useEffect(() => {
    fetchProfessionalData();
  }, [resolvedParams.username]);

  async function fetchProfessionalData() {
    try {
      setLoading(true);

      // Find profile by username (extracted from email)
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", `${resolvedParams.username}%`);

      if (profileError) throw profileError;

      if (!profiles || profiles.length === 0) {
        toast({
          title: "Error",
          description: "Profesional no encontrado",
          variant: "destructive",
        });
        return;
      }

      const professionalProfile = profiles[0];
      setProfile(professionalProfile);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", professionalProfile.id)
        .order("created_at", { ascending: true });

      if (servicesError) throw servicesError;

      setServices(servicesData || []);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!profile) return;

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
          <Link href="/" className="text-xl font-bold text-primary">
            {APP_NAME}
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
                <div className="text-center py-8 text-muted">
                  Este profesional no tiene servicios disponibles aún
                </div>
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
                    <Label htmlFor="service">Servicio</Label>
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
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Fecha</Label>
                      <Input
                        id="date"
                        type="date"
                        required
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.date}
                        onChange={(e) =>
                          setFormData({ ...formData, date: e.target.value })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="time">Hora</Label>
                      <Select
                        value={formData.time}
                        onValueChange={(value) =>
                          setFormData({ ...formData, time: value })
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona hora" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Reservando..." : "Confirmar Reserva"}
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
          <p className="text-sm text-muted mb-2">
            Agenda powered by{" "}
            <Link href="/" className="text-primary hover:underline">
              {APP_NAME}
            </Link>
          </p>
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
