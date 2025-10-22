# Configuración de Supabase para MicroAgenda

Esta guía te ayudará a configurar correctamente Supabase para MicroAgenda.

## 1. Crear Proyecto en Supabase

1. Ve a [Supabase](https://supabase.com) y crea una cuenta (gratis)
2. Click en "New Project"
3. Completa:
   - **Name**: MicroAgenda (o el nombre que prefieras)
   - **Database Password**: Genera una contraseña segura (guárdala)
   - **Region**: South America (São Paulo) - la más cercana a Chile
   - **Pricing Plan**: Free (suficiente para empezar)
4. Click en "Create new project"
5. Espera 2-3 minutos mientras se crea

## 2. Ejecutar Script SQL

1. En el panel de Supabase, ve a **SQL Editor** (icono de código en el menú lateral)
2. Click en **New query**
3. Copia y pega todo el contenido del archivo `supabase-schema.sql`
4. Click en **RUN** (o Ctrl/Cmd + Enter)
5. Verifica que aparezca "Success. No rows returned"

## 3. Verificar Tablas Creadas

1. Ve a **Table Editor** en el menú lateral
2. Deberías ver las siguientes tablas:
   - `profiles`
   - `plans`
   - `subscriptions`
   - `services`
   - `appointments`
   - `payments`

## 4. Verificar Row Level Security (RLS)

1. Ve a **Authentication** → **Policies**
2. Verifica que cada tabla tenga políticas de seguridad configuradas
3. Esto asegura que los usuarios solo puedan ver/editar sus propios datos

## 5. Obtener Credenciales

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:

   - **Project URL**: `https://[tu-proyecto].supabase.co`
   - **anon public**: Esta es tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. Pégalos en tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 6. Configurar Autenticación

1. Ve a **Authentication** → **Providers**
2. Habilita **Email** (debería estar habilitado por defecto)
3. Configuración recomendada:
   - ✅ Enable email confirmations: **OFF** (para facilitar pruebas)
   - ✅ Enable email change confirmations: **ON**
   - ✅ Enable password recovery: **ON**

## 7. Configurar Realtime (Opcional pero Recomendado)

1. Ve a **Database** → **Replication**
2. Habilita Realtime para las siguientes tablas:
   - `appointments`
   - `services`
3. Esto permite actualización en tiempo real del dashboard

## 8. Verificar Plan Inicial

1. Ve a **Table Editor** → **plans**
2. Deberías ver un registro con:
   - **name**: Único
   - **price**: 6490
   - **currency**: CLP
   - **is_active**: true

Si no aparece, ejecuta manualmente:

```sql
INSERT INTO plans (name, price, currency, period, is_active)
VALUES ('Único', 6490, 'CLP', 'monthly', true);
```

## 9. Prueba de Registro

1. Inicia tu aplicación localmente: `npm run dev`
2. Ve a [http://localhost:3000/register](http://localhost:3000/register)
3. Crea una cuenta de prueba
4. Ve a Supabase → **Table Editor** → **profiles**
5. Deberías ver tu perfil creado automáticamente

## 10. Verificar Trigger de Auto-Creación de Perfil

Si el perfil no se crea automáticamente al registrarte:

1. Ve a **SQL Editor**
2. Ejecuta:

```sql
-- Verificar que el trigger existe
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Si no existe, ejecuta la creación del trigger (está en supabase-schema.sql)
```

## Problemas Comunes

### Error: "relation 'profiles' does not exist"

- Solución: Ejecuta nuevamente el script SQL completo

### Error: "permission denied for table profiles"

- Solución: Verifica que RLS esté configurado correctamente y que las policies existan

### El perfil no se crea automáticamente

- Solución: Verifica que el trigger `on_auth_user_created` esté activo

### No puedo ver las citas de otros usuarios

- Esto es correcto: RLS está funcionando. Cada usuario solo ve sus propios datos.

## Límites del Plan Gratuito

El plan gratuito de Supabase incluye:

- ✅ 500 MB de almacenamiento de base de datos
- ✅ 2 GB de almacenamiento de archivos
- ✅ 5 GB de transferencia de datos
- ✅ 50,000 usuarios activos mensuales
- ✅ 500 MB de Edge Functions invocations

**Suficiente para comenzar y escalar hasta ~100-200 profesionales activos**

## Migración a Producción

Cuando estés listo para producción:

1. Considera actualizar a **Pro Plan** ($25/mes) para:
   - Más recursos
   - Backups diarios automáticos
   - Soporte prioritario
2. Configura backups regulares
3. Monitorea uso en **Settings** → **Usage**

## Backup Manual

Para hacer backup manual:

1. Ve a **Database** → **Backups**
2. Click en **Create backup**
3. O usa pg_dump si tienes PostgreSQL instalado localmente

## Soporte

- Documentación oficial: [https://supabase.com/docs](https://supabase.com/docs)
- Discord de Supabase: [https://discord.supabase.com](https://discord.supabase.com)
- GitHub: [https://github.com/supabase/supabase](https://github.com/supabase/supabase)

---

¡Listo! Tu base de datos Supabase está configurada y lista para MicroAgenda.
