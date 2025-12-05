"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, DollarSign, LogOut, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase, type Profile } from "@/lib/supabaseClient";
import { PLAN_PRICE, formatCurrency } from "@/lib/constants";
import { createSubscriptionPreference } from "@/lib/mercadopagoClient";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

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

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
        return;
      }

      setProfile(profileData);
    } catch (error: any) {
      console.error("Auth check error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubscribe(e?: React.MouseEvent) {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!profile) {
      console.error("No profile available");
      alert("Error: No se pudo cargar tu información. Por favor recarga la página.");
      return;
    }

    try {
      setProcessing(true);
      console.log("🔄 Iniciando proceso de suscripción...");

      // Get plan
      const { data: plans, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .single();

      if (planError || !plans) {
        console.error("Error fetching plan:", planError);
        alert(`Error: No se encontró el plan. ${planError?.message || ""}`);
        setProcessing(false);
        return;
      }

      console.log("✅ Plan encontrado:", plans);

      const result = await createSubscriptionPreference({
        userId: profile.id,
        userEmail: profile.email,
        planId: plans.id,
        planName: plans.name,
        planPrice: plans.price,
      });

      console.log("📦 Resultado de createSubscriptionPreference:", result);

      if (result.success && result.init_point) {
        console.log("✅ Redirigiendo a:", result.init_point);
        window.location.href = result.init_point;
      } else if (result.mock && result.init_point) {
        // Si es mock, también redirigir
        console.log("📦 Modo mock, redirigiendo a:", result.init_point);
        window.location.href = result.init_point;
      } else {
        console.error("❌ No se pudo crear la preferencia:", result);
        const errorMsg = result.error 
          ? `Error: ${JSON.stringify(result.error)}`
          : "No se pudo crear la preferencia de pago. Verifica la consola para más detalles.";
        alert(errorMsg);
      }
    } catch (error: any) {
      console.error("❌ Error creating subscription:", error);
      alert(`Error al procesar la suscripción: ${error.message || "Error desconocido"}`);
    } finally {
      setProcessing(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Blocking UI for expired/inactive subscription
  if (profile && (profile.subscription_status === "expired" || profile.subscription_status === "inactive")) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-xl border-t-4 border-t-red-500">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Suscripción Expirada</CardTitle>
            <CardDescription className="text-base mt-2">
              Tu periodo de acceso ha finalizado. Para continuar gestionando tus citas, por favor reactiva tu plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Beneficios de reactivar:
              </h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Acceso ilimitado a tu agenda
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Recordatorios automáticos por email
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                  Estadísticas avanzadas
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                onClick={handleSubscribe}
                disabled={processing}
                className="w-full bg-gradient-to-r from-primary to-accent hover:brightness-110 text-lg py-6 shadow-lg"
              >
                <DollarSign className="w-5 h-5 mr-2" />
                {processing ? "Procesando..." : `Reactivar por ${formatCurrency(PLAN_PRICE)}/mes`}
              </Button>

              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full text-slate-500 hover:text-slate-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si tiene suscripción activa o está en trial, mostrar el contenido
  return <>{children}</>;
}

