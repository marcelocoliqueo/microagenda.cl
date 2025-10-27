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
  {
    icon: "🗓️",
    title: "Agenda Online",
    description: "Recibe reservas 24/7 desde cualquier dispositivo. Tus clientes pueden agendar directamente sin tener que escribirte.",
  },
  {
    icon: "✅",
    title: "Confirmación Flexible",
    description: "Elige entre confirmación automática o manual. Tú decides si quieres control total o automatización completa.",
  },
  {
    icon: "💬",
    title: "Recordatorios por WhatsApp",
    description: "Envío automático de recordatorios para reducir inasistencias. Mensajes personalizables con nombre, hora y servicio.",
  },
  {
    icon: "📧",
    title: "Notificaciones por Email",
    description: "Envía correos automáticos de confirmación y recordatorio. Avisa si hay cancelaciones o cambios.",
  },
  {
    icon: "📊",
    title: "Estadísticas del Negocio",
    description: "Visualiza tus citas completadas, canceladas y tus ingresos estimados. Métricas simples para conocer tu rendimiento.",
  },
  {
    icon: "🌐",
    title: "Página Pública Personalizada",
    description: "URL única de tu negocio (ejemplo: microagenda.cl/tunegocio). Muestra tus servicios, horarios disponibles y botón para agendar.",
  },
  {
    icon: "💬",
    title: "Soporte Prioritario",
    description: "Atención rápida por chat o correo ante cualquier duda.",
  },
];

