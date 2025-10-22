import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_NAME, SUPPORT_EMAIL } from "@/lib/constants";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y protección de datos personales de MicroAgenda",
};

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-8">Política de Privacidad</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Última actualización: Enero 2025</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-3">1. Introducción</h2>
              <p>
                {APP_NAME} ("nosotros", "nuestro" o "la plataforma") se compromete a proteger
                la privacidad y los datos personales de sus usuarios, en cumplimiento de la
                Ley N° 19.628 sobre Protección de la Vida Privada y su futura actualización
                (Ley de Protección de Datos Personales 2.0).
              </p>
              <p>
                Esta Política de Privacidad describe qué información recopilamos, cómo la
                usamos, con quién la compartimos y cuáles son tus derechos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">2. Información que Recopilamos</h2>
              <p>
                Recopilamos la siguiente información personal cuando utilizas nuestra
                plataforma:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Información de cuenta:</strong> Nombre completo, dirección de correo
                  electrónico, contraseña (encriptada), número de teléfono WhatsApp, nombre del
                  negocio.
                </li>
                <li>
                  <strong>Información de citas:</strong> Datos de clientes (nombre, teléfono),
                  fecha y hora de citas, servicios contratados.
                </li>
                <li>
                  <strong>Información de pago:</strong> Datos procesados por MercadoPago para
                  gestionar suscripciones (no almacenamos datos de tarjetas).
                </li>
                <li>
                  <strong>Información técnica:</strong> Dirección IP, tipo de navegador, sistema
                  operativo, cookies de sesión.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">3. Cómo Usamos tu Información</h2>
              <p>Utilizamos tu información personal para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Crear y gestionar tu cuenta de usuario</li>
                <li>Procesar y gestionar citas y reservas</li>
                <li>Enviar recordatorios automáticos por email y WhatsApp</li>
                <li>Procesar pagos de suscripciones</li>
                <li>Mejorar nuestros servicios y experiencia de usuario</li>
                <li>Cumplir con obligaciones legales y regulatorias</li>
                <li>Prevenir fraudes y garantizar la seguridad de la plataforma</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                4. Compartir Información con Terceros
              </h2>
              <p>
                No compartimos tu información personal con terceros, excepto en los siguientes
                casos:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Proveedores de servicios:</strong> Supabase (almacenamiento de datos),
                  Resend (envío de emails), MercadoPago (procesamiento de pagos), WhatsApp
                  (notificaciones). Estos proveedores están obligados contractualmente a
                  proteger tu información.
                </li>
                <li>
                  <strong>Requerimientos legales:</strong> Cuando sea requerido por ley, orden
                  judicial o autoridad competente.
                </li>
              </ul>
              <p>
                Nunca vendemos ni alquilamos tu información personal a terceros con fines de
                marketing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                5. Almacenamiento y Seguridad de Datos
              </h2>
              <p>
                Tus datos se almacenan de forma segura en servidores de Supabase, que cumple con
                estándares internacionales de seguridad (ISO 27001, SOC 2). Implementamos medidas
                técnicas y organizativas para proteger tu información contra acceso no autorizado,
                pérdida o destrucción.
              </p>
              <p>
                Los datos se almacenan en servidores ubicados en Estados Unidos y Europa, bajo
                protocolos de cifrado.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                6. Tus Derechos (Derechos ARCO)
              </h2>
              <p>
                De acuerdo con la Ley 19.628, tienes los siguientes derechos sobre tus datos
                personales:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Acceso:</strong> Solicitar una copia de la información personal que
                  tenemos sobre ti.
                </li>
                <li>
                  <strong>Rectificación:</strong> Corregir información incorrecta o incompleta.
                </li>
                <li>
                  <strong>Cancelación:</strong> Solicitar la eliminación de tus datos personales.
                </li>
                <li>
                  <strong>Oposición:</strong> Oponerte al tratamiento de tus datos para fines
                  específicos.
                </li>
              </ul>
              <p>
                Para ejercer estos derechos, puedes hacerlo directamente desde tu panel de control
                (opción "Eliminar cuenta") o contactándonos en{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">7. Cookies y Tecnologías Similares</h2>
              <p>
                Utilizamos cookies esenciales para el funcionamiento de la plataforma
                (autenticación de sesión). No utilizamos cookies de publicidad o seguimiento de
                terceros.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">8. Retención de Datos</h2>
              <p>
                Conservamos tu información personal mientras tu cuenta esté activa o sea necesario
                para proporcionarte nuestros servicios. Cuando eliminas tu cuenta, tus datos se
                eliminan permanentemente de nuestros sistemas en un plazo de 30 días, excepto
                aquellos que debamos conservar por obligaciones legales.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">
                9. Cambios a esta Política de Privacidad
              </h2>
              <p>
                Podemos actualizar esta política periódicamente. Te notificaremos cualquier cambio
                significativo por correo electrónico o mediante un aviso en la plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-3">10. Contacto</h2>
              <p>
                Si tienes preguntas sobre esta Política de Privacidad o deseas ejercer tus
                derechos, contáctanos en:
              </p>
              <p className="font-semibold">
                Email:{" "}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </p>
            </section>

            <section className="bg-background p-4 rounded-lg border border-border">
              <p className="text-sm text-muted">
                <strong>Nota legal:</strong> Esta política cumple con la Ley N° 19.628 sobre
                Protección de la Vida Privada de Chile y se actualizará para cumplir con la futura
                Ley de Protección de Datos Personales 2.0 cuando entre en vigencia.
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
