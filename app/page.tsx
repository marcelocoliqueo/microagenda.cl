"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Mail, MessageSquare, TrendingUp, Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, PLAN_PRICE, APP_NAME } from "@/lib/constants";

const features = [
  {
    icon: Calendar,
    title: "Agenda Online",
    description: "Recibe reservas 24/7 desde cualquier dispositivo",
  },
  {
    icon: Clock,
    title: "Confirmación Automática",
    description: "Ahorra tiempo con confirmaciones instantáneas",
  },
  {
    icon: MessageSquare,
    title: "Recordatorios WhatsApp",
    description: "Reduce inasistencias con recordatorios automáticos",
  },
  {
    icon: Mail,
    title: "Notificaciones Email",
    description: "Mantén informados a tus clientes por correo",
  },
  {
    icon: TrendingUp,
    title: "Estadísticas",
    description: "Visualiza el crecimiento de tu negocio",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-surface sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            {APP_NAME}
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button>Comenzar Gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Gestiona tus citas profesionales
            <span className="text-primary"> sin complicaciones</span>
          </h1>
          <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
            Sistema de agendamiento diseñado para profesionales independientes.
            Recibe reservas, confirma citas y envía recordatorios automáticos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Probar Gratis
              </Button>
            </Link>
            <Link href="#demo">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Ver Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted mt-4">
            Solo {formatCurrency(PLAN_PRICE)}/mes · Sin permanencia
          </p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20 bg-surface">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Todo lo que necesitas en un solo lugar
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-lg mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Precio simple y transparente
          </h2>
          <Card className="border-2 border-primary">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl">Plan Único</CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold">{formatCurrency(PLAN_PRICE)}</span>
                <span className="text-muted ml-2">/ mes</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-8">
                {[
                  "Citas ilimitadas",
                  "Agenda pública personalizada",
                  "Recordatorios automáticos",
                  "Notificaciones por email y WhatsApp",
                  "Estadísticas y reportes",
                  "Soporte prioritario",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block">
                <Button size="lg" className="w-full">
                  Comenzar Ahora
                </Button>
              </Link>
              <p className="text-center text-sm text-muted mt-4">
                Cancela cuando quieras, sin compromisos
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 bg-surface">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Comienza a gestionar tus citas hoy
          </h2>
          <p className="text-xl text-muted mb-8">
            Únete a cientos de profesionales que ya confían en {APP_NAME}
          </p>
          <Link href="/register">
            <Button size="lg">Crear Cuenta Gratis</Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <div className="text-xl font-bold text-primary mb-2">{APP_NAME}</div>
              <p className="text-sm text-muted">
                © 2025 {APP_NAME}. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-muted hover:text-text">
                Privacidad
              </Link>
              <Link href="/terms" className="text-muted hover:text-text">
                Términos
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
