"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, DollarSign, LogOut, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase, type Profile } from "@/lib/supabaseClient";
import { PLAN_PRICE, formatCurrency } from "@/lib/constants";
// Removed: import { createSubscriptionPreference } from "@/lib/mercadopagoClient";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export function SubscriptionGuard({ children }: SubscriptionGuardProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [subscriptionPolling, setSubscriptionPolling] = useState(false);

  useEffect(() => {
    checkAuth();

    // Verificar si viene de un pago exitoso (mock o real)
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get("payment");
    const reveniuStatus = urlParams.get("reveniu"); // Parámetro específico de Reveniu

    if (paymentStatus === "mock_success") {
      // En modo mock, activar suscripción automáticamente
      handleMockPaymentSuccess();
    } else if (paymentStatus === "success" || reveniuStatus === "success") {
      // Si viene de un pago real (MercadoPago o Reveniu), esperar y refrescar múltiples veces
      handlePaymentSuccess();
    }
  }, []);

  // Polling para verificar cambios de estado de suscripción
  useEffect(() => {
    if (!profile || loading) return;

    // Si el perfil está en trial o expired, hacer polling para verificar si cambió
    if (profile.subscription_status === "trial" || profile.subscription_status === "expired") {
      if (!subscriptionPolling) {
        console.log("🔄 Iniciando polling de estado de suscripción...");
        setSubscriptionPolling(true);

        const pollInterval = setInterval(async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const { data: updatedProfile, error } = await supabase
              .from("profiles")
              .select("subscription_status")
              .eq("id", session.user.id)
              .single();

            if (!error && updatedProfile) {
              if (updatedProfile.subscription_status === "active") {
                console.log("✅ ¡Estado cambió a active durante polling!");
                setProfile({ ...profile, subscription_status: "active" });
                setSubscriptionPolling(false);
                clearInterval(pollInterval);
              }
            }
          } catch (error) {
            console.error("Error en polling:", error);
          }
        }, 5000); // Verificar cada 5 segundos

        // Detener polling después de 5 minutos
        setTimeout(() => {
          console.log("⏰ Deteniendo polling automático");
          setSubscriptionPolling(false);
          clearInterval(pollInterval);
        }, 5 * 60 * 1000);

        return () => clearInterval(pollInterval);
      }
    } else {
      // Si el estado ya es active, detener polling
      if (subscriptionPolling) {
        setSubscriptionPolling(false);
      }
    }
  }, [profile, loading, subscriptionPolling]);

  async function handlePaymentSuccess() {
    console.log("💳 Procesando pago exitoso, esperando actualización del webhook...");

    // Intentar refrescar múltiples veces para dar tiempo al webhook
    const maxAttempts = 10;
    const delayMs = 2000; // 2 segundos entre intentos

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔄 Intento ${attempt}/${maxAttempts} de verificar estado de suscripción...`);

      await new Promise(resolve => setTimeout(resolve, delayMs));

      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          console.log("❌ No hay sesión activa");
          continue;
        }

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error("❌ Error obteniendo perfil:", error);
          continue;
        }

        console.log(`📊 Estado actual: ${profileData.subscription_status}`);

        // Si el estado cambió a activo, refrescar completamente
        if (profileData.subscription_status === "active") {
          console.log("✅ ¡Suscripción activada exitosamente!");
          setProfile(profileData);

          // Limpiar parámetros de URL
          const url = new URL(window.location.href);
          url.searchParams.delete("payment");
          url.searchParams.delete("reveniu");
          window.history.replaceState({}, "", url.toString());

          return;
        }

        // Si sigue en trial o expired, continuar esperando
        if (profileData.subscription_status === "trial" || profileData.subscription_status === "expired") {
          console.log(`⏳ Estado sigue siendo ${profileData.subscription_status}, esperando webhook...`);
          continue;
        }

      } catch (error) {
        console.error("❌ Error en verificación:", error);
      }
    }

    console.log("⚠️ No se pudo verificar la activación automática. El webhook puede estar tardando más de lo esperado.");
    console.log("💡 El usuario puede refrescar la página manualmente para ver los cambios.");
  }

  async function handleMockPaymentSuccess() {
    if (!profile) {
      // Esperar a que el perfil se cargue
      setTimeout(handleMockPaymentSuccess, 500);
      return;
    }

    try {
      console.log("📦 Procesando pago mock exitoso...");
      
      // Obtener plan
      const { data: plans } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .single();

      if (!plans) {
        console.error("No se encontró el plan");
        return;
      }

      // Actualizar perfil a active
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ subscription_status: "active" })
        .eq("id", profile.id);

      if (profileError) {
        console.error("Error actualizando perfil:", profileError);
        return;
      }

      // Crear suscripción
      const renewalDate = new Date();
      renewalDate.setDate(renewalDate.getDate() + 30);

      await supabase.from("subscriptions").upsert([
        {
          user_id: profile.id,
          plan_id: plans.id,
          mercadopago_id: `MOCK-${Date.now()}`,
          status: "active",
          start_date: new Date().toISOString(),
          renewal_date: renewalDate.toISOString(),
          trial: false,
        },
      ], {
        onConflict: "mercadopago_id"
      });

      console.log("✅ Suscripción mock activada");
      
      // Limpiar URL y refrescar
      window.history.replaceState({}, "", "/dashboard");
      checkAuth();
    } catch (error: any) {
      console.error("Error procesando pago mock:", error);
    }
  }

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

      // Verificar si el trial expiró por fecha (15 días)
      if (profileData.subscription_status === "trial") {
        const createdAt = new Date(profileData.created_at);
        const now = new Date();
        const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

        console.log(`📅 Trial check: Cuenta creada hace ${daysSinceCreation} días`);

        if (daysSinceCreation >= 15) {
          console.log("⏰ Trial expirado - Actualizando estado...");

          // Actualizar estado a expired
          await supabase
            .from("profiles")
            .update({ subscription_status: "expired" })
            .eq("id", profileData.id);

          // Actualizar estado local
          profileData.subscription_status = "expired";
        }
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

      // Obtener token de sesión para autenticación
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Error: No se pudo verificar tu sesión. Por favor inicia sesión nuevamente.");
        router.push("/login");
        return;
      }

      // Llamar a la API route para crear la preferencia
      const response = await fetch("/api/create-subscription-preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: profile.id,
          userEmail: profile.email,
          planId: plans.id,
          planName: plans.name,
          planPrice: plans.price,
        }),
      });

      const result = await response.json();
      console.log("📦 Resultado de create-subscription-preference:", result);

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

