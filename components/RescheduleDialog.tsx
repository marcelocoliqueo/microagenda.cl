"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatTime } from "@/lib/constants";

interface RescheduleDialogProps {
  appointment: any;
  onReschedule: (appointmentId: string, newDate: string, newTime: string) => Promise<void>;
}

export function RescheduleDialog({
  appointment,
  onReschedule,
}: RescheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await onReschedule(appointment.id, newDate, newTime);
      setOpen(false);
      setNewDate("");
      setNewTime("");
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          title="Reagendar cita"
        >
          <CalendarClock className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reagendar Cita</DialogTitle>
          <DialogDescription>
            Cambiar la fecha y hora de la cita con {appointment.client_name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Fecha y Hora Actual</Label>
            <div className="p-3 bg-slate-50 rounded-lg text-sm">
              <p className="font-medium text-slate-900">
                {formatDate(appointment.date)} a las {formatTime(appointment.time)}
              </p>
              <p className="text-slate-600 mt-1">{appointment.service?.name || "Servicio"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new_date">Nueva Fecha</Label>
              <Input
                id="new_date"
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_time">Nueva Hora</Label>
              <Input
                id="new_time"
                type="time"
                required
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={loading || !newDate || !newTime}
            >
              {loading ? "Reagendando..." : "Confirmar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

