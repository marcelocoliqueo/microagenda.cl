"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Zap,
  MessageSquare,
  Mail,
  BarChart3,
  Shield,
  Check,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, PLAN_PRICE, APP_NAME } from "@/lib/constants";

// Features reales del MVP (no inventar nada)
const features = [
  {
    icon: Calendar,
    title: "Agenda Online",
    description: "Disponible 24/7 para que tus clientes reserven cuando quieran",
  },
  {
    icon: Zap,
    title: "Confirmación Automática",
    description: "Confirmaciones instantáneas sin intervención manual",
  },
  {
    icon: MessageSquare,
    title: "Recordatorios WhatsApp",
    description: "Automatización de mensajes para reducir inasistencias",
  },
  {
    icon: Mail,
    title: "Notificaciones Email",
    description: "Correos automáticos con cada reserva y recordatorio",
  },
  {
    icon: BarChart3,
    title: "Estadísticas",
    description: "Citas, clientes recurrentes y horas más solicitadas",
  },
  {
    icon: Shield,
    title: "Privacidad y Seguridad",
    description: "Cumplimiento con Ley 19.628 de Protección de Datos",
  },
];

// Beneficios del plan único
const planBenefits = [
  "Agenda online disponible 24/7",
  "Confirmaciones automáticas",
  "Recordatorios por WhatsApp",
  "Notificaciones por correo electrónico",
  "Estadísticas básicas",
  "Soporte prioritario",
  "Cumplimiento Ley 19.628",
  "Cancelación libre en cualquier momento",
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo con pluma */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="text-3xl group-hover:scale-110 transition-transform">
                🪶
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex text-slate-700">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                  Comenzar Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-green-50 pt-16 pb-20 md:pt-24 md:pb-32">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-30 -z-10" />

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            {/* Logo centrado arriba */}
            <div className="flex justify-center mb-6">
              <div className="text-6xl md:text-7xl">🪶</div>
            </div>

            {/* Título principal */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Gestiona tus citas profesionales{" "}
              <span className="bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
                sin complicaciones
              </span>
            </h1>

            {/* Subtítulo */}
            <p className="text-xl md:text-2xl text-slate-600 mb-10 max-w-2xl mx-auto font-light">
              Sistema de agendamiento diseñado para profesionales independientes.
              Recibe reservas, confirma citas y envía recordatorios automáticos.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link href="/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  Probar Gratis
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-slate-300 hover:border-blue-600 px-8 py-6 text-lg"
                >
                  Ver Demo
                </Button>
              </Link>
            </div>

            {/* Precio */}
            <p className="text-sm text-slate-500">
              Solo <span className="font-semibold text-slate-700">{formatCurrency(PLAN_PRICE)}/mes</span> · Sin permanencia
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                Todo lo que necesitas en un solo lugar
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Funcionalidades esenciales para gestionar tu negocio de forma profesional
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-2 border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group">
                    <CardContent className="p-6">
                      {/* Icon */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                        <feature.icon className="w-7 h-7 text-blue-600" />
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-slate-900 mb-3">
                        {feature.title}
                      </h3>

                      {/* Description */}
                      <p className="text-slate-600 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="demo" className="py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">
                Un solo plan, todo incluido
              </h2>
              <p className="text-lg text-slate-600">
                Sin sorpresas, sin tarifas ocultas
              </p>
            </div>

            {/* Pricing Card */}
            <div className="max-w-lg mx-auto">
              <Card className="border-2 border-blue-600 shadow-2xl hover:shadow-3xl transition-shadow">
                <CardContent className="p-8 md:p-10">
                  {/* Plan Badge */}
                  <div className="inline-block px-4 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                    Plan Único
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl md:text-6xl font-bold text-slate-900">
                        {formatCurrency(PLAN_PRICE)}
                      </span>
                      <span className="text-xl text-slate-600">/ mes</span>
                    </div>
                    <p className="text-slate-500 mt-2">Sin permanencia</p>
                  </div>

                  {/* Benefits List */}
                  <ul className="space-y-4 mb-8">
                    {planBenefits.map((benefit, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-0.5">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                        </div>
                        <span className="text-slate-700 leading-relaxed">
                          {benefit}
                        </span>
                      </motion.li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href="/register" className="block">
                    <Button
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      Comenzar Ahora
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>

                  {/* Footer Text */}
                  <p className="text-center text-sm text-slate-500 mt-6">
                    Cancela cuando quieras, sin compromisos
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-green-500 -z-10" />

        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Comienza a gestionar tus citas hoy
            </h2>
            <p className="text-xl md:text-2xl text-blue-50 mb-10 font-light">
              Únete a cientos de profesionales que ya confían en {APP_NAME}
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all"
              >
                Crear Cuenta Gratis
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Brand */}
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <span className="text-2xl">🪶</span>
                <span className="text-xl font-bold text-white">{APP_NAME}</span>
              </div>
              <p className="text-sm text-slate-400">
                © 2025 {APP_NAME}. Todos los derechos reservados.
              </p>
            </div>

            {/* Links */}
            <div className="flex gap-8 text-sm">
              <Link
                href="/privacy"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Política de Privacidad
              </Link>
              <Link
                href="/terms"
                className="text-slate-400 hover:text-white transition-colors"
              >
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
