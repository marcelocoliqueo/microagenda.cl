# Fix de Variables de Entorno en Vercel

## Problema
Todas las variables de entorno en Vercel tienen un salto de línea (`\n`) al final, causando errores en WebSocket de Supabase.

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
