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
  Info,
  Sparkles
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
    title: "Hecho para móviles",
    description: "Diseño responsive. Tus clientes agendan desde cualquier dispositivo.",
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
    badge: "ÚNICO",
    description: "Elige entre confirmación automática o manual. Tú decides si quieres control total o automatización completa.",
  },
  {
    icon: "📧",
    title: "Recordatorios por Email",
    description: "Envío automático de recordatorios por email para reducir inasistencias. Mensajes personalizables con nombre, hora y servicio.",
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
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [brandColor, setBrandColor] = useState("green");
  const totalSteps = 5;

  const brandColors = [
    { name: "Verde", value: "green", bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200", ring: "ring-emerald-200", gradient: "from-emerald-500 to-emerald-600", primary: "#10B981", accent: "#84CC16" },
    { name: "Azul", value: "blue", bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", border: "border-blue-200", ring: "ring-blue-200", gradient: "from-blue-500 to-blue-600", primary: "#3B82F6", accent: "#60A5FA" },
    { name: "Rojo", value: "red", bg: "bg-rose-500", text: "text-rose-600", light: "bg-rose-50", border: "border-rose-200", ring: "ring-rose-200", gradient: "from-rose-500 to-rose-600", primary: "#F43F5E", accent: "#FB7185" },
    { name: "Morado", value: "purple", bg: "bg-purple-500", text: "text-purple-600", light: "bg-purple-50", border: "border-purple-200", ring: "ring-purple-200", gradient: "from-purple-500 to-purple-600", primary: "#8B5CF6", accent: "#A78BFA" },
    { name: "Naranja", value: "orange", bg: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50", border: "border-orange-200", ring: "ring-orange-200", gradient: "from-orange-500 to-orange-600", primary: "#F97316", accent: "#FB923C" },
    { name: "Rosado", value: "pink", bg: "bg-pink-500", text: "text-pink-600", light: "bg-pink-50", border: "border-pink-200", ring: "ring-pink-200", gradient: "from-pink-500 to-pink-600", primary: "#EC4899", accent: "#F472B6" },
    { name: "Celeste", value: "cyan", bg: "bg-cyan-500", text: "text-cyan-600", light: "bg-cyan-50", border: "border-cyan-200", ring: "ring-cyan-200", gradient: "from-cyan-500 to-cyan-600", primary: "#06B6D4", accent: "#22D3EE" },
    { name: "Amarillo", value: "yellow", bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-50", border: "border-amber-200", ring: "ring-amber-200", gradient: "from-amber-500 to-amber-600", primary: "#F59E0B", accent: "#FCD34D" },
  ];

  const currentColor = brandColors.find(c => c.value === brandColor) || brandColors[0];

  const services = [
    { id: 1, name: "Corte de cabello", duration: 45, price: 15000 },
    { id: 2, name: "Manicure", duration: 60, price: 12000 },
  ];

  const steps = [
    { number: 1, title: "Color de marca", desc: "Personaliza tu agenda con tu color" },
    { number: 2, title: "Ver servicios", desc: "Tu cliente ve tus servicios" },
    { number: 3, title: "Fecha y hora", desc: "Selecciona cuándo quiere reservar" },
    { number: 4, title: "Completar datos", desc: "Nombre y teléfono" },
    { number: 5, title: "¡Listo!", desc: "Reserva confirmada automáticamente" },
  ];

  const handleServiceSelect = (service: typeof services[0]) => {
    setSelectedService(service);
    setStep(3);
  };

  return (
    <section id="demo" className="relative py-14 md:py-20 scroll-mt-24 md:scroll-mt-32">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">Así de simple reservan</h3>
          <p className="text-slate-600">4 pasos y listo. Sin complicaciones.</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Stepper */}
          <div className="flex items-center justify-center mb-8 px-4">
            <div className="flex items-center gap-3 sm:gap-4">
              {steps.map((s, i) => (
                <div key={s.number} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-300 ${
                        step === s.number
                          ? `bg-gradient-to-r ${currentColor.gradient} text-white shadow-lg scale-110`
                          : step > s.number
                          ? `${currentColor.light} ${currentColor.text} ring-2 ${currentColor.ring}`
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {step > s.number ? <Check className="w-6 h-6" /> : s.number}
                    </div>
                    <span className={`text-xs sm:text-sm font-medium transition-colors text-center max-w-[80px] ${
                      step === s.number ? 'text-slate-900' : 'text-slate-500'
                    }`}>
                      {s.title}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={`h-1 w-8 sm:w-12 mx-2 sm:mx-3 rounded transition-all duration-300 ${
                        step > s.number ? currentColor.bg.replace('500', '300') : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
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
                    src="/logo.png" 
                    alt={`${APP_NAME} Logo`}
                    className="h-6 w-6 object-contain"
                  />
                  <span className="text-sm font-bold text-slate-900">{APP_NAME}</span>
                </div>
                <span className="text-xs text-slate-500">Paso {step} de {totalSteps}</span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 min-h-[400px] flex flex-col">
              {/* Step 1: Color de marca */}
              {step === 1 && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Personaliza tu agenda</h4>
                    <p className="text-sm text-slate-600">Elige el color que represente tu marca</p>
                  </div>

                  {/* Color Selector */}
                  <div className="w-full max-w-2xl p-6 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                    <div className="text-center mb-4">
                      <h5 className="text-base font-semibold text-slate-700 mb-1">🎨 Elige tu color de marca</h5>
                      <p className="text-xs text-slate-500">Tu agenda se adaptará a este color</p>
                    </div>
                    <div className="flex items-center justify-center gap-2 flex-nowrap overflow-x-auto">
                      {brandColors.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setBrandColor(color.value)}
                          className={`group relative flex flex-col items-center gap-2 transition-all flex-shrink-0 ${
                            brandColor === color.value ? 'scale-110' : 'hover:scale-105'
                          }`}
                          title={color.name}
                        >
                          <div
                            className={`w-10 h-10 rounded-full ${color.bg} shadow-md transition-all ${
                              brandColor === color.value
                                ? `ring-4 ${color.ring} shadow-lg`
                                : 'hover:shadow-lg'
                            }`}
                          />
                          {brandColor === color.value && (
                            <span className="text-[10px] font-medium text-slate-700 whitespace-nowrap">{color.name}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-4">
                    👆 Selecciona un color para continuar
                  </p>
                </div>
              )}

              {/* Step 2: Servicios */}
              {step === 2 && (
                <div className="flex-1">
                  <div className="text-center mb-6">
                    <h4 className="text-xl font-bold text-slate-900 mb-1">Natasha Romanoff</h4>
                    <p className="text-sm text-slate-600">Salón de Belleza</p>
                  </div>

                  <h5 className="font-semibold text-slate-900 mb-3">Elige tu servicio</h5>
                  <div className="space-y-3">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className={`w-full rounded-lg border-2 border-slate-200 bg-white p-3 hover:${currentColor.border} hover:shadow-md transition-all cursor-pointer`}
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

              {/* Step 3: Seleccionar fecha y hora */}
              {step === 3 && selectedService && (
                <div className="flex-1 space-y-5">
                  {/* Resumen del servicio */}
                  <div
                    className="rounded-xl p-3 border"
                    style={{
                      background: `linear-gradient(to bottom right, ${currentColor.light.replace('bg-', 'rgba(')}80), ${currentColor.light.replace('bg-', 'rgba(')}40))`,
                      borderColor: `${currentColor.border.replace('border-', 'rgba(')}50)`
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg bg-white/80 flex items-center justify-center`}>
                          <Sparkles className={`w-5 h-5 ${currentColor.text}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{selectedService.name}</p>
                          <p className="text-xs text-slate-600 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {selectedService.duration} min
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${currentColor.text}`}>${selectedService.price.toLocaleString('es-CL')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Calendario de 14 días */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h6 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${currentColor.text}`} />
                        Selecciona tu fecha
                      </h6>
                      {selectedDate && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDate("");
                            setSelectedTime("");
                          }}
                          className="text-xs text-slate-500 hover:underline"
                        >
                          Cambiar
                        </button>
                      )}
                    </div>

                    {/* Grid de 14 días (2 semanas) */}
                    <div className="grid grid-cols-7 gap-1.5">
                      {(() => {
                        const days = [];
                        const today = new Date();

                        for (let i = 0; i < 14; i++) {
                          const date = new Date(today);
                          date.setDate(today.getDate() + i);
                          const dateStr = date.toISOString().split("T")[0];
                          const dayName = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][date.getDay()];
                          const isSelected = selectedDate === dateStr;
                          const isToday = i === 0;

                          days.push(
                            <button
                              key={dateStr}
                              type="button"
                              onClick={() => {
                                setSelectedDate(dateStr);
                                setSelectedTime("");
                              }}
                              className={`relative p-2 rounded-lg text-center transition-all duration-200 ${
                                isSelected
                                  ? `bg-gradient-to-br ${currentColor.gradient} text-white shadow-lg ring-2 ${currentColor.ring}`
                                  : 'bg-white border border-slate-200 hover:shadow-md text-slate-700'
                              } ${isToday && !isSelected ? `ring-2 ${currentColor.ring}` : ''}`}
                            >
                              <div className={`text-[10px] font-medium mb-0.5 ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                                {dayName}
                              </div>
                              <div className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                                {date.getDate()}
                              </div>
                              {!isSelected && (
                                <div
                                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${currentColor.bg}`}
                                ></div>
                              )}
                            </button>
                          );
                        }
                        return days;
                      })()}
                    </div>
                  </div>

                  {/* Horarios disponibles agrupados */}
                  {selectedDate && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h6 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <Clock className={`w-4 h-4 ${currentColor.text}`} />
                          Elige tu horario
                        </h6>
                        {selectedTime && (
                          <button
                            type="button"
                            onClick={() => setSelectedTime("")}
                            className="text-xs text-slate-500 hover:underline"
                          >
                            Cambiar
                          </button>
                        )}
                      </div>

                      {/* Mañana */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center">
                            <span className="text-xs">🌅</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-700">Mañana</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {["09:00", "09:30", "10:00", "10:30"].map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={`relative py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                selectedTime === time
                                  ? `bg-gradient-to-br ${currentColor.gradient} text-white shadow-lg ring-2 ${currentColor.ring}`
                                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:shadow-md'
                              }`}
                            >
                              {time}
                              {selectedTime === time && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                  <Check className={`w-3 h-3 ${currentColor.text}`} />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Tarde */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center">
                            <span className="text-xs">☀️</span>
                          </div>
                          <span className="text-xs font-semibold text-slate-700">Tarde</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {["14:00", "14:30", "15:00", "15:30"].map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => setSelectedTime(time)}
                              className={`relative py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                                selectedTime === time
                                  ? `bg-gradient-to-br ${currentColor.gradient} text-white shadow-lg ring-2 ${currentColor.ring}`
                                  : 'bg-white border-2 border-slate-200 text-slate-700 hover:shadow-md'
                              }`}
                            >
                              {time}
                              {selectedTime === time && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                  <Check className={`w-3 h-3 ${currentColor.text}`} />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Completar datos */}
              {step === 4 && (
                <div className="flex-1">
                  <h5 className="font-semibold text-slate-900 mb-4">Completa tus datos</h5>
                  <div className="space-y-3">
                    {/* Resumen mini */}
                    {selectedService && selectedDate && selectedTime && (
                      <div className={`rounded-lg ${currentColor.light} border ${currentColor.border} p-2 text-xs space-y-1`}>
                        <div className="flex justify-between">
                          <span className="font-medium">{selectedService.name}</span>
                          <span>${selectedService.price.toLocaleString('es-CL')}</span>
                      </div>
                        <div className="text-slate-600">
                          {new Date(selectedDate).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })} · {selectedTime}
                    </div>
                      </div>
                    )}

                      <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Nombre</label>
                        <div className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700">
                        Peter Parker
                        </div>
                      </div>
                      <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Email</label>
                        <div className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700">
                        peter@example.com
                        </div>
                      </div>
                      <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Teléfono</label>
                        <div className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-700">
                        +56 9 1234 5678
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Confirmación */}
              {step === 5 && selectedService && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className={`w-16 h-16 rounded-full ${currentColor.light} flex items-center justify-center mb-4`}>
                    <Check className={`w-8 h-8 ${currentColor.text}`} />
                  </div>
                  <h5 className="text-xl font-bold text-slate-900 mb-2">¡Reserva confirmada!</h5>
                  <p className="text-sm text-slate-600 mb-4">
                    Peter recibirá confirmación por email
                  </p>
                  <div className="w-full bg-slate-50 rounded-lg p-4 text-left">
                    <div className="text-xs text-slate-600 space-y-1">
                      <div><span className="font-medium">Servicio:</span> {selectedService.name}</div>
                      <div><span className="font-medium">Duración:</span> {selectedService.duration} min</div>
                      <div><span className="font-medium">Fecha:</span> {selectedDate ? new Date(selectedDate).toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }) : '28 Oct'}, {selectedTime || '10:00'}</div>
                      <div><span className="font-medium">Cliente:</span> Peter Parker</div>
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
                  className={`text-sm ${currentColor.text} ${currentColor.border}`}
                  onMouseEnter={(e) => {
                    if (step > 1) {
                      e.currentTarget.style.backgroundColor = currentColor.light.replace('bg-', '');
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Anterior
                </Button>
                {step < totalSteps ? (
                  <Button
                    size="sm"
                    onClick={() => setStep(Math.min(totalSteps, step + 1))}
                    disabled={(step === 1 && !brandColor) || (step === 2 && !selectedService) || (step === 3 && (!selectedDate || !selectedTime))}
                    className="text-white text-sm disabled:opacity-50 transition-all hover:shadow-lg"
                    style={{
                      background: `linear-gradient(to bottom right, ${currentColor.primary}, ${currentColor.accent})`,
                    }}
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      setStep(1);
                      setBrandColor("green");
                      setSelectedService(null);
                      setSelectedDate("");
                      setSelectedTime("");
                    }}
                    variant="outline"
                    className={`text-sm ${currentColor.text} ${currentColor.border}`}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = currentColor.light.replace('bg-', '');
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
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
                  src="/logo.png" 
                  alt={`${APP_NAME} Logo`}
                  className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-lg"
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
                La alternativa simple a las agendas complicadas y caras. 40% más barato · 100% más fácil. Todo sin esfuerzo.
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
                    Ver demo
                  </Button>
                </Link>
              </div>

              <p className="text-sm sm:text-sm text-slate-500 text-center md:text-left">
                {formatCurrency(PLAN_PRICE)}/mes · Sin tarjeta · Cancela cuando quieras
              </p>
            </div>

            {/* Right: parallax mockup */}
            <div className="relative mt-8 md:mt-0">
              
              {/* MOBILE MOCK: iPhone 15 Pro */}
              <div className="block md:hidden relative mx-auto w-[290px] h-[580px] [perspective:1000px]">
                {/* iPhone frame - premium titanium */}
                <div
                  className="absolute inset-0 rounded-[3.5rem] bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 shadow-2xl p-[3px]"
                  style={{
                    transform: enableParallax
                      ? `translate3d(${(mouse.x - dims.w / 2) * 0.015}px, ${(mouse.y - dims.h / 2) * 0.015}px, 0) rotateX(${-(mouse.y - dims.h / 2) * 0.008}deg) rotateY(${(mouse.x - dims.w / 2) * 0.008}deg)`
                      : undefined,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Screen */}
                  <div className="relative w-full h-full rounded-[3.3rem] bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden shadow-inner">
                    {/* Dynamic Island */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-8 bg-slate-950 rounded-full z-10 flex items-center justify-center gap-2 shadow-lg">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                </div>
                    
                    {/* Status bar */}
                    <div className="h-14 pt-3 px-8 flex items-center justify-between text-[10px] text-slate-700 font-semibold">
                      <span>9:41</span>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-3" viewBox="0 0 16 12" fill="currentColor">
                          <path d="M0 5h3v2H0V5zm4 0h3v2H4V5zm4 0h3v2H8V5zm4 0h3v2h-3V5z"/>
                        </svg>
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                          <path d="M0 4h2v4H0V4zm3 0h2v4H3V4zm3-2h2v8H6V2zm3 1h2v6H9V3z"/>
                        </svg>
                        <svg className="w-6 h-3" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="1" y="1" width="18" height="10" rx="2"/>
                          <rect x="20" y="4" width="3" height="4" rx="1"/>
                        </svg>
              </div>
            </div>

                    {/* Content */}
                    <div className="px-5 pb-4">
                      {/* Header */}
                      <div className="mb-4">
                        <h1 className="text-2xl font-bold text-slate-900 mb-0.5">Dashboard</h1>
                        <p className="text-xs text-slate-500 font-medium">Hoy, 28 Octubre 2025</p>
                      </div>

                      {/* Period Filter Pills */}
                      <div className="mb-4 flex gap-1.5 bg-white/70 backdrop-blur border border-slate-200/70 rounded-xl p-1 w-fit shadow-sm">
                        <div className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-emerald-500 text-white shadow-sm">
                          Hoy
                        </div>
                        <div className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-slate-600">
                          Semana
                        </div>
                        <div className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-slate-600">
                          Mes
                        </div>
                      </div>

                      {/* Stats cards - Modern glassmorphism */}
                      <div className="grid grid-cols-2 gap-2.5 mb-4">
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 border border-slate-200/50 shadow-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                                <line x1="16" x2="16" y1="2" y2="6"></line>
                                <line x1="8" x2="8" y1="2" y2="6"></line>
                                <line x1="3" x2="21" y1="10" y2="10"></line>
                              </svg>
                            </div>
                          </div>
                          <div className="text-[9px] text-slate-500 mb-0.5 font-medium">Total Citas</div>
                          <div className="text-2xl font-bold text-slate-900">24</div>
                          <div className="text-[8px] text-slate-400 mt-0.5">Hoy</div>
                        </div>
                        <div className="bg-gradient-to-br from-green-50/50 to-white rounded-2xl p-3 border border-green-200/70 shadow-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-7 h-7 rounded-lg bg-green-100/80 flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                              </svg>
                            </div>
                            <span className="text-[7px] font-semibold px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">75%</span>
                          </div>
                          <div className="text-[9px] text-slate-600 mb-0.5 font-medium">Confirmadas</div>
                          <div className="text-2xl font-bold text-green-600">18</div>
                          <div className="text-[8px] text-slate-400 mt-0.5">Tasa de confirmación</div>
                        </div>
                        <div className="bg-gradient-to-br from-amber-50/50 to-white rounded-2xl p-3 border border-amber-200/70 shadow-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" x2="12" y1="8" y2="12"></line>
                                <line x1="12" x2="12.01" y1="16" y2="16"></line>
                              </svg>
                            </div>
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                          </div>
                          <div className="text-[9px] text-slate-600 mb-0.5 font-medium">Pendientes</div>
                          <div className="text-2xl font-bold text-amber-600">3</div>
                          <div className="text-[8px] text-slate-400 mt-0.5">Requieren confirmación</div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50/30 to-white rounded-2xl p-3 border border-emerald-200/40 shadow-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-100/50 flex items-center justify-center">
                              <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <line x1="12" x2="12" y1="2" y2="22"></line>
                                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                              </svg>
                            </div>
                          </div>
                          <div className="text-[9px] text-slate-600 mb-0.5 font-medium">Ingresos</div>
                          <div className="text-xl font-bold text-emerald-600">$80.000</div>
                          <div className="text-[8px] text-slate-400 mt-0.5">Citas completadas</div>
                        </div>
                      </div>

                      {/* Filter tabs */}
                      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
                        <div className="px-3 py-1.5 rounded-lg text-[10px] font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm whitespace-nowrap flex items-center gap-1.5">
                          <span>Próximas</span>
                          <span className="bg-white/20 px-1.5 py-0.5 rounded">3</span>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-slate-600 border border-slate-200 bg-white/50 whitespace-nowrap">
                          Hoy
                        </div>
                        <div className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-slate-600 border border-slate-200 bg-white/50 whitespace-nowrap">
                          Completadas
                        </div>
                      </div>

                      {/* Appointments - Modern cards */}
                      <div className="space-y-2">
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-slate-200/70 shadow-sm">
                          <div className="flex items-start gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-[11px] shadow-sm">
                              TS
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-bold text-slate-900 mb-0.5">Tony Stark</div>
                              <div className="text-[9px] text-slate-500">Corte de cabello · 45 min</div>
                            </div>
                            <span className="text-[7px] px-1.5 py-0.5 bg-green-100 text-green-800 rounded font-semibold whitespace-nowrap">Confirmada</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100">
                            <div className="text-slate-600 font-medium">Hoy · 10:00</div>
                            <div className="text-emerald-600 font-bold">$15.000</div>
                          </div>
                        </div>

                        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-slate-200/70 shadow-sm">
                          <div className="flex items-start gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-[11px] shadow-sm">
                              PP
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-bold text-slate-900 mb-0.5">Peter Parker</div>
                              <div className="text-[9px] text-slate-500">Manicure · 60 min</div>
                            </div>
                            <span className="text-[7px] px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded font-semibold whitespace-nowrap">Pendiente</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100">
                            <div className="text-slate-600 font-medium">Hoy · 14:30</div>
                            <div className="text-emerald-600 font-bold">$12.000</div>
                          </div>
                        </div>

                        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-slate-200/50 shadow-sm opacity-70">
                          <div className="flex items-start gap-2.5 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-[11px]">
                              NR
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-[11px] font-bold text-slate-900 mb-0.5">Natasha Romanoff</div>
                              <div className="text-[9px] text-slate-500">Masaje · 90 min</div>
                            </div>
                            <span className="text-[7px] px-1.5 py-0.5 bg-green-100 text-green-800 rounded font-semibold whitespace-nowrap">Confirmada</span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-100">
                            <div className="text-slate-500 font-medium">Mañana · 09:00</div>
                            <div className="text-slate-600 font-bold">$18.000</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DESKTOP MOCK: Browser Window */}
              <div className="hidden md:block relative mx-auto md:mx-0 w-full md:w-[min(580px,100%)] h-[360px] [perspective:1000px]">
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
                  <div className="p-4">
                    {/* Period filter */}
                    <div className="mb-3 flex gap-1 bg-white/70 backdrop-blur border border-slate-200/70 rounded-lg p-0.5 w-fit">
                      <div className="px-2 py-1 rounded text-[8px] font-medium bg-emerald-500 text-white">Hoy</div>
                      <div className="px-2 py-1 rounded text-[8px] font-medium text-slate-600">Semana</div>
                      <div className="px-2 py-1 rounded text-[8px] font-medium text-slate-600">Mes</div>
                    </div>

                    {/* 4 stats cards */}
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      <div className="bg-white/80 backdrop-blur rounded-lg p-2 border border-slate-200/50">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                              <line x1="16" x2="16" y1="2" y2="6"></line>
                              <line x1="8" x2="8" y1="2" y2="6"></line>
                              <line x1="3" x2="21" y1="10" y2="10"></line>
                            </svg>
                          </div>
                        </div>
                        <div className="text-[8px] text-slate-500 mb-0.5">Total Citas</div>
                        <div className="text-base font-bold text-slate-900">24</div>
                        <div className="text-[7px] text-slate-400">Hoy</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50/50 to-white rounded-lg p-2 border border-green-200/70">
                        <div className="flex items-center justify-between mb-1">
                          <div className="w-5 h-5 rounded bg-green-100/80 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                              <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                          </div>
                          <span className="text-[6px] font-semibold px-1 py-0.5 bg-green-100 text-green-700 rounded">75%</span>
                        </div>
                        <div className="text-[8px] text-slate-600 mb-0.5">Confirmadas</div>
                        <div className="text-base font-bold text-green-600">18</div>
                        <div className="text-[7px] text-slate-400">Tasa de confirmación</div>
                      </div>
                      <div className="bg-gradient-to-br from-amber-50/50 to-white rounded-lg p-2 border border-amber-200/70">
                        <div className="flex items-center justify-between mb-1">
                          <div className="w-5 h-5 rounded bg-amber-100 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" x2="12" y1="8" y2="12"></line>
                              <line x1="12" x2="12.01" y1="16" y2="16"></line>
                            </svg>
                          </div>
                          <span className="w-1 h-1 bg-amber-500 rounded-full animate-pulse"></span>
                        </div>
                        <div className="text-[8px] text-slate-600 mb-0.5">Pendientes</div>
                        <div className="text-base font-bold text-amber-600">3</div>
                        <div className="text-[7px] text-slate-400">Requieren confirmación</div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50/30 to-white rounded-lg p-2 border border-emerald-200/40">
                        <div className="flex items-center gap-1 mb-1">
                          <div className="w-5 h-5 rounded bg-emerald-100/50 flex items-center justify-center">
                            <svg className="w-2.5 h-2.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <line x1="12" x2="12" y1="2" y2="22"></line>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="text-[8px] text-slate-600 mb-0.5">Ingresos</div>
                        <div className="text-sm font-bold text-emerald-600">$80.000</div>
                        <div className="text-[7px] text-slate-400">Citas completadas</div>
                      </div>
                    </div>

                    {/* Filter tabs */}
                    <div className="mb-2 flex gap-1">
                      <div className="px-2 py-1 rounded text-[8px] font-medium bg-gradient-to-r from-emerald-500 to-emerald-600 text-white flex items-center gap-1">
                        <span>Próximas</span>
                        <span className="bg-white/20 px-1 py-0.5 rounded text-[7px]">3</span>
                      </div>
                      <div className="px-2 py-1 rounded text-[8px] font-medium text-slate-600 border border-slate-200 bg-white/50">Hoy</div>
                      <div className="px-2 py-1 rounded text-[8px] font-medium text-slate-600 border border-slate-200 bg-white/50">Completadas</div>
                    </div>

                    {/* appointments list */}
                    <div className="space-y-1.5">
                      <div className="bg-white/90 rounded-lg p-2 border border-slate-200/70">
                        <div className="flex items-start gap-1.5 mb-1">
                          <div className="w-5 h-5 rounded bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-[8px]">TS</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-bold text-slate-900">Tony Stark</div>
                            <div className="text-[7px] text-slate-500">Corte de cabello · 45 min</div>
                          </div>
                          <span className="text-[6px] px-1 py-0.5 bg-green-100 text-green-800 rounded font-semibold whitespace-nowrap">Confirmada</span>
                        </div>
                        <div className="flex items-center justify-between text-[8px] pt-1 border-t border-slate-100">
                          <span className="text-slate-600">Hoy · 10:00</span>
                          <span className="text-emerald-600 font-bold">$15.000</span>
                        </div>
                      </div>
                      <div className="bg-white/90 rounded-lg p-2 border border-slate-200/70">
                        <div className="flex items-start gap-1.5 mb-1">
                          <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-[8px]">PP</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-bold text-slate-900">Peter Parker</div>
                            <div className="text-[7px] text-slate-500">Manicure · 60 min</div>
                          </div>
                          <span className="text-[6px] px-1 py-0.5 bg-yellow-100 text-yellow-800 rounded font-semibold whitespace-nowrap">Pendiente</span>
                        </div>
                        <div className="flex items-center justify-between text-[8px] pt-1 border-t border-slate-100">
                          <span className="text-slate-600">Hoy · 14:30</span>
                          <span className="text-emerald-600 font-bold">$12.000</span>
                        </div>
                      </div>
                      <div className="bg-white/70 rounded-lg p-2 border border-slate-200/50 opacity-70">
                        <div className="flex items-start gap-1.5 mb-1">
                          <div className="w-5 h-5 rounded bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-bold text-[8px]">NR</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-bold text-slate-900">Natasha Romanoff</div>
                            <div className="text-[7px] text-slate-500">Masaje · 90 min</div>
                          </div>
                          <span className="text-[6px] px-1 py-0.5 bg-green-100 text-green-800 rounded font-semibold whitespace-nowrap">Confirmada</span>
                        </div>
                        <div className="flex items-center justify-between text-[8px] pt-1 border-t border-slate-100">
                          <span className="text-slate-500">Mañana · 09:00</span>
                          <span className="text-slate-600 font-bold">$18.000</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* floating stats card */}
                <div
                  className="absolute -right-6 -bottom-8 w-44 h-28 rounded-2xl bg-white/80 backdrop-blur border border-slate-200/70 shadow-xl p-4"
                  style={{
                    transform: enableParallax
                      ? `translate3d(${(mouse.x - dims.w / 2) * 0.04}px, ${(mouse.y - dims.h / 2) * 0.04}px, 0)`
                      : undefined,
                  }}
                >
                  <div className="text-xs text-slate-500 mb-1">Ingresos</div>
                  <div className="text-xl font-semibold text-slate-900">{formatCurrency(80000)}</div>
                  <div className="text-xs text-emerald-600 mt-1">+18% esta semana</div>
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
                src="/logo.png" 
                alt={`${APP_NAME} Logo`}
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain group-hover:scale-110 transition-transform"
              />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login">
                <Button variant="outline" className="inline-flex border-2 border-[rgb(var(--brand-mid))]/40 hover:border-[rgb(var(--brand-mid))] text-slate-800 text-xs sm:text-sm px-3 sm:px-6 font-medium rounded-[14px]">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-primary to-accent hover:brightness-110 text-white shadow-md text-xs sm:text-base px-3 sm:px-4 font-semibold">
                  Comenzar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero premium */}
      <HeroPremium />

      {/* Carrusel de profesionales */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-white via-slate-50/30 to-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Para profesionales independientes</p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Tu agenda, tu negocio</h2>
          </div>
          
          {/* Carrusel con drag y auto-scroll */}
          <div className="relative overflow-hidden cursor-grab active:cursor-grabbing">
            <motion.div
              drag="x"
              dragConstraints={{ left: -2400, right: 0 }}
              dragElastic={0.1}
              dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
              animate={{
                x: [0, -1200, 0],
              }}
              transition={{
                x: {
                  duration: 60,
                  repeat: Infinity,
                  ease: "linear",
                },
              }}
              className="flex gap-6"
            >
              {/* Duplicamos para efecto infinito visual */}
              {[1, 2].map((iteration) => (
                <div key={iteration} className="flex gap-6 min-w-max">
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">💇‍♀️</span>
                    <span className="font-semibold text-slate-900">Peluquerías</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">✂️</span>
                    <span className="font-semibold text-slate-900">Barberías</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">💅</span>
                    <span className="font-semibold text-slate-900">Salones de Belleza</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">🧠</span>
                    <span className="font-semibold text-slate-900">Psicólogos</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">💆</span>
                    <span className="font-semibold text-slate-900">Kinesiólogos</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">🎨</span>
                    <span className="font-semibold text-slate-900">Tatuadores</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">⚕️</span>
                    <span className="font-semibold text-slate-900">Médicos</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">🦷</span>
                    <span className="font-semibold text-slate-900">Dentistas</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">🧘</span>
                    <span className="font-semibold text-slate-900">Instructores de Yoga</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">🏋️</span>
                    <span className="font-semibold text-slate-900">Entrenadores Personales</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">💼</span>
                    <span className="font-semibold text-slate-900">Consultores</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">🎓</span>
                    <span className="font-semibold text-slate-900">Profesores Particulares</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">📸</span>
                    <span className="font-semibold text-slate-900">Fotógrafos</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">🎭</span>
                    <span className="font-semibold text-slate-900">Coaches</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">🔧</span>
                    <span className="font-semibold text-slate-900">Técnicos</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">🎵</span>
                    <span className="font-semibold text-slate-900">Profesores de Música</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">🐾</span>
                    <span className="font-semibold text-slate-900">Veterinarios</span>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl border border-slate-200 shadow-sm whitespace-nowrap hover:shadow-md transition-shadow select-none">
                    <span className="text-3xl">🌿</span>
                    <span className="font-semibold text-slate-900">Terapeutas Alternativos</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

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

      {/* Por qué MicroAgenda - Comparación */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-white to-slate-50/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-3">
                ¿Por qué MicroAgenda?
              </h2>
              <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
                La alternativa simple para profesionales independientes
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Otros */}
                <Card className="border-2 border-slate-200/70 bg-white/70">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="text-xl">❌</div>
                      <h3 className="font-semibold text-slate-900">Otras agendas</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Planes desde $15.000/mes</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Configuración con múltiples pasos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Funciones más complejas de lo necesario</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>WhatsApp requiere configuración extra</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Múltiples tarifas según uso</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Nosotros */}
                <Card className="border-2 border-[rgb(var(--brand-mid))]/40 bg-gradient-to-br from-white to-[rgb(var(--brand-start))]/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="text-xl">✅</div>
                      <h3 className="font-semibold text-slate-900">MicroAgenda</h3>
                    </div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span><strong>$8.500/mes</strong>, todo incluido</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Configuración instantánea en 5 minutos</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Solo las funciones que realmente necesitas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Soporte directo y en tu idioma</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-0.5">•</span>
                        <span>Precio fijo, sin sorpresas ni extras</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
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
                      <div className="flex flex-col gap-2 mt-2">
                        <div className="flex items-center gap-2 text-slate-500">
                        <span>Sin permanencia · Cancela cuando quieras</span>
                        <div className="group relative">
                          <Info className="w-4 h-4 text-slate-400" />
                          <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 mt-2 w-48 rounded-md border border-slate-200 bg-white/95 backdrop-blur px-3 py-2 text-xs text-slate-700 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            Precio final con IVA incluido. Sin cargos ocultos ni comisiones adicionales.
                          </div>
                        </div>
                        </div>
                        <p className="text-sm text-slate-600 font-medium">
                          💰 Ahorra hasta 40% vs otras agendas
                        </p>
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
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-900">{benefit.title}</h4>
                            {benefit.badge && (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-gradient-to-r from-[rgb(var(--brand-start))] to-[rgb(var(--brand-mid))] text-white rounded-full">
                                {benefit.badge}
                              </span>
                            )}
                          </div>
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

      {/* Qué incluye 1 cuenta */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-2">
                ¿Qué incluye 1 cuenta?
              </h3>
              <p className="text-sm text-slate-600">
                Todo lo que necesitas para gestionar tu negocio
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl">👤</div>
                <div>
                  <div className="font-medium text-slate-900">1 profesional</div>
                  <div className="text-sm text-slate-600">Tu cuenta personal</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl">📋</div>
                <div>
                  <div className="font-medium text-slate-900">Servicios ilimitados</div>
                  <div className="text-sm text-slate-600">Agrega todos los que necesites</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl">🗓️</div>
                <div>
                  <div className="font-medium text-slate-900">Citas ilimitadas</div>
                  <div className="text-sm text-slate-600">Sin restricciones mensuales</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl">👥</div>
                <div>
                  <div className="font-medium text-slate-900">Clientes ilimitados</div>
                  <div className="text-sm text-slate-600">Base de datos completa</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl">💬</div>
                <div>
                  <div className="font-medium text-slate-900">Recordatorios ilimitados</div>
                  <div className="text-sm text-slate-600">Por email incluido</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
                <div className="text-2xl">💰</div>
                <div>
                  <div className="font-medium text-slate-900">0% comisiones</div>
                  <div className="text-sm text-slate-600">Solo pagas el plan</div>
                </div>
              </div>
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
                  src="/logo.png" 
                  alt={`${APP_NAME} Logo`}
                  className="h-8 w-8 object-contain"
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
