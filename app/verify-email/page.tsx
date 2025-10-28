"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[rgb(var(--brand-start))]/5 via-white to-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3 group">
            <img 
              src="/logo.svg" 
              alt={`${APP_NAME} Logo`}
              className="h-16 w-16 object-contain group-hover:scale-110 transition-transform"
            />
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-[rgb(var(--brand-start))]/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-[rgb(var(--brand-mid))]" />
            </div>
            <CardTitle className="text-2xl">¡Revisa tu email!</CardTitle>
            <CardDescription className="text-base">
              Te enviamos un enlace de confirmación a tu correo electrónico
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5">📧</span>
                <div>
                  <div className="font-medium">¿No recibiste el email?</div>
                  <div className="text-slate-600 mt-1">
                    Verifica tu bandeja de spam o correo no deseado
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5">🔗</span>
                <div>
                  <div className="font-medium">Haz clic en el enlace</div>
                  <div className="text-slate-600 mt-1">
                    Te llevará directamente a tu dashboard
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5">⏱️</span>
                <div>
                  <div className="font-medium">¿Tarda demasiado?</div>
                  <div className="text-slate-600 mt-1">
                    El email puede tardar 1-2 minutos en llegar
                  </div>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Link>
            </Button>

            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">
                ¿Ya confirmaste tu email?
              </p>
              <Button variant="link" className="text-[rgb(var(--brand-mid))]" asChild>
                <Link href="/dashboard">
                  Continuar al dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6 max-w-md mx-auto">
          ¿Necesitas ayuda? <Link href="mailto:soporte@microagenda.cl" className="text-[rgb(var(--brand-mid))] hover:underline">Contáctanos</Link>
        </p>
      </motion.div>
    </div>
  );
}

