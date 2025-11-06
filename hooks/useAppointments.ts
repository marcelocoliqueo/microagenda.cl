import { useState, useEffect, useCallback } from "react";
import { supabase, type Appointment } from "@/lib/supabaseClient";

export function useAppointments(userId: string | null) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          service:services(*)
        `)
        .eq("user_id", userId)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  async function createAppointment(appointment: Omit<Appointment, "id" | "created_at">) {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert([appointment])
        .select()
        .single();

      if (error) throw error;
      await fetchAppointments();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async function updateAppointment(id: string, updates: Partial<Appointment>) {
    try {
      const { error } = await supabase
        .from("appointments")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      await fetchAppointments();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async function deleteAppointment(id: string) {
    try {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await fetchAppointments();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  return {
    appointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refresh: fetchAppointments,
  };
}
