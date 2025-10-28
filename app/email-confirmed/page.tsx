"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function EmailConfirmedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConfirmationAndRedirect();
  }, []);

  async function checkConfirmationAndRedirect() {
    try {
      // Wait a moment for Supabase to process the confirmation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Check if user is confirmed
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setLoading(false);
        // Redirect to dashboard after showing success message
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setError("No se pudo verificar tu cuenta. Por favor inicia sesión manualmente.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Email confirmation error:", err);
      setError("Ocurrió un error al confirmar tu cuenta.");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--brand-start))]/5 via-white to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <Loader2 className="w-12 h-12 text-[rgb(var(--brand-mid))] animate-spin" />
            <h2 className="text-xl font-semibold text-slate-900">Verificando tu email...</h2>
            <p className="text-sm text-slate-600">Un momento por favor</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--brand-start))]/5 via-white to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <p className="text-red-600">{error}</p>
              <Button onClick={() => router.push("/login")} className="w-full">
                Ir al inicio de sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--brand-start))]/5 via-white to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[rgb(var(--brand-start))]/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-[rgb(var(--brand-mid))]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">¡Email confirmado!</h2>
            <p className="text-slate-600">
              Tu cuenta ha sido verificada exitosamente. Redirigiendo a tu dashboard...
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

