# 🚀 GUÍA DE CONFIGURACIÓN DE SUPABASE PARA MICROAGENDA

## Paso 1: Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en **"New Project"**
3. Configura:
   - **Organization**: Selecciona o crea una
   - **Project Name**: `microagenda` o `microagenda-prod`
   - **Database Password**: Genera una contraseña fuerte y guárdala
   - **Region**: `South America (São Paulo)` - más cercano a Chile
   - **Pricing Plan**: `Free` (para empezar)

4. Click en **"Create new project"** y espera 2-3 minutos

---

## Paso 2: Obtener las Credenciales

1. En tu proyecto, ve a **Settings** (⚙️) → **API**
2. Encontrarás:
   - **Project URL**: `https://xxxxxxxx.supabase.co`
   - **API Keys** → **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

3. Copia estos valores, los necesitarás en el siguiente paso

---

## Paso 3: Configurar Variables de Entorno

Abre el archivo `.env.local` y reemplaza los valores:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.TU-KEY-AQUI
```

---

## Paso 4: Ejecutar el Schema SQL

1. En tu proyecto de Supabase, ve a **SQL Editor** (icono de <>)
2. Click en **"New query"**
3. Copia y pega TODO el contenido del archivo `supabase-schema.sql`
4. Click en **"Run"** (▶️ en la esquina inferior derecha)

**Verifica que no haya errores.** Deberías ver un mensaje verde de éxito.

---

## Paso 5: Verificar las Tablas

1. Ve a **Table Editor** (icono de tabla)
2. Deberías ver estas tablas creadas:
   - ✅ `profiles`
   - ✅ `services`
   - ✅ `appointments`
   - ✅ `subscriptions`
   - ✅ `payments`
   - ✅ `plans`

3. Click en la tabla `plans` → deberías ver **1 fila** con el plan "Único" ($6,490)

---

## Paso 6: Habilitar Realtime (Opcional pero Recomendado)

1. Ve a **Database** → **Replication**
2. Busca las tablas `appointments` y `services`
3. Activa el toggle de **"Realtime"** para ambas

Esto permitirá que el dashboard se actualice automáticamente cuando hay cambios.

---

## Paso 7: Configurar Autenticación

1. Ve a **Authentication** → **Providers**
2. Asegúrate que **Email** esté habilitado (debería estar por defecto)
3. En **Email Templates**, personaliza si quieres:
   - **Confirm signup**: Email de confirmación
   - **Magic Link**: Link mágico de inicio de sesión

---

## Paso 8: Configurar Variables de Entorno en Vercel

Si ya desplegaste en Vercel:

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. Click en **Settings** → **Environment Variables**
3. Agrega:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://TU-PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOi...TU-KEY
   ```
4. Marca las 3 opciones: Production, Preview, Development
5. Click en **Save**
6. Redeploy tu aplicación

---

## Paso 9: Probar la Conexión

1. En tu terminal local, ejecuta:
   ```bash
   npm run dev
   ```

2. Abre `http://localhost:3000/register`

3. Intenta crear una cuenta de prueba:
   - Nombre: Test User
   - Email: test@test.com
   - Contraseña: test1234

4. Si todo funciona:
   - ✅ Deberías ser redirigido al dashboard
   - ✅ En Supabase → **Authentication** → **Users** deberías ver el usuario creado
   - ✅ En **Table Editor** → `profiles` deberías ver el perfil creado

---

## ✅ Checklist de Verificación

- [ ] Proyecto de Supabase creado
- [ ] Variables de entorno configuradas en `.env.local`
- [ ] Schema SQL ejecutado sin errores
- [ ] 6 tablas creadas correctamente
- [ ] Plan "Único" insertado en tabla `plans`
- [ ] Realtime habilitado en `appointments` y `services`
- [ ] Registro de usuario funcionando
- [ ] Dashboard cargando correctamente
- [ ] Variables configuradas en Vercel (si aplica)

---

## 🆘 Problemas Comunes

### Error: "Invalid JWT"
- Verifica que el `NEXT_PUBLIC_SUPABASE_ANON_KEY` sea el correcto
- Asegúrate de copiar la key completa (es MUY larga)

### Error: "relation does not exist"
- El schema SQL no se ejecutó correctamente
- Vuelve a ejecutar todo el contenido de `supabase-schema.sql`

### No puedo crear un usuario
- Verifica que el trigger `on_auth_user_created` se haya creado
- Ve a **SQL Editor** y ejecuta:
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
  ```
- Debería retornar 1 fila

### RLS Policies Error
- Las políticas RLS están bien configuradas en el schema
- Si tienes problemas, ve a **Authentication** → **Policies** y verifica

---

## 📞 ¿Necesitas Ayuda?

Si encuentras algún error o problema, dime exactamente:
1. El mensaje de error completo
2. En qué paso estás
3. Una captura de pantalla si es posible

¡Listo para conectar! 🎉

