# 📧 Configuración de Confirmación de Email - MicroAgenda

## Paso 1: Activar Confirmación de Email en Supabase

1. Ve a tu dashboard de Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto **microagenda**
3. Ve a **Authentication** → **Providers**
4. Click en **Email**
5. ✅ **Activa "Enable email confirmations"**
6. Click **Save**

---

## Paso 2: Personalizar Email de Confirmación

### 2.1 Ir a Email Templates

1. Ve a **Authentication** → **Email Templates**
2. Selecciona **"Confirm signup"**

### 2.2 Reemplazar el Template

Copia y pega el siguiente código en el editor:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      line-height: 1.6;
      color: #111827;
      margin: 0;
      padding: 0;
      background: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      color: white;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      background: #10B981;
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      background: #059669;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .logo {
      width: 60px;
      height: 60px;
      margin: 0 auto 20px;
    }
    p {
      margin: 16px 0;
      color: #374151;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://microagenda.cl/logo.svg" alt="MicroAgenda" class="logo" />
      <h1>Confirma tu cuenta</h1>
    </div>
    <div class="content">
      <p>Hola,</p>
      <p>Te damos la bienvenida a <strong>MicroAgenda</strong>! 🎉</p>
      <p>Estás a un paso de comenzar a gestionar tus citas de forma profesional.</p>
      <p>Para activar tu cuenta, haz clic en el botón de abajo:</p>
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Confirmar mi cuenta</a>
      </div>
      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        O copia y pega este enlace en tu navegador:<br>
        <span style="word-break: break-all; color: #10B981;">{{ .ConfirmationURL }}</span>
      </p>
      <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
        Si no creaste una cuenta en MicroAgenda, puedes ignorar este mensaje.
      </p>
    </div>
    <div class="footer">
      <p>© 2025 MicroAgenda. Todos los derechos reservados.</p>
      <p style="margin-top: 10px;">
        ¿Necesitas ayuda? <a href="mailto:soporte@microagenda.cl" style="color: #10B981;">Contáctanos</a>
      </p>
    </div>
  </div>
</body>
</html>
```

### 2.3 Guardar Template

1. Click en **Save**

---

## Paso 3: Configurar URL de Redirección

### 3.1 Settings de Redirección

1. Ve a **Authentication** → **URL Configuration**
2. En **Site URL**, asegúrate que sea: `https://microagenda.cl` (o tu dominio en producción)
3. En **Redirect URLs**, agrega:
   - `https://microagenda.cl/auth/callback`
   - `https://microagenda.cl/email-confirmed`
   - `http://localhost:3000/auth/callback` (para desarrollo)
   - `http://localhost:3000/email-confirmed` (para desarrollo)

### 3.2 Actualizar .env.local

Agrega estas variables en tu archivo `.env.local`:

```bash
# Supabase Auth Callback
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# En producción:
# NEXT_PUBLIC_SITE_URL=https://microagenda.cl
```

---

## Paso 4: Actualizar código de autenticación

Necesitamos crear un endpoint para manejar el callback de Supabase.

### 4.1 Crear Auth Callback Handler

```typescript
// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to email confirmed page
  return NextResponse.redirect(new URL('/email-confirmed', requestUrl.origin))
}
```

### 4.2 Instalar Dependencia

```bash
npm install @supabase/auth-helpers-nextjs
```

---

## ✅ Checklist de Verificación

- [ ] Confirmación de email activada en Supabase
- [ ] Template personalizado copiado y guardado
- [ ] Redirect URLs configuradas en Supabase
- [ ] Variables de entorno actualizadas
- [ ] Auth callback handler creado
- [ ] Prueba de registro funcionando
- [ ] Email de confirmación llegando
- [ ] Redirect a /email-confirmed funcionando
- [ ] Login automático después de confirmar

---

## 🧪 Cómo Probar

1. Abre: `http://localhost:3000/register`
2. Crea una cuenta de prueba
3. Deberías ser redirigido a `/verify-email`
4. Revisa tu email (incluso spam)
5. Haz clic en el enlace de confirmación
6. Deberías ser redirigido a `/email-confirmed`
7. Automáticamente al dashboard

---

## 📧 Personalización de Emails

Si quieres cambiar el diseño del email:

1. Ve a **Authentication** → **Email Templates**
2. Selecciona el template que quieres modificar
3. Usa variables disponibles:
   - `{{ .ConfirmationURL }}` - URL de confirmación
   - `{{ .Email }}` - Email del usuario
   - `{{ .Token }}` - Token de confirmación

---

## ❓ FAQ

**¿Por qué no funciona el redirect?**
- Verifica que la URL de redirect esté en la lista de Supabase
- Asegúrate que `NEXT_PUBLIC_SITE_URL` esté correctamente configurado

**¿Por qué no llega el email?**
- Verifica spam
- Revisa la configuración de SMTP en Supabase
- (Opcional) Configura un SMTP personalizado con Resend

**¿Puedo cambiar el diseño del email?**
- Sí, edita el template en Supabase
- O configura tu propio SMTP con Resend para más control

