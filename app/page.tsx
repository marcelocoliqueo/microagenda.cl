"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Check,
  ChevronRight,
  Info
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, PLAN_PRICE, APP_NAME } from "@/lib/constants";
import { useEffect, useState } from "react";

// Diferenciales (mensajes implícitos, no comparaciones literales)
const differentiators = [
  {
    icon: Zap,
    title: "Instalación en minutos",
    description: "De cero a tu agenda lista sin fricciones ni curvas de aprendizaje.",
  },
  {
    icon: Calendar,
    title: "Todo incluido",
    description: "Reservas 24/7, confirmaciones y recordatorios automatizados, sin extras ocultos.",
  },
  {
    icon: Clock,
    title: "Hecho para WhatsApp",
    description: "Recordatorios inteligentes donde tus clientes realmente responden.",
  },
  {
    icon: TrendingUp,
    title: "Crece con datos",
    description: "Métricas claras para entender horarios pico e ingresos.",
  },
  {
    icon: Shield,
    title: "Confianza y privacidad",
    description: "Cumplimiento Ley 19.628, control total de tus datos.",
  },
  {
    icon: Zap,
    title: "Rendimiento premium",
    description: "Interfaz veloz y agradable para ti y tus clientes.",
  },
];

// Inclusiones del plan único
const planBenefits = [
  "Agenda online disponible 24/7",
  "Confirmaciones automáticas de reservas",
  "Recordatorios por WhatsApp incluidos",
  "Notificaciones por correo electrónico",
  "Estadísticas esenciales de tu negocio",
  "Soporte humano prioritario",
  "Cumplimiento Ley 19.628 (Chile)",
  "Cancela cuando quieras",
];

