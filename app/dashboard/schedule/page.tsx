"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

export default function SchedulePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Availability settings
  const [availability, setAvailability] = useState({
    monday: { enabled: true, start: "09:00", end: "18:00" },
    tuesday: { enabled: true, start: "09:00", end: "18:00" },
    wednesday: { enabled: true, start: "09:00", end: "18:00" },
    thursday: { enabled: true, start: "09:00", end: "18:00" },
    friday: { enabled: true, start: "09:00", end: "18:00" },
    saturday: { enabled: false, start: "09:00", end: "13:00" },
    sunday: { enabled: false, start: "09:00", end: "13:00" },
  });

  const dayNames: Record<string, string> = {
    monday: "Lunes",
    tuesday: "Martes",
    wednesday: "Miércoles",
    thursday: "Jueves",
    friday: "Viernes",
    saturday: "Sábado",
    sunday: "Domingo",
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
      await fetchAvailability(session.user.id);
    } catch (error: any) {
      console.error("Auth check error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar los horarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchAvailability(userId: string) {
    try {
      const { data, error } = await supabase
        .from("availability")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      // Si hay datos guardados, actualizar el estado
      if (data && data.length > 0) {
        const newAvailability = { ...availability };
        data.forEach((day) => {
          newAvailability[day.day_of_week as keyof typeof availability] = {
            enabled: day.enabled,
            start: day.start_time.substring(0, 5), // Convertir de HH:MM:SS a HH:MM
            end: day.end_time.substring(0, 5),
          };
        });
        setAvailability(newAvailability);
      }
    } catch (error: any) {
      console.error("Fetch availability error:", error);
      // No mostramos toast aquí porque es opcional tener horarios guardados
    }
  }

  async function handleSaveAvailability() {
    if (!user) return;

    try {
      // Preparar los datos para insertar/actualizar
      const availabilityData = Object.entries(availability).map(([day, config]) => ({
        user_id: user.id,
        day_of_week: day,
        enabled: config.enabled,
        start_time: config.start + ':00', // Agregar segundos
        end_time: config.end + ':00',
      }));

      // Usar upsert para insertar o actualizar según exista
      const { error } = await supabase
        .from("availability")
        .upsert(availabilityData, {
          onConflict: 'user_id,day_of_week',
        });

      if (error) throw error;

      toast({
        title: "¡Guardado!",
        description: "Tus horarios de disponibilidad han sido actualizados",
      });
    } catch (error: any) {
      console.error("Save availability error:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los horarios",
        variant: "destructive",
      });
    }
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
              <Clock className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Cargando horarios...</p>
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
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
          <Clock className="w-8 h-8 text-primary" />
          Horarios de Atención
        </h1>
        <p className="text-slate-600">
          Configura los días y horarios en que estás disponible para atender
        </p>
      </motion.div>

      {/* Availability Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Horarios de Disponibilidad</CardTitle>
            <CardDescription>
              Los clientes solo podrán reservar en los horarios que configures aquí
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(availability).map(([day, config]) => (
                <div
                  key={day}
                  className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2 w-32">
                    <input
                      type="checkbox"
                      checked={config.enabled}
                      onChange={(e) =>
                        setAvailability({
                          ...availability,
                          [day]: { ...config, enabled: e.target.checked },
                        })
                      }
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="font-medium text-slate-900">
                      {dayNames[day]}
                    </span>
                  </div>

                  {config.enabled && (
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-slate-500">Desde:</Label>
                        <Input
                          type="time"
                          value={config.start}
                          onChange={(e) =>
                            setAvailability({
                              ...availability,
                              [day]: { ...config, start: e.target.value },
                            })
                          }
                          className="w-32"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-slate-500">Hasta:</Label>
                        <Input
                          type="time"
                          value={config.end}
                          onChange={(e) =>
                            setAvailability({
                              ...availability,
                              [day]: { ...config, end: e.target.value },
                            })
                          }
                          className="w-32"
                        />
                      </div>
                    </div>
                  )}

                  {!config.enabled && (
                    <span className="text-sm text-slate-400 flex-1">
                      No disponible
                    </span>
                  )}
                </div>
              ))}

              <div className="pt-4">
                <Button
                  onClick={handleSaveAvailability}
                  className="bg-gradient-to-r from-primary to-accent hover:brightness-110"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                  }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Horarios
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  * Los horarios se aplicarán para la generación de citas disponibles
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

