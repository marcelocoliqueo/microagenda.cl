"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Profile } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  getWelcomeEmail,
  getClientReservationConfirmationEmail,
  getNewAppointmentNotificationEmail,
  getAppointmentReminderEmail,
  getTwoHourReminderEmail,
  getAppointmentManuallyConfirmedEmail,
  getPaymentSuccessEmail,
  getPaymentFailedEmail,
} from "@/lib/emailTemplates";
import { formatDate } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { Loader2, Eye, Send } from "lucide-react";

type EmailTemplateDefinition = {
  id: string;
  name: string;
  description: string;
  subject: string;
  category: string;
  sampleData: Array<{ label: string; value: string }>;
  getHtml: () => string;
};

export default function EmailPlaygroundPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState("");
  const [sendingTemplate, setSendingTemplate] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewMeta, setPreviewMeta] = useState<{ name: string; subject: string }>({
    name: "",
    subject: "",
  });

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          router.push("/login?redirect=/dashboard/emails");
          return;
        }

        setTestEmail(session.user.email || "");

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error cargando perfil para email playground:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const templateDefinitions = useMemo<EmailTemplateDefinition[]>(() => {
    const businessName = profile?.business_name || profile?.name || "Estudio Creativo";
    const professionalName = profile?.name || "Profesional";
    const sampleClientPhone = "+56 9 2345 6789";
    const clientName = "Camila Torres";
    const serviceName = "Manicure Premium";
    const appointmentDate = formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
    const urgentDate = formatDate(new Date());
    const appointmentTime = "15:30";
    const shortTime = "17:00";
    const nextBillingDate = formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    const fallbackClientEmail = testEmail || "cliente@ejemplo.com";
    const status = profile?.auto_confirm ? "confirmed" : "pending";

    return [
      {
        id: "welcome",
        name: "Bienvenida Profesional",
        description: "Se envía automáticamente cuando confirmas tu email después del registro.",
        category: "Onboarding",
        subject: `¡Bienvenido a ${APP_NAME}!`,
        sampleData: [
          { label: "Nombre", value: professionalName },
          { label: "Negocio", value: businessName },
        ],
        getHtml: () =>
          getWelcomeEmail({
            userName: professionalName,
            businessName,
          }),
      },
      {
        id: "reservation-client",
        name: "Reserva creada (Cliente)",
        description: "Email de confirmación para el cliente cuando agenda desde tu página pública.",
        category: "Reservas",
        subject: "Reserva creada",
        sampleData: [
          { label: "Cliente", value: clientName },
          { label: "Servicio", value: serviceName },
          { label: "Estado", value: status === "confirmed" ? "Confirmada" : "Pendiente" },
        ],
        getHtml: () =>
          getClientReservationConfirmationEmail({
            clientName,
            clientEmail: fallbackClientEmail,
            serviceName,
            date: appointmentDate,
            time: appointmentTime,
            businessName,
            status: status as "pending" | "confirmed",
          }),
      },
      {
        id: "reservation-pro",
        name: "Nueva reserva (Profesional)",
        description: "Notificación interna con los datos del cliente y servicio reservado.",
        category: "Reservas",
        subject: "Nueva Reserva Recibida",
        sampleData: [
          { label: "Cliente", value: clientName },
          { label: "Teléfono", value: sampleClientPhone },
          { label: "Servicio", value: serviceName },
        ],
        getHtml: () =>
          getNewAppointmentNotificationEmail({
            professionalName,
            clientName,
            clientPhone: sampleClientPhone,
            clientEmail: fallbackClientEmail,
            serviceName,
            date: appointmentDate,
            time: appointmentTime,
            status: status as "pending" | "confirmed",
            appointmentId: "apt_123",
          }),
      },
      {
        id: "reminder-24",
        name: "Recordatorio 24h",
        description: "Recordatorio automático un día antes de la cita.",
        category: "Recordatorios",
        subject: `Recordatorio: ${serviceName} mañana a las ${appointmentTime}`,
        sampleData: [
          { label: "Cliente", value: clientName },
          { label: "Fecha", value: appointmentDate },
          { label: "Hora", value: appointmentTime },
        ],
        getHtml: () =>
          getAppointmentReminderEmail({
            clientName,
            serviceName,
            date: appointmentDate,
            time: appointmentTime,
            businessName,
          }),
      },
      {
        id: "reminder-2h",
        name: "Recordatorio 2h",
        description: "Recordatorio urgente dos horas antes de la cita.",
        category: "Recordatorios",
        subject: `¡Tu cita es en 2 horas! - ${serviceName}`,
        sampleData: [
          { label: "Cliente", value: clientName },
          { label: "Fecha", value: urgentDate },
          { label: "Hora", value: shortTime },
        ],
        getHtml: () =>
          getTwoHourReminderEmail({
            clientName,
            serviceName,
            date: urgentDate,
            time: shortTime,
            businessName,
          }),
      },
      {
        id: "manual-confirmation",
        name: "Confirmación manual",
        description: "Se envía al cliente cuando confirmas una cita pendiente desde el dashboard.",
        category: "Reservas",
        subject: "¡Tu Cita ha sido Confirmada!",
        sampleData: [
          { label: "Cliente", value: clientName },
          { label: "Servicio", value: serviceName },
          { label: "Profesional", value: businessName },
        ],
        getHtml: () =>
          getAppointmentManuallyConfirmedEmail({
            clientName,
            serviceName,
            date: appointmentDate,
            time: appointmentTime,
            businessName,
          }),
      },
      {
        id: "payment-success",
        name: "Pago exitoso",
        description: "Confirmación automática cuando MercadoPago aprueba la suscripción.",
        category: "Pagos",
        subject: "Pago exitoso - MicroAgenda",
        sampleData: [
          { label: "Plan", value: "Único Mensual" },
          { label: "Monto", value: "$6.490 CLP" },
          { label: "Próximo cobro", value: nextBillingDate },
        ],
        getHtml: () =>
          getPaymentSuccessEmail({
            userName: professionalName,
            amount: "$6.490 CLP",
            planName: "Plan Único",
            nextBillingDate,
          }),
      },
      {
        id: "payment-failed",
        name: "Pago rechazado",
        description: "Aviso automático cuando MercadoPago informa un pago fallido.",
        category: "Pagos",
        subject: "Pago rechazado - MicroAgenda",
        sampleData: [
          { label: "Plan", value: "Único Mensual" },
          { label: "Monto", value: "$6.490 CLP" },
        ],
        getHtml: () =>
          getPaymentFailedEmail({
            userName: professionalName,
            amount: "$6.490 CLP",
            planName: "Plan Único",
          }),
      },
    ];
  }, [profile, testEmail]);

  const handleSendTest = async (template: EmailTemplateDefinition) => {
    if (!testEmail) {
      toast({
        title: "Ingresa un email de prueba",
        description: "Necesitamos un destinatario para enviar el template.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSendingTemplate(template.id);
      const html = template.getHtml();

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmail,
          subject: template.subject,
          html,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "No se pudo enviar el email");
      }

      toast({
        title: "Email enviado",
        description: result.mock
          ? "No hay API Key configurada: revisa la consola del servidor."
          : "Revisa tu bandeja para ver el template en Gmail.",
      });
    } catch (error: any) {
      toast({
        title: "Error al enviar",
        description: error.message || "Intenta nuevamente",
        variant: "destructive",
      });
    } finally {
      setSendingTemplate(null);
    }
  };

  const handlePreview = (template: EmailTemplateDefinition) => {
    setPreviewHtml(template.getHtml());
    setPreviewMeta({ name: template.name, subject: template.subject });
    setPreviewOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <p>Cargando email playground...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 space-y-6">
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          Laboratorio de Emails
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Centro de Pruebas de Emails
          </h1>
          <p className="text-slate-600 mt-2">
            Dispara cualquiera de los templates oficiales y verifícalos en tu bandeja de entrada.
            Ideal para revisar diseño, copy y spam score antes de salir a producción.
          </p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Destinatario de Pruebas</CardTitle>
          <CardDescription>
            Usa tu correo de Gmail de pruebas o cualquier email que quieras verificar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="test-email">Enviar a</Label>
            <Input
              id="test-email"
              type="email"
              value={testEmail}
              placeholder="tu-correo@gmail.com"
              onChange={(e) => setTestEmail(e.target.value)}
            />
          </div>
          <p className="text-xs text-slate-500">
            * Si no configuraste <span className="font-semibold">RESEND_API_KEY</span>, los emails se registran en consola con el tag
            <span className="font-mono bg-slate-100 px-1 py-0.5 rounded mx-1">📧 [MOCK EMAIL]</span>.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {templateDefinitions.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
                  {template.category}
                </span>
                <span className="text-xs text-slate-400">{template.subject}</span>
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600 mb-4">
                <p className="text-xs font-semibold uppercase text-slate-400 mb-1">
                  Datos de ejemplo
                </p>
                <ul className="space-y-1">
                  {template.sampleData.map((item) => (
                    <li key={`${template.id}-${item.label}`}>
                      <span className="font-medium text-slate-700">{item.label}:</span>{" "}
                      {item.value}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handlePreview(template)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Preview
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleSendTest(template)}
                  disabled={sendingTemplate === template.id}
                >
                  {sendingTemplate === template.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar a mí
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewMeta.name}</DialogTitle>
            <DialogDescription>{previewMeta.subject}</DialogDescription>
          </DialogHeader>
          <div className="border rounded-lg h-[70vh] overflow-auto bg-white">
            {previewHtml ? (
              <iframe
                title="Email preview"
                srcDoc={previewHtml}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                Sin contenido disponible
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
