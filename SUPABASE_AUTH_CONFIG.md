# Configuración de Autenticación en Supabase

Esta guía te ayuda a configurar correctamente las URLs de autenticación en Supabase para que la confirmación de email funcione correctamente.

## Problema Común

Por defecto, Supabase envía los tokens de autenticación en el **hash fragment** de la URL:
```
https://microagenda.cl/#access_token=...&refresh_token=...
```

Esto hace que el usuario llegue a la landing page en lugar del dashboard.

## Solución Implementada

Hemos creado un componente `AuthHandler` que:
- ✅ Detecta automáticamente tokens en el hash de cualquier página
- ✅ Establece la sesión automáticamente
- ✅ Redirige al dashboard
- ✅ Funciona sin configuración adicional

## Configuración Recomendada en Supabase (Opcional)

Para una experiencia aún mejor, configura estas URLs en tu proyecto de Supabase:

### 1. Ir a Configuración de Auth

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Click en **Authentication** → **URL Configuration**

### 2. Configurar Site URL

```
Site URL: https://microagenda.cl
```

### 3. Configurar Redirect URLs

Agrega estas URLs a la lista de **Redirect URLs**:

```
https://microagenda.cl/dashboard
https://microagenda.cl/auth/callback
https://microagenda.cl/email-confirmed
http://localhost:3000/dashboard (para desarrollo)
http://localhost:3000/auth/callback (para desarrollo)
```

### 4. Configurar Email Templates (Importante)

Ve a **Authentication** → **Email Templates** y configura:

#### Template de "Confirm Signup"

Cambia la URL de confirmación para usar el callback route:

**Antes:**
```html
<a href="{{ .ConfirmationURL }}">Confirma tu email</a>
```

**Después:**
```html
<a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Confirma tu email</a>
```

O mejor aún, usa el PKCE flow (más seguro):

```html
<a href="{{ .ConfirmationURL }}">Confirma tu email</a>
```

Y configura en **Settings** → **Auth**:
- Enable PKCE flow: **ON**
- Redirect to: `https://microagenda.cl/auth/callback`

## Verificar Configuración

### Desarrollo Local

1. Registra una cuenta de prueba
2. Verifica que el email llegue
3. Haz clic en el enlace de confirmación
4. Deberías ser redirigido automáticamente al dashboard

### Producción

1. El `AuthHandler` detectará los tokens automáticamente
2. No importa a qué página llegues (landing, verify-email, etc.)
3. Serás redirigido al dashboard automáticamente

## Logs de Debugging

El `AuthHandler` genera logs útiles en la consola del navegador:

```
🔍 AuthHandler: Hash detectado en URL
✅ AuthHandler: Tokens de autenticación encontrados, tipo: signup
✅ AuthHandler: Sesión establecida exitosamente para: usuario@email.com
➡️ AuthHandler: Redirigiendo al dashboard
```

Si algo falla, verás:
```
❌ AuthHandler: Error al establecer sesión: [error]
```

## Flujo de Autenticación

### Con AuthHandler (Actual)

```
1. Usuario se registra
2. Recibe email con link: microagenda.cl/#access_token=...
3. Click en link → Landing page
4. AuthHandler detecta tokens en hash
5. Establece sesión automáticamente
6. Redirige al dashboard ✅
```

### Flujo Ideal (Con configuración de Supabase)

```
1. Usuario se registra
2. Recibe email con link: microagenda.cl/auth/callback?code=...
3. Click en link → Callback route
4. Servidor intercambia code por tokens
5. Setea cookies de sesión
6. Redirige al dashboard ✅
```

## Solución de Problemas

### El usuario llega a la landing después de confirmar

**Solución:** El `AuthHandler` debería detectarlo automáticamente. Verifica:
1. Que el hash tenga `access_token`
2. Los logs en la consola del navegador
3. Que no haya errores de JavaScript

### El usuario tiene que hacer login manualmente

**Causas posibles:**
1. Los tokens expiraron (1 hora de validez)
2. Error al establecer la sesión
3. Cookies bloqueadas por el navegador

**Solución:**
1. Verificar logs en consola
2. Verificar que las cookies estén habilitadas
3. Intentar en modo incógnito

### Los tokens no se detectan

**Verificar:**
1. Que el `AuthHandler` esté montado en el layout
2. Que no haya errores en la consola
3. Que la URL tenga `#access_token=` en el hash

## Alternativa: Forzar Redirect

Si prefieres que Supabase siempre redirija al callback route, configura en el email template:

```javascript
// En el template de email
const confirmUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token_hash=${tokenHash}&type=email`;
```

Esto evita el uso de hash fragments completamente.

## Resumen

✅ **Sin configuración adicional:** El `AuthHandler` maneja todo automáticamente  
✅ **Con configuración:** Puedes mejorar el flujo usando el callback route  
✅ **Ambos métodos funcionan:** Elige el que prefieras  

---

**Última actualización:** Diciembre 2024  
**Versión MicroAgenda:** 2.0.0