function LogoPlaceholder({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 28"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Wordmark */}
      <rect x="6" y="10" width="18" height="8" rx="2" fill="currentColor" opacity="0.85" />
      <rect x="28" y="10" width="16" height="8" rx="2" fill="currentColor" opacity="0.7" />
      <rect x="48" y="10" width="24" height="8" rx="2" fill="currentColor" opacity="0.55" />
      <rect x="76" y="10" width="18" height="8" rx="2" fill="currentColor" opacity="0.4" />
      <circle cx="104" cy="14" r="4" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

function FeatherLogoSVG({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 40c10-2 18.5-8.5 26-22 1.8-3.2 3-6.6 4-10" opacity="0.9" />
        <path d="M10 34c6-1 12-6 18-16" opacity="0.8" />
        <path d="M14 28c4-1 8-4 12-10" opacity="0.7" />
        <path d="M6 42l10-10" opacity="0.9" />
      </g>
    </svg>
  );
}

function HeroPremium() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [reduceMotion, setReduceMotion] = useState(false);
  const [pointerFine, setPointerFine] = useState(true);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pf = window.matchMedia("(pointer: fine)");
    setReduceMotion(rm.matches);
    setPointerFine(pf.matches);
    const onPfChange = (e: MediaQueryListEvent) => setPointerFine(e.matches);
    const onRmChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    pf.addEventListener("change", onPfChange);
    rm.addEventListener("change", onRmChange);
    return () => {
      pf.removeEventListener("change", onPfChange);
      rm.removeEventListener("change", onRmChange);
    };
  }, []);

  const enableParallax = pointerFine && !reduceMotion;
  const staticAlpha = !pointerFine ? 0.06 : reduceMotion ? 0.04 : 0.08;
  const spotlightBg = enableParallax
    ? `radial-gradient(600px circle at ${mouse.x}px ${mouse.y}px, rgba(2,6,23,0.12), transparent 40%)`
    : `radial-gradient(600px circle at 50% 45%, rgba(2,6,23,${staticAlpha}), transparent 40%)`;

  return (
    <section
      className="relative overflow-hidden pt-24 pb-16 md:pt-36 md:pb-36 min-h-[90svh]"
      onMouseMove={(e) => {
        if (!enableParallax) return;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        setDims({ w: rect.width, h: rect.height });
      }}
    >
      {/* ambient gradients */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute -top-24 -right-16 w-[24rem] h-[24rem] md:w-[36rem] md:h-[36rem] rounded-full bg-gradient-to-br from-slate-200 via-white to-slate-100 blur-3xl opacity-70" />
        <div className="absolute -bottom-24 -left-16 w-[24rem] h-[24rem] md:w-[36rem] md:h-[36rem] rounded-full bg-gradient-to-tr from-emerald-100 via-white to-blue-100 blur-3xl opacity-70" />
      </div>

      {/* spotlight following cursor */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
        style={{ background: spotlightBg }}
      />

      {/* subtle grid overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)] opacity-[0.35] md:opacity-[0.5]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(2,6,23,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(2,6,23,0.06) 1px, transparent 1px)",
            backgroundSize: "28px 28px, 28px 28px",
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto"
        >
          <div className="grid md:grid-cols-2 items-center gap-8 md:gap-10">
            {/* Left: copy */}
            <div className="text-center md:text-left">
              <div className="flex justify-center md:justify-start mb-6">
                <FeatherLogoSVG className="h-16 w-16 md:h-20 md:w-20 text-slate-800" />
              </div>

              {/* eyebrow badge */}
              <div className="flex justify-center md:justify-start mb-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/70 backdrop-blur px-3 py-1 text-xs text-slate-700">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                  Agenda premium para profesionales
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 mb-6">
                Gestiona reservas con una experiencia a la altura de tu marca
              </h1>
              <p className="text-sm sm:text-base md:text-xl text-slate-600 mb-6 md:mb-10 max-w-2xl md:max-w-none mx-auto md:mx-0">
                Un solo plan. Reservas 24/7, confirmaciones y recordatorios inteligentes; todo sin esfuerzo.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center mb-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="relative w-full sm:w-auto bg-gradient-to-r from-[rgb(var(--brand-start))] via-[rgb(var(--brand-mid))] to-[rgb(var(--brand-end))] hover:brightness-105 text-white px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg shadow-lg hover:shadow-2xl transition-all rounded-[14px] ring-1 ring-white/10 overflow-hidden will-change-transform hover:-translate-y-0.5 hover:scale-[1.01]"
                  >
                    <span className="absolute inset-0 opacity-35 bg-[radial-gradient(1200px_200px_at_0%_0%,rgba(255,255,255,0.25),transparent_40%)]" />
                    Probar Gratis
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#demo">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-2 border-[rgb(var(--brand-mid))]/40 hover:border-[rgb(var(--brand-mid))] text-slate-800 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-[14px]"
                  >
                    Ver demo en 30s
                  </Button>
                </Link>
              </div>

              <p className="text-sm text-slate-500 mb-4">
                {formatCurrency(PLAN_PRICE)}/mes · Sin tarjeta · Cancela cuando quieras
              </p>

              {/* Social proof */}
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-4 sm:gap-6 opacity-85 text-slate-400">
                  {[1,2,3,4,5].map((i) => (
                    <LogoPlaceholder key={i} className="h-5 w-20 sm:h-6 sm:w-24" />
                  ))}
                </div>
                <div className="text-xs sm:text-sm text-slate-600">Confiado por profesionales independientes en Chile</div>
                <span className="hidden sm:inline h-5 w-px bg-slate-300" />
                <span className="text-[11px] sm:text-xs text-slate-600 rounded-full border border-slate-200 bg-white/70 backdrop-blur px-2 py-0.5 sm:px-2.5 sm:py-1">
                  Cumplimiento Ley 19.628
                </span>
              </div>
            </div>

            {/* Right: parallax mockup */}
            <div className="relative">
            <div className="relative mx-auto md:mx-0 w-full max-w-[580px] aspect-[16/10] md:aspect-auto md:h-[360px] [perspective:1000px] overflow-hidden">
                {/* main dashboard card */}
                <div
                  className="absolute inset-0 rounded-3xl bg-white/60 backdrop-blur-xl border border-slate-200/70 shadow-2xl overflow-hidden"
                  style={{
                    transform: enableParallax
                      ? `translate3d(${(mouse.x - dims.w / 2) * 0.02}px, ${(mouse.y - dims.h / 2) * 0.02}px, 0) rotateX(${-(mouse.y - dims.h / 2) * 0.01}deg) rotateY(${(mouse.x - dims.w / 2) * 0.01}deg)`
                      : undefined,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* header bar */}
                  <div className="h-12 border-b border-slate-200/70 bg-white/60 backdrop-blur flex items-center px-4">
                    <div className="h-3 w-3 rounded-full bg-rose-400 mr-1.5" />
                    <div className="h-3 w-3 rounded-full bg-amber-400 mr-1.5" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  </div>
                  {/* content skeleton */}
                  <div className="p-5">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="h-20 rounded-xl bg-slate-100" />
                      <div className="h-20 rounded-xl bg-slate-100" />
                      <div className="h-20 rounded-xl bg-slate-100" />
                    </div>
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-8 rounded-lg bg-slate-100" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* floating stats card */}
                <div
                  className="absolute right-3 bottom-3 md:-right-6 md:-bottom-8 w-36 h-22 sm:w-40 sm:h-24 md:w-44 md:h-28 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/70 shadow-xl p-3 sm:p-4"
                  style={{
                    transform: enableParallax
                      ? `translate3d(${(mouse.x - dims.w / 2) * 0.04}px, ${(mouse.y - dims.h / 2) * 0.04}px, 0)`
                      : undefined,
                  }}
                >
                  <div className="text-[10px] sm:text-xs text-slate-500 mb-1">Ingresos</div>
                  <div className="text-lg sm:text-xl font-semibold text-slate-900">{formatCurrency(125000)}</div>
                  <div className="text-[10px] sm:text-xs text-emerald-600 mt-1">+18% esta semana</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar glass */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/20 bg-white/60 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="text-3xl group-hover:scale-110 transition-transform">🪶</div>
              <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex text-slate-700">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-slate-900 hover:bg-black text-white shadow-md">
                  Comenzar Gratis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero premium */}
      <HeroPremium />

      {/* Demo 30s */}
      <section id="demo" className="relative py-14 md:py-20 scroll-mt-24 md:scroll-mt-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">Demo en 30 segundos</h3>
            <p className="text-slate-600">Reserva, confirma y recuerda. Todo en un flujo simple.</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur p-4 shadow-xl">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <div className="h-10 rounded-lg bg-slate-100" />
                  <div className="h-10 rounded-lg bg-slate-100" />
                  <div className="h-10 rounded-lg bg-slate-100" />
                </div>
                <div className="md:col-span-2 space-y-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-12 rounded-lg bg-slate-100" />
                  ))}
                </div>
              </div>
            </div>
            </div>
        </div>
      </section>

      {/* Diferenciales implícitos */}
      <section id="diferenciales" className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 mb-4">
                Diseñado para destacar, pensado para funcionar
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Elegancia, velocidad y simplicidad en una sola experiencia.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {differentiators.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 160, damping: 18, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border border-slate-200/70 bg-white/70 backdrop-blur hover:border-[rgb(var(--brand-mid))]/40 hover:shadow-2xl transition-all">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--brand-start))] to-[rgb(var(--brand-mid))] text-white flex items-center justify-center mb-4">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plan único: glass pricing */}
      <section className="relative py-16 md:py-28">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-slate-50 to-white" />
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-5xl font-semibold text-slate-900 mb-3">
                Un solo plan, todo incluido
              </h2>
              <p className="text-lg text-slate-600">
                Transparente y directo. Sin sorpresas.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Card className="relative border border-slate-200/70 bg-white/70 backdrop-blur-xl shadow-2xl overflow-hidden">
                <div className="pointer-events-none absolute inset-0 rounded-[inherit] border-2 border-transparent bg-[linear-gradient(120deg,rgba(var(--brand-start),0.25),rgba(var(--brand-mid),0.25),rgba(var(--brand-end),0.25))] animate-gradient z-0" />
                <CardContent className="p-8 md:p-10 relative z-10">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                      <div className="inline-block px-4 py-1 bg-gradient-to-r from-[rgb(var(--brand-start))] to-[rgb(var(--brand-mid))] text-white rounded-full text-sm font-medium mb-4">
                    Plan Único
                  </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl md:text-6xl font-semibold text-slate-900">
                        {formatCurrency(PLAN_PRICE)}
                      </span>
                      <span className="text-xl text-slate-600">/ mes</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 mt-2">
                        <span>IVA incluido · Cancela cuando quieras</span>
                        <div className="group relative">
                          <Info className="w-4 h-4 text-slate-400" />
                          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 w-48 rounded-md border border-slate-200 bg-white/95 backdrop-blur px-3 py-2 text-xs text-slate-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            Precio final. No hay cargos ocultos ni comisiones adicionales.
                          </div>
                        </div>
                      </div>
                    </div>
                    <Link href="/register" className="block md:min-w-[240px]">
                      <Button
                        size="lg"
                        className="relative w-full bg-gradient-to-r from-[rgb(var(--brand-start))] via-[rgb(var(--brand-mid))] to-[rgb(var(--brand-end))] hover:brightness-105 text-white py-6 text-lg font-semibold shadow-lg hover:shadow-2xl transition-all rounded-[14px] ring-1 ring-white/10 overflow-hidden hover:-translate-y-0.5 hover:scale-[1.01]"
                      >
                        <span className="absolute inset-0 opacity-35 bg-[radial-gradient(1200px_200px_at_0%_0%,rgba(255,255,255,0.25),transparent_40%)]" />
                        Comenzar Ahora
                        <ChevronRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                  </div>

                  <ul className="grid md:grid-cols-2 gap-4 mt-8">
                    {planBenefits.map((benefit, index) => (
                      <motion.li
                        key={benefit}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-0.5">
                          <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                        </div>
                        <span className="text-slate-700 leading-relaxed">{benefit}</span>
                      </motion.li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer minimal */}
      <footer className="bg-slate-900 text-slate-300 py-12 mt-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <span className="text-2xl">🪶</span>
                <span className="text-xl font-bold text-white">{APP_NAME}</span>
              </div>
              <p className="text-sm text-slate-400">© 2025 {APP_NAME}. Todos los derechos reservados.</p>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
