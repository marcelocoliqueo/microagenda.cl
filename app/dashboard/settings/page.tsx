"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase, type Profile } from "@/lib/supabaseClient";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
    } catch (error: any) {
      console.error("Auth check error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleAutoConfirm() {
    if (!user || !profile) return;

    const newValue = !profile.auto_confirm;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ auto_confirm: newValue })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, auto_confirm: newValue });
      toast({
        title: "Configuración actualizada",
        description: newValue 
          ? "Las citas se confirmarán automáticamente" 
          : "Ahora debes confirmar manualmente cada cita",
      });
    } catch (error: any) {
      console.error("Update auto confirm error:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("¿Estás seguro? Esta acción no se puede deshacer y eliminará todos tus datos.")) return;

    if (!user) return;

    try {
      // Delete all user data
      await supabase.from("appointments").delete().eq("user_id", user.id);
      await supabase.from("services").delete().eq("user_id", user.id);
      await supabase.from("subscriptions").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);

      // Sign out
      await supabase.auth.signOut();

      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta y todos tus datos han sido eliminados",
      });

      router.push("/");
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta",
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
              <SettingsIcon className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Cargando configuración...</p>
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
          <SettingsIcon className="w-8 h-8 text-primary" />
          Configuración
        </h1>
        <p className="text-slate-600">
          Personaliza cómo funciona tu agenda
        </p>
      </motion.div>

      {/* Auto Confirm Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Confirmación Automática</CardTitle>
            <CardDescription>
              Personaliza cómo se confirman las citas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Confirmación automática</h4>
                  {profile?.auto_confirm && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-muted">
                  {profile?.auto_confirm
                    ? "Las citas se confirman automáticamente sin tu intervención"
                    : "Debes confirmar manualmente cada cita antes de que el cliente la vea confirmada"}
                </p>
              </div>
              <Button
                variant={profile?.auto_confirm ? "default" : "outline"}
                size="lg"
                onClick={handleToggleAutoConfirm}
                className="ml-4"
              >
                {profile?.auto_confirm ? "Activada" : "Desactivada"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
            </div>
            <CardDescription>
              Acciones irreversibles que afectarán tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Eliminar Cuenta</h4>
                <p className="text-sm text-muted mb-4">
                  Esta acción eliminará permanentemente tu cuenta, citas, servicios y todos tus datos personales conforme a la Ley 19.628. Esta acción no se puede deshacer.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  size="lg"
                >
                  Eliminar Cuenta y Todos los Datos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
