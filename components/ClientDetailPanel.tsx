"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { formatCurrency, formatDate, formatTime, STATUS_LABELS } from "@/lib/constants";

type ClientNote = {
  id: string;
  note: string;
  created_at: string;
  updated_at: string;
};

type Appointment = {
  id: string;
  date: string;
  time: string;
  status: string;
  service: {
    name: string;
    duration: number;
    price: number;
  }[] | null;
};

interface ClientDetailPanelProps {
  userId: string;
  clientName: string;
  clientPhone: string;
}

export function ClientDetailPanel({ userId, clientName, clientPhone }: ClientDetailPanelProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientDetails();
  }, [clientPhone]);

  async function fetchClientDetails() {
    try {
      setLoading(true);

      // Fetch notes
      const { data: notesData, error: notesError } = await supabase
        .from("client_notes")
        .select("*")
        .eq("user_id", userId)
        .eq("client_phone", clientPhone)
        .order("created_at", { ascending: false });

      if (notesError) throw notesError;
      if (notesData) setNotes(notesData);

      // Fetch appointments history
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          id,
          date,
          time,
          status,
          service:services(name, duration, price)
        `)
        .eq("user_id", userId)
        .eq("client_phone", clientPhone)
        .order("date", { ascending: false })
        .order("time", { ascending: false })
        .limit(20);

      if (appointmentsError) throw appointmentsError;
      if (appointmentsData) setAppointments(appointmentsData);
    } catch (error: any) {
      console.error("Error fetching client details:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del cliente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddNote() {
    if (!newNote.trim()) {
      toast({
        title: "Error",
        description: "La nota no puede estar vacía",
        variant: "destructive",
      });
      return;
    }

    if (newNote.length > 1000) {
      toast({
        title: "Error",
        description: "La nota no puede exceder 1000 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("client_notes")
        .insert({
          user_id: userId,
          client_name: clientName,
          client_phone: clientPhone,
          note: newNote.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setNewNote("");
      toast({
        title: "¡Nota agregada!",
        description: "La nota se guardó correctamente",
      });
    } catch (error: any) {
      console.error("Error adding note:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la nota",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteNote(noteId: string) {
    try {
      const { error } = await supabase
        .from("client_notes")
        .delete()
        .eq("id", noteId)
        .eq("user_id", userId);

      if (error) throw error;

      setNotes(notes.filter((note) => note.id !== noteId));
      toast({
        title: "Nota eliminada",
        description: "La nota se eliminó correctamente",
      });
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la nota",
        variant: "destructive",
      });
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-600" />;
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "confirmed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-500 mt-2">Cargando detalles...</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 p-6 bg-slate-50">
      {/* Notes Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-slate-900">Notas</h3>
        </div>

        {/* Add note form */}
        <div className="mb-4 p-4 bg-white rounded-lg border-2 border-dashed border-slate-300">
          <Textarea
            placeholder="Escribe una nota sobre este cliente..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            maxLength={1000}
            rows={3}
            className="mb-2"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {newNote.length}/1000 caracteres
            </span>
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={!newNote.trim()}
              className="bg-gradient-to-r from-primary to-accent hover:brightness-110"
              style={{
                backgroundImage: `linear-gradient(to right, var(--color-primary), var(--color-accent))`,
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Nota
            </Button>
          </div>
        </div>

        {/* Notes list */}
        {notes.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border-2 border-slate-200">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No hay notas para este cliente</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm text-slate-900 whitespace-pre-wrap">{note.note}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(note.created_at).toLocaleString("es-CL", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Appointments History Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-slate-900">Historial de Citas</h3>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border-2 border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No hay citas registradas</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {appointments.map((apt) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 rounded-lg border-2 ${getStatusColor(apt.status)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(apt.status)}
                    <span className="font-semibold text-sm">
                      {STATUS_LABELS[apt.status] || apt.status}
                    </span>
                  </div>
                  <span className="text-xs font-medium">
                    {formatDate(apt.date)}
                  </span>
                </div>

                {apt.service && apt.service[0] && (
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{apt.service[0].name}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(apt.time)} ({apt.service[0].duration} min)
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatCurrency(apt.service[0].price)}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
