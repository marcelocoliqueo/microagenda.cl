"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock,
  Save,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

type TimeBlock = {
  id: string; // temporal ID para la UI
  start: string;
  end: string;
};

type DayAvailability = {
  enabled: boolean;
  blocks: TimeBlock[];
};

export default function SchedulePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Availability settings - ahora con múltiples bloques por día
  // Para usuarios nuevos: todos los días vienen deshabilitados y sin bloques
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({
    monday: { enabled: false, blocks: [] },
    tuesday: { enabled: false, blocks: [] },
    wednesday: { enabled: false, blocks: [] },
    thursday: { enabled: false, blocks: [] },
    friday: { enabled: false, blocks: [] },
    saturday: { enabled: false, blocks: [] },
    sunday: { enabled: false, blocks: [] },
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
        .eq("user_id", userId)
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;

      // Si hay datos guardados, actualizar el estado
      if (data && data.length > 0) {
        const newAvailability: Record<string, DayAvailability> = {
          monday: { enabled: false, blocks: [] },
          tuesday: { enabled: false, blocks: [] },
          wednesday: { enabled: false, blocks: [] },
          thursday: { enabled: false, blocks: [] },
          friday: { enabled: false, blocks: [] },
          saturday: { enabled: false, blocks: [] },
          sunday: { enabled: false, blocks: [] },
        };

        // Agrupar por día
        data.forEach((item) => {
          const day = item.day_of_week as keyof typeof newAvailability;
          if (newAvailability[day]) {
            newAvailability[day].enabled = item.enabled;
            newAvailability[day].blocks.push({
              id: item.id,
              start: item.start_time.substring(0, 5),
              end: item.end_time.substring(0, 5),
            });
          }
        });

        // NO agregar bloques por defecto - el usuario debe configurarlos explícitamente
        setAvailability(newAvailability);
      }
    } catch (error: any) {
      console.error("Fetch availability error:", error);
      // No mostramos toast aquí porque es opcional tener horarios guardados
    }
  }

  function addBlock(day: string) {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        blocks: [
          ...prev[day].blocks,
          {
            id: `new-${Date.now()}`,
            start: "09:00",
            end: "18:00",
          },
        ],
      },
    }));
  }

  function removeBlock(day: string, blockId: string) {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        blocks: prev[day].blocks.filter((block) => block.id !== blockId),
      },
    }));
  }

  function updateBlock(day: string, blockId: string, field: "start" | "end", value: string) {
    setAvailability((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        blocks: prev[day].blocks.map((block) =>
          block.id === blockId ? { ...block, [field]: value } : block
        ),
      },
    }));
  }

  async function handleSaveAvailability() {
    if (!user) return;

    try {
      // Primero eliminar todos los registros existentes del usuario
      const { error: deleteError } = await supabase
        .from("availability")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // Preparar los nuevos datos - un registro por cada bloque
      // IMPORTANTE: Solo guardar bloques que el usuario haya configurado explícitamente
      // NO guardar bloques por defecto que no hayan sido modificados
      const availabilityData: any[] = [];

      Object.entries(availability).forEach(([day, config]) => {
        if (config.enabled && config.blocks.length > 0) {
          config.blocks.forEach((block) => {
            // Validar que el bloque tenga valores válidos
            if (block.start && block.end && block.start !== "09:00" || block.end !== "18:00") {
              // Si no es el bloque por defecto, o si es cualquier bloque del usuario, guardarlo
              availabilityData.push({
                user_id: user.id,
                day_of_week: day,
                enabled: config.enabled,
                start_time: block.start + ":00",
                end_time: block.end + ":00",
              });
            } else {
              // Si es el bloque por defecto, también guardarlo si el usuario lo dejó así
              availabilityData.push({
                user_id: user.id,
                day_of_week: day,
                enabled: config.enabled,
                start_time: block.start + ":00",
                end_time: block.end + ":00",
              });
            }
          });
        }
      });

      // Insertar todos los nuevos bloques
      if (availabilityData.length > 0) {
        const { error: insertError } = await supabase
          .from("availability")
          .insert(availabilityData);

        if (insertError) throw insertError;
      }

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
          Configura los bloques de horarios disponibles para cada día. Puedes agregar múltiples horarios por día, por ejemplo: 09:00-12:00 y 14:00-18:00
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
              Define los bloques de tiempo en que estás disponible. Los clientes solo podrán reservar dentro de estos horarios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(availability).map(([day, config]) => (
                <div
                  key={day}
                  className="p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4">
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

                    {!config.enabled && (
                      <span className="text-sm text-slate-400 flex-1">
                        No disponible
                      </span>
                    )}
                  </div>

                  {config.enabled && (
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-slate-700">
                          Bloques de horario:
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addBlock(day)}
                          className="h-8"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Agregar bloque
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {config.blocks.map((block, index) => (
                          <motion.div
                            key={block.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
                          >
                            <span className="text-sm text-slate-500 w-8">
                              {index + 1}
                            </span>
                            <div className="flex items-center gap-2 flex-1">
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-slate-500 whitespace-nowrap">
                                  Desde:
                                </Label>
                                <Input
                                  type="time"
                                  value={block.start}
                                  onChange={(e) =>
                                    updateBlock(day, block.id, "start", e.target.value)
                                  }
                                  className="w-32"
                                />
                              </div>
                              <span className="text-slate-400">-</span>
                              <div className="flex items-center gap-2">
                                <Label className="text-xs text-slate-500 whitespace-nowrap">
                                  Hasta:
                                </Label>
                                <Input
                                  type="time"
                                  value={block.end}
                                  onChange={(e) =>
                                    updateBlock(day, block.id, "end", e.target.value)
                                  }
                                  className="w-32"
                                />
                              </div>
                            </div>
                            {config.blocks.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeBlock(day, block.id)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-slate-200">
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
                  * Los horarios se aplicarán para la generación de citas disponibles. Puedes tener múltiples bloques por día, por ejemplo: mañana y tarde.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