function DemoInteractivo() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<{
    name: string;
    duration: number;
    price: number;
  } | null>(null);
  const totalSteps = 4;

  const services = [
    { id: 1, name: "Corte de cabello", duration: 45, price: 15000 },
    { id: 2, name: "Manicure", duration: 60, price: 12000 },
  ];

  const steps = [
    { number: 1, title: "Ver servicios", desc: "Tu cliente ve tus servicios" },
    { number: 2, title: "Elegir servicio", desc: "Selecciona lo que necesita" },
    { number: 3, title: "Completar datos", desc: "Nombre, teléfono, fecha y hora" },
    { number: 4, title: "¡Listo!", desc: "Reserva confirmada automáticamente" },
  ];

  const handleServiceSelect = (service: typeof services[0]) => {
    setSelectedService(service);
    setStep(2);
  };

  return (
    <section id="demo" className="relative py-14 md:py-20 scroll-mt-24 md:scroll-mt-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">Así de simple reservan</h3>
          <p className="text-slate-600">3 pasos y listo. Sin complicaciones.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 px-4">
            {steps.map((s, i) => (
              <div key={s.number} className="flex items-center flex-1">
                <button
                  onClick={() => setStep(s.number)}
                  className={`flex flex-col items-center gap-2 transition-all ${
                    step === s.number ? 'scale-110' : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      step === s.number
                        ? 'bg-gradient-to-r from-[rgb(var(--brand-start))] to-[rgb(var(--brand-mid))] text-white shadow-lg'
                        : step > s.number
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                  </div>
                  <span className="text-xs font-medium text-slate-700 hidden sm:block">{s.title}</span>
                </button>
                {i < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 rounded transition-colors ${
                      step > s.number ? 'bg-green-200' : 'bg-slate-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Content Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-slate-200/70 bg-white/70 backdrop-blur shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="border-b border-slate-200/70 bg-white/60 backdrop-blur px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img 
                    src="/logo.svg" 
                    alt={`${APP_NAME} Logo`}
                    className="h-6 w-6"
                  />
                  <span className="text-sm font-bold text-slate-900">{APP_NAME}</span>
                </div>
                <span className="text-xs text-slate-500">Paso {step} de {totalSteps}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 min-h-[320px] flex flex-col">
              {/* Step 1: Servicios */}
              {step === 1 && (
                <div className="flex-1">
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-slate-900 mb-1">María González</h4>
                    <p className="text-sm text-slate-600">Salón de Belleza</p>
                  </div>
                  <h5 className="font-semibold text-slate-900 mb-3">Elige tu servicio</h5>
                  <div className="space-y-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className="w-full rounded-lg border-2 border-slate-200 bg-white p-3 hover:border-[rgb(var(--brand-mid))] hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-left">
                            <div className="font-medium text-slate-900">{service.name}</div>
                            <div className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {service.duration} min
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-slate-900">${service.price.toLocaleString('es-CL')}</div>
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-4">
                    👆 Haz clic en un servicio para continuar
                  </p>
                </div>
              )}

              {/* Step 2: Seleccionar servicio */}
              {step === 2 && selectedService && (
                <div className="flex-1">
                  <h5 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Servicio seleccionado
                  </h5>
                  <div className="space-y-3">
                    <div className="rounded-lg border-2 border-[rgb(var(--brand-mid))] bg-green-50 p-4 shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-slate-900">{selectedService.name}</div>
                        <Check className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-sm text-slate-600 space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Duración: {selectedService.duration} minutos
                        </div>
                        <div className="font-semibold text-slate-900">
                          Precio: ${selectedService.price.toLocaleString('es-CL')}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setStep(1)}
                      className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
                    >
                      ← Cambiar servicio
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Completar datos */}
              {step === 3 && (
                <div className="flex-1">
                  <h5 className="font-semibold text-slate-900 mb-4">Completa tus datos</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Nombre</label>
                      <div className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700">
                        Juan Pérez
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">WhatsApp</label>
                      <div className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700">
                        +56912345678
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-1">Fecha</label>
                        <div className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700">
                          28 Oct
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-700 block mb-1">Hora</label>
                        <div className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700">
                          10:00
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmación */}
              {step === 4 && selectedService && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h5 className="text-xl font-bold text-slate-900 mb-2">¡Reserva confirmada!</h5>
                  <p className="text-sm text-slate-600 mb-4">
                    Juan recibirá confirmación por WhatsApp y email
                  </p>
                  <div className="w-full bg-slate-50 rounded-lg p-4 text-left">
                    <div className="text-xs text-slate-600 space-y-1">
                      <div><span className="font-medium">Servicio:</span> {selectedService.name}</div>
                      <div><span className="font-medium">Duración:</span> {selectedService.duration} min</div>
                      <div><span className="font-medium">Fecha:</span> 28 Oct, 10:00</div>
                      <div><span className="font-medium">Cliente:</span> Juan Pérez</div>
                      <div><span className="font-medium">Total:</span> ${selectedService.price.toLocaleString('es-CL')}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(Math.max(1, step - 1))}
                  disabled={step === 1}
                  className="text-sm"
                >
                  Anterior
                </Button>
                {step < totalSteps ? (
                  <Button
                    size="sm"
                    onClick={() => setStep(Math.min(totalSteps, step + 1))}
                    disabled={step === 1 && !selectedService}
                    className="bg-gradient-to-r from-[rgb(var(--brand-start))] to-[rgb(var(--brand-mid))] text-white text-sm disabled:opacity-50"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setStep(1);
                      setSelectedService(null);
                    }}
                    variant="outline"
                    className="text-sm"
                  >
                    Ver de nuevo
                  </Button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <p className="text-center text-sm text-slate-600 mt-6">
            {steps[step - 1].desc}
          </p>
        </div>
      </div>
    </section>
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
      className="relative overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 md:pt-36 md:pb-36 min-h-[85svh] sm:min-h-[90svh]"
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
                <img 
                  src="/logo.svg" 
                  alt={`${APP_NAME} Logo`}
                  className="h-16 w-16 md:h-20 md:w-20 drop-shadow-lg"
                />
              </div>

              {/* eyebrow badge */}
              <div className="flex justify-center md:justify-start mb-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur px-3 py-1 text-xs text-slate-700 font-medium">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Agenda premium para profesionales
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-slate-900 mb-4 sm:mb-6 leading-tight">
                Gestiona reservas con una experiencia a la altura de tu marca
              </h1>
              <p className="text-base sm:text-base md:text-xl text-slate-600 mb-6 md:mb-10 max-w-2xl md:max-w-none mx-auto md:mx-0 leading-relaxed">
                Un solo plan. Reservas 24/7, confirmaciones y recordatorios inteligentes; todo sin esfuerzo.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start items-stretch sm:items-center mb-5 sm:mb-4 w-full sm:w-auto">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="relative w-full bg-gradient-to-r from-[rgb(var(--brand-start))] via-[rgb(var(--brand-mid))] to-[rgb(var(--brand-end))] hover:brightness-105 text-white px-8 py-5 sm:py-6 text-lg sm:text-lg font-semibold shadow-lg hover:shadow-2xl transition-all rounded-[14px] ring-1 ring-white/10 overflow-hidden will-change-transform hover:-translate-y-0.5 hover:scale-[1.01]"
                  >
                    <span className="absolute inset-0 opacity-35 bg-[radial-gradient(1200px_200px_at_0%_0%,rgba(255,255,255,0.25),transparent_40%)]" />
                    Probar Gratis
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#demo" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-[rgb(var(--brand-mid))]/40 hover:border-[rgb(var(--brand-mid))] text-slate-800 px-8 py-5 sm:py-6 text-lg sm:text-lg font-medium rounded-[14px]"
                  >
                    Ver demo en 30s
                  </Button>
                </Link>
              </div>

              <p className="text-sm sm:text-sm text-slate-500 text-center md:text-left">
                {formatCurrency(PLAN_PRICE)}/mes · Sin tarjeta · Cancela cuando quieras
              </p>
            </div>

            {/* Right: parallax mockup */}
            <div className="relative mt-8 md:mt-0">
            <div className="relative mx-auto md:mx-0 w-full md:w-[min(580px,100%)] h-[420px] sm:h-96 md:h-[360px] [perspective:1000px]">
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
                  {/* content real data */}
                  <div className="p-3 sm:p-4">
                    {/* 4 stats cards */}
                    <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-3">
                      <div className="bg-white/70 rounded-lg p-2 sm:p-2 border border-slate-200/50">
                        <div className="text-[10px] sm:text-[9px] text-slate-500 mb-0.5">Total</div>
                        <div className="text-lg sm:text-base font-bold text-slate-900">24</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2 sm:p-2 border border-slate-200/50">
                        <div className="text-[10px] sm:text-[9px] text-slate-500 mb-0.5">Confirm.</div>
                        <div className="text-lg sm:text-base font-bold text-emerald-600">18</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2 sm:p-2 border border-slate-200/50">
                        <div className="text-[10px] sm:text-[9px] text-slate-500 mb-0.5">Pend.</div>
                        <div className="text-lg sm:text-base font-bold text-yellow-600">3</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2 sm:p-2 border border-slate-200/50">
                        <div className="text-[10px] sm:text-[9px] text-slate-500 mb-0.5">Ingresos</div>
                        <div className="text-lg sm:text-base font-bold text-slate-900">$245k</div>
                      </div>
                    </div>
                    {/* appointments list */}
                    <div className="space-y-2 sm:space-y-1.5">
                      <div className="bg-white/70 rounded-lg p-2.5 sm:p-2 border border-slate-200/50">
                        <div className="flex items-center gap-1.5 mb-1 sm:mb-0.5">
                          <span className="text-xs sm:text-[10px] font-medium text-slate-900">María González</span>
                          <span className="text-[9px] sm:text-[8px] px-1.5 py-0.5 bg-green-100 text-green-800 rounded whitespace-nowrap">Confirmada</span>
                        </div>
                        <div className="text-[11px] sm:text-[9px] text-slate-600">Corte de cabello</div>
                        <div className="text-[10px] sm:text-[8px] text-slate-500">28 Oct · 10:00</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2.5 sm:p-2 border border-slate-200/50">
                        <div className="flex items-center gap-1.5 mb-1 sm:mb-0.5">
                          <span className="text-xs sm:text-[10px] font-medium text-slate-900">Juan Pérez</span>
                          <span className="text-[9px] sm:text-[8px] px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded whitespace-nowrap">Pendiente</span>
                        </div>
                        <div className="text-[11px] sm:text-[9px] text-slate-600">Manicure</div>
                        <div className="text-[10px] sm:text-[8px] text-slate-500">28 Oct · 14:30</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2.5 sm:p-2 border border-slate-200/50">
                        <div className="flex items-center gap-1.5 mb-1 sm:mb-0.5">
                          <span className="text-xs sm:text-[10px] font-medium text-slate-900">Carolina Silva</span>
                          <span className="text-[9px] sm:text-[8px] px-1.5 py-0.5 bg-green-100 text-green-800 rounded whitespace-nowrap">Confirmada</span>
                        </div>
                        <div className="text-[11px] sm:text-[9px] text-slate-600">Masaje relajante</div>
                        <div className="text-[10px] sm:text-[8px] text-slate-500">29 Oct · 09:00</div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2.5 sm:p-2 border border-slate-200/50 opacity-70">
                        <div className="flex items-center gap-1.5 mb-1 sm:mb-0.5">
                          <span className="text-xs sm:text-[10px] font-medium text-slate-900">Roberto Muñoz</span>
                          <span className="text-[9px] sm:text-[8px] px-1.5 py-0.5 bg-green-100 text-green-800 rounded whitespace-nowrap">Confirmada</span>
                        </div>
                        <div className="text-[11px] sm:text-[9px] text-slate-600">Barba y afeitado</div>
                        <div className="text-[10px] sm:text-[8px] text-slate-500">29 Oct · 11:30</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* floating stats card */}
                <div
                  className="absolute right-3 bottom-3 md:-right-6 md:-bottom-8 w-40 sm:w-40 md:w-44 h-24 sm:h-24 md:h-28 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/70 shadow-xl p-3 sm:p-4"
                  style={{
                    transform: enableParallax
                      ? `translate3d(${(mouse.x - dims.w / 2) * 0.04}px, ${(mouse.y - dims.h / 2) * 0.04}px, 0)`
                      : undefined,
                  }}
                >
                  <div className="text-xs sm:text-xs text-slate-500 mb-1">Ingresos</div>
                  <div className="text-xl sm:text-xl font-semibold text-slate-900">{formatCurrency(245000)}</div>
                  <div className="text-xs sm:text-xs text-emerald-600 mt-1">+18% esta semana</div>
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
    <div className="min-h-screen bg-white">
      {/* Navbar glass */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/20 bg-white/60 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <img 
                src="/logo.svg" 
                alt={`${APP_NAME} Logo`}
                className="h-8 w-8 sm:h-10 sm:w-10 group-hover:scale-110 transition-transform"
              />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login">
                <Button variant="ghost" className="hidden sm:inline-flex text-slate-700 hover:text-primary">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white shadow-md text-sm sm:text-base px-4 sm:px-4 font-semibold">
                  Comenzar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero premium */}
      <HeroPremium />

      {/* Demo 30s */}
      <DemoInteractivo />

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
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-primary/5 to-white" />
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
                        <span>Sin permanencia · Cancela cuando quieras</span>
                        <div className="group relative">
                          <Info className="w-4 h-4 text-slate-400" />
                          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 w-48 rounded-md border border-slate-200 bg-white/95 backdrop-blur px-3 py-2 text-xs text-slate-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            Precio final con IVA incluido. Sin cargos ocultos ni comisiones adicionales.
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

                  <ul className="grid md:grid-cols-2 gap-6 mt-8">
                    {planBenefits.map((benefit, index) => (
                      <motion.li
                        key={benefit.title}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.04 }}
                        viewport={{ once: true }}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-0.5 text-2xl flex-shrink-0">
                          {benefit.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{benefit.title}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{benefit.description}</p>
                        </div>
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
      <footer className="bg-white border-t border-slate-200 py-12 mt-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <img 
                  src="/logo.svg" 
                  alt={`${APP_NAME} Logo`}
                  className="h-8 w-8"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{APP_NAME}</span>
              </div>
              <p className="text-sm text-slate-600">© 2025 {APP_NAME}. Todos los derechos reservados.</p>
            </div>
            <div className="flex gap-8 text-sm">
              <Link href="/privacy" className="text-slate-600 hover:text-primary transition-colors font-medium">
                Política de Privacidad
              </Link>
              <Link href="/terms" className="text-slate-600 hover:text-primary transition-colors font-medium">
                Términos y Condiciones
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
