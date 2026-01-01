"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Clock,
  Save,
  Plus,
  Trash2,
  Timer,
  CheckCircle2,
  Ban,
  Calendar as CalendarIcon,
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

type BlockedDate = {
  id: string;
  start_date: string;
  end_date: string;
  reason: string;
};

export default function SchedulePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bufferTime, setBufferTime] = useState<number>(0);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [newBlock, setNewBlock] = useState({ start_date: "", end_date: "", reason: "" });

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
      await fetchBufferTime(session.user.id);
      await fetchBlockedDates(session.user.id);
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

  async function fetchBufferTime(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("buffer_time_minutes")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (data && data.buffer_time_minutes !== null) {
        setBufferTime(data.buffer_time_minutes);
      }
    } catch (error: any) {
      console.error("Fetch buffer time error:", error);
      // No mostramos toast aquí porque es opcional
    }
  }

  async function fetchBlockedDates(userId: string) {
    try {
      const { data, error } = await supabase
        .from("blocked_dates")
        .select("*")
        .eq("user_id", userId)
        .order("start_date");

      if (error) throw error;

      if (data) {
        setBlockedDates(data);
      }
    } catch (error: any) {
      console.error("Fetch blocked dates error:", error);
      // No mostramos toast aquí porque es opcional
    }
  }

  async function addBlockedDate() {
    if (!user) return;

    if (!newBlock.start_date || !newBlock.end_date) {
      toast({
        title: "Error",
        description: "Debes seleccionar fecha de inicio y fin",
        variant: "destructive",
      });
      return;
    }

    if (newBlock.start_date > newBlock.end_date) {
      toast({
        title: "Error",
        description: "La fecha de inicio debe ser menor o igual a la fecha de fin",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("blocked_dates")
        .insert({
          user_id: user.id,
          start_date: newBlock.start_date,
          end_date: newBlock.end_date,
          reason: newBlock.reason || "Bloqueado",
        })
        .select()
        .single();

      if (error) throw error;

      setBlockedDates([...blockedDates, data]);
      setNewBlock({ start_date: "", end_date: "", reason: "" });

      toast({
        title: "¡Bloqueado!",
        description: "El período ha sido bloqueado exitosamente",
      });
    } catch (error: any) {
      console.error("Add blocked date error:", error);
      toast({
        title: "Error",
        description: "No se pudo agregar el bloqueo",
        variant: "destructive",
      });
    }
  }

  async function removeBlockedDate(id: string) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("blocked_dates")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      setBlockedDates(blockedDates.filter((block) => block.id !== id));

      toast({
        title: "Eliminado",
        description: "El bloqueo ha sido eliminado",
      });
    } catch (error: any) {
      console.error("Remove blocked date error:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el bloqueo",
        variant: "destructive",
      });
    }
  }

  // Función auxiliar para sumar horas a una hora
  function addHours(time: string, hours: number): string {
    const [h, m] = time.split(':').map(Number);
    const totalMinutes = h * 60 + m + (hours * 60);
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }

  // Función auxiliar para comparar horas
  function compareTime(time1: string, time2: string): number {
    const [h1, m1] = time1.split(':').map(Number);
    const [h2, m2] = time2.split(':').map(Number);
    const minutes1 = h1 * 60 + m1;
    const minutes2 = h2 * 60 + m2;
    return minutes1 - minutes2;
  }

  function addBlock(day: string) {
    setAvailability((prev) => {
      const dayConfig = prev[day];
      const existingBlocks = dayConfig.blocks;

      let newStart = "09:00";
      let newEnd = "10:00"; // 1 hora por defecto

      // Si hay bloques existentes, encontrar el último bloque (el que termina más tarde)
      if (existingBlocks.length > 0) {
        // Ordenar bloques por hora de fin para encontrar el último
        const sortedBlocks = [...existingBlocks].sort((a, b) => compareTime(a.end, b.end));
        const lastBlock = sortedBlocks[sortedBlocks.length - 1];
        
        // El nuevo bloque empieza donde termina el último bloque
        newStart = lastBlock.end;
        
        // Calcular hora de fin: +1 hora desde el inicio, máximo hasta las 24:00
        const calculatedEnd = addHours(newStart, 1);
        const maxEnd = "24:00";
        
        // Usar el menor entre el calculado y el máximo
        newEnd = compareTime(calculatedEnd, maxEnd) <= 0 ? calculatedEnd : maxEnd;
        
        // Si el nuevo bloque empezaría después de las 24:00, usar valores por defecto
        if (compareTime(newStart, "24:00") >= 0) {
          newStart = "09:00";
          newEnd = "10:00";
        }
      }

      return {
        ...prev,
        [day]: {
          ...prev[day],
          blocks: [
            ...prev[day].blocks,
            {
              id: `new-${Date.now()}`,
              start: newStart,
              end: newEnd,
            },
          ],
        },
      };
    });
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

  // Función para validar solapamientos entre bloques
  function hasOverlappingBlocks(blocks: TimeBlock[]): { hasOverlap: boolean; message?: string } {
    if (blocks.length <= 1) return { hasOverlap: false };

    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    for (let i = 0; i < blocks.length; i++) {
      const block1 = blocks[i];
      
      // Validar que start < end dentro del mismo bloque
      if (block1.start >= block1.end) {
        return {
          hasOverlap: true,
          message: `El bloque ${i + 1} tiene hora de inicio mayor o igual a la hora de fin`
        };
      }

      // Comparar con otros bloques
      for (let j = i + 1; j < blocks.length; j++) {
        const block2 = blocks[j];
        
        const start1 = parseTime(block1.start);
        const end1 = parseTime(block1.end);
        const start2 = parseTime(block2.start);
        const end2 = parseTime(block2.end);
        
        // Detectar solapamiento
        const overlaps = (start1 < end2 && end1 > start2);
        
        if (overlaps) {
          let message = '';
          if (start1 <= start2 && end1 >= end2) {
            message = `El bloque ${i + 1} (${block1.start}-${block1.end}) contiene completamente al bloque ${j + 1} (${block2.start}-${block2.end})`;
          } else if (start2 <= start1 && end2 >= end1) {
            message = `El bloque ${j + 1} (${block2.start}-${block2.end}) contiene completamente al bloque ${i + 1} (${block1.start}-${block1.end})`;
          } else {
            message = `El bloque ${i + 1} (${block1.start}-${block1.end}) se solapa con el bloque ${j + 1} (${block2.start}-${block2.end})`;
          }
          return { hasOverlap: true, message };
        }
      }
    }

    return { hasOverlap: false };
  }

  function updateBlock(day: string, blockId: string, field: "start" | "end", value: string) {
    setAvailability((prev) => {
      const updated = {
        ...prev,
        [day]: {
          ...prev[day],
          blocks: prev[day].blocks.map((block) =>
            block.id === blockId ? { ...block, [field]: value } : block
          ),
        },
      };

      // Validar solapamientos en tiempo real
      const dayConfig = updated[day];
      if (dayConfig.enabled && dayConfig.blocks.length > 0) {
        const validation = hasOverlappingBlocks(dayConfig.blocks);
        if (validation.hasOverlap && validation.message) {
          // Mostrar toast de advertencia
          toast({
            title: "⚠️ Horarios solapados",
            description: `${dayNames[day]}: ${validation.message}`,
            variant: "destructive",
          });
        }
      }

      return updated;
    });
  }

  // Función para verificar si hay solapamientos en todos los días
  function hasAnyOverlaps(): { hasOverlap: boolean; conflicts: Array<{ day: string; message: string }> } {
    const conflicts: Array<{ day: string; message: string }> = [];

    for (const [day, config] of Object.entries(availability)) {
      if (config.enabled && config.blocks.length > 0) {
        // Validar cada bloque individualmente
        for (let i = 0; i < config.blocks.length; i++) {
          const block = config.blocks[i];
          
          // Validar que start < end
          if (block.start >= block.end) {
            conflicts.push({
              day,
              message: `La hora de inicio debe ser menor que la hora de fin en el bloque ${i + 1}`
            });
          }
        }
        
        // Validar solapamientos entre bloques
        const validation = hasOverlappingBlocks(config.blocks);
        if (validation.hasOverlap && validation.message) {
          conflicts.push({
            day,
            message: validation.message
          });
        }
      }
    }

    return {
      hasOverlap: conflicts.length > 0,
      conflicts
    };
  }

  async function handleSaveAvailability() {
    if (!user) return;

    // Validar solapamientos antes de guardar
    const validation = hasAnyOverlaps();
    if (validation.hasOverlap) {
      const firstConflict = validation.conflicts[0];
      toast({
        title: "Error de validación",
        description: `${dayNames[firstConflict.day]}: ${firstConflict.message}`,
        variant: "destructive",
      });
      return;
    }

    try {
      
      // Primero eliminar todos los registros existentes del usuario
      const { error: deleteError } = await supabase
        .from("availability")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      // Preparar los nuevos datos - un registro por cada bloque
      // Guardar todos los bloques que el usuario haya configurado (habilitados y con bloques)
      const availabilityData: any[] = [];

      Object.entries(availability).forEach(([day, config]) => {
        // Solo guardar días que estén habilitados y tengan bloques configurados
        if (config.enabled && config.blocks.length > 0) {
          config.blocks.forEach((block) => {
            // Validar que el bloque tenga valores válidos antes de guardar
            if (block.start && block.end) {
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

      // Guardar buffer time en el perfil
      const { error: bufferError } = await supabase
        .from("profiles")
        .update({ buffer_time_minutes: bufferTime })
        .eq("id", user.id);

      if (bufferError) throw bufferError;

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
          <Clock className="w-8 h-8" style={{ color: "var(--color-primary)" }} />
          Horarios de Atención
        </h1>
        <p className="text-slate-600">
          Configura los bloques de horarios disponibles para cada día. Puedes agregar múltiples horarios por día, por ejemplo: 09:00-12:00 y 14:00-18:00
        </p>
      </motion.div>

      {/* Buffer Time Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
              Tiempo de Preparación
            </CardTitle>
            <CardDescription>
              Define un tiempo de buffer entre citas consecutivas para preparación, limpieza o descanso.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="buffer-time" className="text-sm font-medium text-slate-700 min-w-[200px]">
                  Tiempo entre citas:
                </Label>
                <select
                  id="buffer-time"
                  value={bufferTime}
                  onChange={(e) => setBufferTime(Number(e.target.value))}
                  className="flex h-10 w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={0}>Sin buffer (citas consecutivas)</option>
                  <option value={5}>5 minutos</option>
                  <option value={10}>10 minutos</option>
                  <option value={15}>15 minutos</option>
                  <option value={20}>20 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Timer className="w-5 h-5 text-blue-600 mt-0.5" />
                  </div>
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">¿Qué es el tiempo de preparación?</p>
                    <p className="text-blue-700">
                      Es el tiempo que necesitas entre citas para preparar el espacio, limpiar, o simplemente tomar un descanso.
                      Si una cita termina a las 10:00 y tienes un buffer de 15 minutos, la próxima cita disponible será a las 10:15.
                    </p>
                  </div>
                </div>
              </div>

              {bufferTime > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    </div>
                    <div className="text-sm text-green-900">
                      <p className="font-medium">
                        Tiempo de buffer activo: {bufferTime} minutos
                      </p>
                      <p className="text-green-700 mt-1">
                        Ejemplo: Si tienes una cita de 60 minutos a las 10:00, terminará a las 11:00.
                        Con {bufferTime} minutos de buffer, la próxima cita disponible será a las {new Date(0, 0, 0, 11, bufferTime).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Availability Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
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
                        {config.blocks.map((block, index) => {
                          // Verificar si este bloque tiene solapamiento
                          const validation = hasOverlappingBlocks(config.blocks);
                          const blockHasConflict = validation.hasOverlap;
                          
                          return (
                          <motion.div
                            key={block.id}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                              blockHasConflict 
                                ? 'bg-red-50 border-red-300' 
                                : 'bg-slate-50 border-slate-200'
                            }`}
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
                            {blockHasConflict && (
                              <div className="flex items-center gap-1 text-xs text-red-600">
                                <Ban className="w-3 h-3" />
                                <span>Conflicto</span>
                              </div>
                            )}
                          </motion.div>
                          );
                        })}
                      </div>
                      {hasOverlappingBlocks(config.blocks).hasOverlap && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700 font-medium">
                            ⚠️ Hay horarios solapados. Ajusta los bloques para que no se entrelacen.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-4 border-t border-slate-200">
                {hasAnyOverlaps().hasOverlap && (
                  <div className="mb-4 p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Ban className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-red-900 mb-1">
                          ⚠️ No se pueden guardar los horarios
                        </p>
                        <p className="text-xs text-red-700">
                          Hay conflictos de horarios solapados. Por favor corrige los bloques marcados en rojo antes de guardar.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <Button
                  onClick={handleSaveAvailability}
                  disabled={hasAnyOverlaps().hasOverlap}
                  className="bg-gradient-to-r from-primary to-accent hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundImage: hasAnyOverlaps().hasOverlap 
                      ? 'none' 
                      : `linear-gradient(to right, var(--color-primary), var(--color-accent))`
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

      {/* Blocked Dates Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ban className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
              Bloquear Fechas
            </CardTitle>
            <CardDescription>
              Bloquea períodos específicos (vacaciones, feriados, días libres) para que no se puedan agendar citas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Add new blocked date form */}
              <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="start-date" className="text-sm font-medium text-slate-700 mb-2 block">
                      Fecha Inicio
                    </Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newBlock.start_date}
                      onChange={(e) => setNewBlock({ ...newBlock, start_date: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="end-date" className="text-sm font-medium text-slate-700 mb-2 block">
                      Fecha Fin
                    </Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newBlock.end_date}
                      onChange={(e) => setNewBlock({ ...newBlock, end_date: e.target.value })}
                      min={newBlock.start_date || new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="reason" className="text-sm font-medium text-slate-700 mb-2 block">
                      Motivo (opcional)
                    </Label>
                    <Input
                      id="reason"
                      type="text"
                      placeholder="Ej: Vacaciones, Feriado"
                      value={newBlock.reason}
                      onChange={(e) => setNewBlock({ ...newBlock, reason: e.target.value })}
                      maxLength={200}
                    />
                  </div>
                </div>

                <Button
                  onClick={addBlockedDate}
                  className="mt-4 bg-gradient-to-r from-primary to-accent hover:brightness-110"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Bloqueo
                </Button>
              </div>

              {/* List of blocked dates */}
              {blockedDates.length > 0 ? (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-slate-700">
                    Períodos Bloqueados ({blockedDates.length}):
                  </Label>
                  <div className="space-y-2">
                    {blockedDates.map((block) => {
                      const startDate = new Date(block.start_date + 'T00:00:00');
                      const endDate = new Date(block.end_date + 'T00:00:00');
                      const isSameDay = block.start_date === block.end_date;
                      const isPast = endDate < new Date();

                      return (
                        <motion.div
                          key={block.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                            isPast
                              ? 'bg-slate-50 border-slate-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${
                              isPast ? 'bg-slate-200' : 'bg-red-100'
                            }`}>
                              <CalendarIcon className={`w-5 h-5 ${
                                isPast ? 'text-slate-600' : 'text-red-600'
                              }`} />
                            </div>
                            <div>
                              <p className={`font-semibold ${
                                isPast ? 'text-slate-900' : 'text-red-900'
                              }`}>
                                {isSameDay
                                  ? startDate.toLocaleDateString('es-CL', {
                                      weekday: 'long',
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })
                                  : `${startDate.toLocaleDateString('es-CL', {
                                      day: 'numeric',
                                      month: 'short'
                                    })} - ${endDate.toLocaleDateString('es-CL', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}`
                                }
                              </p>
                              {block.reason && (
                                <p className={`text-sm ${
                                  isPast ? 'text-slate-600' : 'text-red-700'
                                }`}>
                                  {block.reason}
                                </p>
                              )}
                              {isPast && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Período pasado
                                </p>
                              )}
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeBlockedDate(block.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-slate-200">
                  <Ban className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">No hay fechas bloqueadas</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Agrega períodos para bloquear la agenda
                  </p>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <Ban className="w-5 h-5 text-blue-600 mt-0.5" />
                  </div>
                  <div className="text-sm text-blue-900">
                    <p className="font-medium mb-1">¿Cómo funcionan los bloqueos?</p>
                    <p className="text-blue-700">
                      Las fechas bloqueadas no aparecerán disponibles para que tus clientes agenden citas.
                      Útil para vacaciones, feriados o días que no puedes atender.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
