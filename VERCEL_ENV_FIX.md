# Fix de Variables de Entorno en Vercel

## ⚠️ Problema Resuelto

**Causa raíz identificada:** Variables de entorno en Vercel con saltos de línea (`\n`) al final causaban errores en WebSocket de Supabase Realtime.

**Solución aplicada:** Eliminar todos los saltos de línea y espacios adicionales al copiar/pegar valores en Vercel.

### 🔍 Cómo detectar este problema:
- Errores persistentes de WebSocket: `WebSocket connection to 'wss://...' failed`
- Errores de conexión Realtime en consola del navegador
- La app funciona pero Realtime no se conecta

### ✅ Prevención futura:
**SIEMPRE verificar que los valores copiados en Vercel NO tengan:**
- Saltos de línea al final (`\n`)
- Espacios en blanco al inicio o final
- Caracteres invisibles (usar "Mostrar todo" en tu editor para verlos)

**Mejor práctica:** Copiar valores desde un editor de texto plano o usar "Select All" y copiar directamente sin seleccionar espacios adicionales.

## Solución
Actualizar las siguientes variables en Vercel eliminando los saltos de línea:

### Ir a: https://vercel.com/marcelocoliqueo-7860s-projects/microagenda-cl/settings/environment-variables

### Variables a actualizar (para Production, Preview y Development):

#### 1. NEXT_PUBLIC_SUPABASE_URL
**Valor correcto:**
```
https://kfqdjwlvrtpqmeqzsaou.supabase.co
```

#### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
**Valor correcto:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmcWRqd2x2cnRwcW1lcXpzYW91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNjYyNTcsImV4cCI6MjA3Njc0MjI1N30.eSuuKpha8QUQf8OmgwDbAU7IFbvMz2a_6UlbVKaDLro
```

#### 3. NEXT_PUBLIC_SITE_URL
**Valor correcto:**
```
https://microagenda.cl
```

#### 4. NEXT_PUBLIC_APP_URL
**Valor correcto:**
```
https://microagenda.cl
```

#### 5. NEXT_PUBLIC_APP_NAME
**Valor correcto:**
```
MicroAgenda
```

#### 6. MERCADOPAGO_ACCESS_TOKEN
**Valor correcto:**
```
APP_USR-4223690054220076-102119-d1f15ac384d77553836fc111c642d675-232263627
```

#### 7. MERCADOPAGO_WEBHOOK_URL
**Valor correcto:**
```
https://microagenda.cl/api/mercadopago-webhook
```

#### 8. RESEND_API_KEY
**Valor correcto:**
```
re_FhL5wPCF_5WCAYzVoH5Ch22zGy6kn2Kkc
```

## Pasos a seguir:

1. Ve a https://vercel.com/marcelocoliqueo-7860s-projects/microagenda-cl/settings/environment-variables
2. Para cada variable arriba:
   - Haz clic en los tres puntos (...) al lado derecho
   - Selecciona **Edit**
   - Copia y pega el valor correcto (sin espacios ni saltos de línea al final)
   - **IMPORTANTE**: Selecciona todos los entornos (Production, Preview, Development)
   - Guarda
3. Después de actualizar todas las variables, haz un **Redeploy** del proyecto
4. Verifica que el error de WebSocket haya desaparecido

## Verificación
Después del redeploy, deberías ver en la consola del navegador:
```
✅ Realtime conectado para appointments
```

En lugar de:
```
❌ WebSocket connection failed
```
