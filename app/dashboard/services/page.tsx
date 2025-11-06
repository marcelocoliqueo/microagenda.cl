"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  Save,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase, type Service } from "@/lib/supabaseClient";
import { formatCurrency } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ServicesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    duration: "",
    price: "",
    category: "",
  });

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
      await fetchServices(session.user.id);
    } catch (error: any) {
      console.error("Auth check error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar los servicios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchServices(userId: string) {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setServices(data || []);
    } catch (error: any) {
      console.error("Fetch services error:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los servicios",
        variant: "destructive",
      });
    }
  }

  async function handleSaveService() {
    if (!user || !serviceForm.name || !serviceForm.duration || !serviceForm.price) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from("services")
          .update({
            name: serviceForm.name,
            duration: parseInt(serviceForm.duration),
            price: parseFloat(serviceForm.price),
            category: serviceForm.category || "General",
          })
          .eq("id", editingService.id);

        if (error) throw error;

        toast({
          title: "Servicio actualizado",
          description: "El servicio se actualizó correctamente",
        });
      } else {
        // Create new service
        const { error } = await supabase.from("services").insert([
          {
            user_id: user.id,
            name: serviceForm.name,
            duration: parseInt(serviceForm.duration),
            price: parseFloat(serviceForm.price),
            category: serviceForm.category || "General",
          },
        ]);

        if (error) throw error;

        toast({
          title: "Servicio creado",
          description: "El servicio se creó correctamente",
        });
      }

      setShowServiceDialog(false);
      setEditingService(null);
      setServiceForm({ name: "", duration: "", price: "", category: "" });
      await fetchServices(user.id);
    } catch (error: any) {
      console.error("Save service error:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el servicio",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteService(serviceId: string) {
    if (!confirm("¿Estás seguro de eliminar este servicio?")) return;

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;

      toast({
        title: "Servicio eliminado",
        description: "El servicio se eliminó correctamente",
      });

      await fetchServices(user!.id);
    } catch (error: any) {
      console.error("Delete service error:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el servicio",
        variant: "destructive",
      });
    }
  }

  function openEditDialog(service: Service) {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      duration: service.duration.toString(),
      price: service.price.toString(),
      category: service.category || "",
    });
    setShowServiceDialog(true);
  }

  function openNewDialog() {
    setEditingService(null);
    setServiceForm({ name: "", duration: "", price: "", category: "" });
    setShowServiceDialog(true);
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
              <Package className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Cargando servicios...</p>
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
          <Package className="w-8 h-8 text-primary" />
          Mis Servicios
        </h1>
        <p className="text-slate-600">
          Gestiona los servicios que ofreces a tus clientes
        </p>
      </motion.div>

      {/* Services Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Servicios</CardTitle>
                <CardDescription>
                  Los servicios que ofreces aparecerán en tu página de reservas
                </CardDescription>
              </div>
              <Button
                onClick={openNewDialog}
                className="bg-gradient-to-r from-primary to-accent hover:brightness-110"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Servicio
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-600 mb-4">No tienes servicios configurados</p>
                <Button onClick={openNewDialog} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear tu primer servicio
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-primary)";
                      e.currentTarget.style.borderWidth = "2px";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgb(226, 232, 240)"; // slate-200
                      e.currentTarget.style.borderWidth = "1px";
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900">{service.name}</h4>
                        {service.category && service.category !== "General" && (
                          <span 
                            className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full"
                            style={{
                              color: "var(--color-primary)",
                              backgroundColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.1)`
                            }}
                          >
                            {service.category}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(service)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{service.duration} minutos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold text-slate-900">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Servicio" : "Nuevo Servicio"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Modifica los datos del servicio"
                : "Crea un nuevo servicio que ofreces a tus clientes"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service-name">Nombre del Servicio</Label>
              <Input
                id="service-name"
                placeholder="Ej: Consulta General"
                value={serviceForm.name}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service-duration">Duración (minutos)</Label>
                <Input
                  id="service-duration"
                  type="number"
                  placeholder="30"
                  value={serviceForm.duration}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, duration: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-price">Precio</Label>
                <Input
                  id="service-price"
                  type="number"
                  placeholder="20000"
                  value={serviceForm.price}
                  onChange={(e) =>
                    setServiceForm({ ...serviceForm, price: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-category">Categoría (opcional)</Label>
              <Input
                id="service-category"
                placeholder="Ej: Tratamientos, Consultas, Masajes..."
                value={serviceForm.category}
                onChange={(e) =>
                  setServiceForm({ ...serviceForm, category: e.target.value })
                }
              />
              <p className="text-xs text-slate-500">
                Las categorías ayudan a organizar tus servicios. Si no especificas una, se usará "General".
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowServiceDialog(false);
                  setEditingService(null);
                  setServiceForm({ name: "", duration: "", price: "", category: "" });
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                onClick={handleSaveService}
                className="bg-gradient-to-r from-primary to-accent hover:brightness-110"
                style={{
                  backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-accent))`
                }}
              >
                <Save className="w-4 h-4 mr-2" />
                {editingService ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

