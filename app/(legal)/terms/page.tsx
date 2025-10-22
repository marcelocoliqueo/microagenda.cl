import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, SUPPORT_EMAIL, PLAN_PRICE, formatCurrency } from "@/lib/constants";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones de uso de MicroAgenda",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-primary">
            {APP_NAME}
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Términos y Condiciones</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Última actualización: Enero 2025</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Aceptación de los Términos</h2>
              <p>
                Al acceder y utilizar {APP_NAME} ("la plataforma", "el servicio"), aceptas estar
                legalmente vinculado por estos Términos y Condiciones. Si no estás de acuerdo con
                alguno de estos términos, no debes utilizar la plataforma.
              </p>
              <p>
                {APP_NAME} es un servicio de agendamiento en línea ofrecido para profesionales
                independientes que desean gestionar sus citas y reservas de manera eficiente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Descripción del Servicio</h2>
              <p>{APP_NAME} proporciona las siguientes funcionalidades:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sistema de agendamiento online con calendario personalizado</li>
                <li>Gestión de citas y clientes</li>
                <li>Envío automático de recordatorios por email y WhatsApp</li>
                <li>Estadísticas y reportes de actividad</li>
                <li>Página pública de reservas para compartir con clientes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Registro y Cuenta de Usuario</h2>
              <p>
                Para utilizar {APP_NAME}, debes crear una cuenta proporcionando información
                veraz, precisa y actualizada. Eres responsable de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mantener la confidencialidad de tu contraseña</li>
                <li>Todas las actividades que ocurran bajo tu cuenta</li>
                <li>Notificarnos inmediatamente sobre cualquier uso no autorizado</li>
                <li>La información que publicas sobre tus servicios y disponibilidad</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                4. Suscripción y Pagos
              </h2>
              <p>
                <strong>Precio:</strong> El servicio tiene un costo de{" "}
                <strong>{formatCurrency(PLAN_PRICE)} CLP por mes</strong> (IVA incluido).
              </p>
              <p>
                <strong>Período de prueba:</strong> Ofrecemos un período de prueba inicial para
                que explores las funcionalidades de la plataforma.
              </p>
              <p>
                <strong>Facturación:</strong> Los pagos se procesan mensualmente a través de
                MercadoPago. Al suscribirte, autorizas cargos recurrentes en tu método de pago.
              </p>
              <p>
                <strong>Cancelación:</strong> Puedes cancelar tu suscripción en cualquier momento
                desde tu panel de control. La cancelación será efectiva al final del período de
                facturación actual. No se realizan reembolsos por períodos parciales.
              </p>
              <p>
                <strong>Cambios de precio:</strong> Nos reservamos el derecho de modificar los
                precios con un aviso previo de 30 días.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                5. Uso Aceptable y Prohibiciones
              </h2>
              <p>Al utilizar {APP_NAME}, te comprometes a NO:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violar leyes o regulaciones aplicables</li>
                <li>Publicar contenido ilegal, ofensivo, discriminatorio o fraudulento</li>
                <li>Usar la plataforma para spam o actividades comerciales no autorizadas</li>
                <li>Intentar acceder de forma no autorizada a sistemas o cuentas de otros usuarios</li>
                <li>Interferir con el funcionamiento normal de la plataforma</li>
                <li>Realizar ingeniería inversa o copiar características del servicio</li>
              </ul>
              <p>
                Nos reservamos el derecho de suspender o cancelar cuentas que violen estas
                condiciones.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                6. Responsabilidades del Usuario Profesional
              </h2>
              <p>Como usuario profesional, eres responsable de:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>La calidad y precisión de la información de tus servicios</li>
                <li>El cumplimiento de las citas agendadas con tus clientes</li>
                <li>La atención profesional y ética a tus clientes</li>
                <li>Cumplir con todas las regulaciones aplicables a tu actividad profesional</li>
                <li>Obtener los permisos y licencias necesarios para operar tu negocio</li>
              </ul>
              <p>
                {APP_NAME} actúa únicamente como intermediario tecnológico y no es responsable
                de las relaciones comerciales entre profesionales y clientes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Propiedad Intelectual</h2>
              <p>
                Todo el contenido de {APP_NAME}, incluyendo diseño, código, logos, texto y
                gráficos, es propiedad de {APP_NAME} o sus licenciantes y está protegido por
                leyes de propiedad intelectual.
              </p>
              <p>
                Te otorgamos una licencia limitada, no exclusiva e intransferible para usar la
                plataforma según estos términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                8. Limitación de Responsabilidad
              </h2>
              <p>
                {APP_NAME} se proporciona "tal cual" y "según disponibilidad". No garantizamos
                que el servicio:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sea ininterrumpido, seguro o libre de errores</li>
                <li>Cumpla con tus requisitos específicos</li>
                <li>Produzca resultados comerciales específicos</li>
              </ul>
              <p>
                En ningún caso seremos responsables por daños indirectos, incidentales,
                especiales, consecuentes o punitivos, incluyendo pérdida de beneficios, datos o
                uso, derivados del uso o incapacidad de usar el servicio.
              </p>
              <p>
                No somos responsables por interrupciones causadas por servicios de terceros
                (Supabase, MercadoPago, WhatsApp, etc.).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">9. Indemnización</h2>
              <p>
                Aceptas indemnizar y eximir de responsabilidad a {APP_NAME}, sus directores,
                empleados y socios, de cualquier reclamo, pérdida, daño, responsabilidad y gasto
                (incluyendo honorarios legales) derivados de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Tu uso del servicio</li>
                <li>Tu violación de estos términos</li>
                <li>Tu violación de derechos de terceros</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Modificaciones del Servicio</h2>
              <p>
                Nos reservamos el derecho de modificar, suspender o discontinuar cualquier
                aspecto del servicio en cualquier momento, con o sin previo aviso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">11. Terminación</h2>
              <p>
                Puedes cancelar tu cuenta en cualquier momento desde tu panel de control.
                Podemos suspender o cancelar tu cuenta si:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violas estos términos</li>
                <li>No pagas tu suscripción</li>
                <li>Tu actividad representa un riesgo para la plataforma o terceros</li>
              </ul>
              <p>
                Al cancelar tu cuenta, tus datos se eliminarán conforme a nuestra Política de
                Privacidad.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">12. Ley Aplicable y Jurisdicción</h2>
              <p>
                Estos términos se rigen por las leyes de Chile. Cualquier disputa se resolverá
                en los tribunales competentes de Santiago, Chile.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">13. Protección de Datos Personales</h2>
              <p>
                El tratamiento de tus datos personales se rige por nuestra{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Política de Privacidad
                </Link>
                , en cumplimiento con la Ley N° 19.628 sobre Protección de la Vida Privada.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                14. Modificaciones a los Términos
              </h2>
              <p>
                Podemos actualizar estos términos periódicamente. Te notificaremos cambios
                significativos por email o mediante un aviso en la plataforma. El uso continuado
                del servicio después de las modificaciones constituye tu aceptación de los nuevos
                términos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">15. Contacto</h2>
              <p>
                Para preguntas sobre estos Términos y Condiciones, contáctanos en:
              </p>
              <p className="font-semibold">
                Email:{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </section>

            <section className="bg-background p-4 rounded-lg border border-border">
              <p className="text-sm">
                <strong>Última actualización:</strong> Enero 2025
              </p>
              <p className="text-sm mt-2">
                Al usar {APP_NAME}, confirmas que has leído, entendido y aceptado estos
                Términos y Condiciones.
              </p>
            </section>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-primary hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
