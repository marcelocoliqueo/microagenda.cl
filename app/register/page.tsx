"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { APP_NAME } from "@/lib/constants";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    businessName: "",
    acceptTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.acceptTerms) {
      toast({
        title: "Error",
        description: "Debes aceptar los términos y la política de privacidad",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Update profile (el trigger ya lo creó, solo actualizamos los datos adicionales)
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            name: formData.name,
            business_name: formData.businessName || null,
            subscription_status: "trial",
            auto_confirm: true,
          })
          .eq("id", authData.user.id);

        if (profileError) {
          console.error("Profile update error:", profileError);
          // No lanzamos error aquí porque el perfil ya existe
        }

        // Check if email confirmation is required
        const isEmailConfirmed = !!authData.user.email_confirmed_at;
        
        // Debug log
        console.log("🔍 Registration debug:", {
          email: authData.user.email,
          email_confirmed_at: authData.user.email_confirmed_at,
          isEmailConfirmed,
        });

        toast({
          title: isEmailConfirmed ? "¡Cuenta creada!" : "¡Revise su email!",
          description: isEmailConfirmed 
            ? "Redirigiendo al dashboard..." 
            : "Le enviamos un enlace de confirmación",
        });

        // Enviar email de bienvenida (solo si el email está confirmado)
        if (isEmailConfirmed && authData.user.email) {
          try {
            await fetch("/api/send-welcome-email", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userEmail: authData.user.email,
                userName: formData.name,
                businessName: formData.businessName || undefined,
              }),
            });
          } catch (emailError) {
            console.error("Error enviando email de bienvenida:", emailError);
            // No fallar el flujo si el email falla
          }
        }

        // Always redirect to verify-email when email is not confirmed
        if (!isEmailConfirmed) {
          // Email needs confirmation
          console.log("➡️ Redirecting to /verify-email");
          router.push("/verify-email");
        } else {
          // Email already confirmed (shouldn't happen on new registration)
          console.log("➡️ Redirecting to /dashboard");
          await new Promise(resolve => setTimeout(resolve, 500));
          router.push("/dashboard");
          router.refresh();
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Error",
        description: error.message || "Ocurrió un error al crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3 group">
            <img 
              src="/logo.png" 
              alt={`${APP_NAME} Logo`}
              className="h-16 w-16 object-contain group-hover:scale-110 transition-transform"
            />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Crear cuenta</CardTitle>
            <CardDescription>
              Comienza a gestionar tus citas profesionales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessName">
                  Nombre del negocio (opcional)
                </Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Salón de Belleza María"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                />
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, acceptTerms: checked as boolean })
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Acepto los{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Términos y Condiciones
                  </Link>{" "}
                  y la{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Política de Privacidad
                  </Link>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </Button>

              <p className="text-center text-sm text-muted">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted mt-8 max-w-md mx-auto">
          Al registrarte, aceptas que tus datos personales serán utilizados para
          gestionar tu cuenta y tus citas, conforme a la Ley N° 19.628 sobre
          Protección de la Vida Privada.
        </p>
      </motion.div>
    </div>
  );
}
