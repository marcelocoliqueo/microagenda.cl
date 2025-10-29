"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Search,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Filter,
  Download,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { formatCurrency, formatDate } from "@/lib/constants";

type Client = {
  client_name: string;
  client_phone: string;
  totalAppointments: number;
  lastAppointment: string;
  totalSpent: number;
  status: string;
};

export default function ClientsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = clients.filter(
        (client) =>
          client.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.client_phone.includes(searchTerm)
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchTerm, clients]);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);
      await fetchClients(session.user.id);
    } catch (error: any) {
      console.error("Auth check error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchClients(userId: string) {
    try {
      // Fetch all appointments with services
      const { data: appointments, error } = await supabase
        .from("appointments")
        .select(`
          *,
          service:services(*)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by client
      const clientsMap = new Map<string, Client>();

      appointments?.forEach((apt) => {
        const key = `${apt.client_name}-${apt.client_phone}`;
        
        if (!clientsMap.has(key)) {
          clientsMap.set(key, {
            client_name: apt.client_name,
            client_phone: apt.client_phone,
            totalAppointments: 0,
            lastAppointment: apt.date,
            totalSpent: 0,
            status: apt.status,
          });
        }

        const client = clientsMap.get(key)!;
        client.totalAppointments++;
        
        if (apt.status === "completed" && apt.service) {
          client.totalSpent += apt.service.price;
        }

        // Update last appointment if more recent
        if (new Date(apt.date) > new Date(client.lastAppointment)) {
          client.lastAppointment = apt.date;
          client.status = apt.status;
        }
      });

      const clientsArray = Array.from(clientsMap.values()).sort(
        (a, b) => b.totalAppointments - a.totalAppointments
      );

      setClients(clientsArray);
      setFilteredClients(clientsArray);
    } catch (error: any) {
      console.error("Fetch clients error:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
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
              <Users className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Cargando clientes...</p>
        </motion.div>
      </div>
    );
  }

  const totalClients = clients.length;
  const totalRevenue = clients.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgPerClient = totalClients > 0 ? totalRevenue / totalClients : 0;
  const topClient = clients[0];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              Clientes
            </h1>
            <p className="text-slate-600 mt-1">
              Gestiona y analiza tu base de clientes
            </p>
          </div>
          <Button className="bg-gradient-to-r from-primary to-accent hover:brightness-110">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-slate-200/70 bg-white/70 backdrop-blur hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium mb-1">Total Clientes</p>
              <p className="text-3xl font-bold text-slate-900">{totalClients}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-white hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium mb-1">Ingresos Totales</p>
              <p className="text-3xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-slate-200/70 bg-white/70 backdrop-blur hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium mb-1">Promedio por Cliente</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(avgPerClient)}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-emerald-200/70 bg-gradient-to-br from-emerald-50/50 to-white hover:shadow-xl transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium mb-1">Cliente Top</p>
              <p className="text-lg font-bold text-emerald-600 truncate">
                {topClient?.client_name || "N/A"}
              </p>
              <p className="text-xs text-slate-500">
                {topClient?.totalAppointments || 0} citas
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-6"
      >
        <Card className="border-slate-200/70 bg-white/70 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Buscar cliente por nombre o teléfono..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Clients List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-slate-200/70 bg-white/70 backdrop-blur">
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
            <CardDescription>
              {filteredClients.length} cliente{filteredClients.length !== 1 ? "s" : ""} encontrado{filteredClients.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No se encontraron clientes</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredClients.map((client, index) => (
                  <motion.div
                    key={`${client.client_name}-${client.client_phone}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all hover:border-primary/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                          {client.client_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{client.client_name}</h4>
                          <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {client.client_phone}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {client.totalAppointments} citas
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {formatCurrency(client.totalSpent)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Última cita</p>
                        <p className="text-sm font-medium text-slate-900">
                          {formatDate(client.lastAppointment)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

