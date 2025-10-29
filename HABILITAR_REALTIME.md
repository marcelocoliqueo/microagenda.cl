# 🔴 Cómo Habilitar Realtime en Supabase

## ⚠️ Problema Actual

El error de WebSocket que ves en la consola:
```
WebSocket connection to 'wss://...supabase.co/realtime/...' failed
```

Ocurre porque **Realtime no está habilitado** en tu proyecto de Supabase.

---

## ✅ Solución: Habilitar Realtime

### Paso 1: Accede a Supabase

1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto de MicroAgenda

### Paso 2: Habilita Realtime

1. En el menú lateral, busca **"Database"** o **"Base de datos"**
2. Click en **"Replication"** o **"Replicación"**
3. Busca la tabla `appointments`
4. Haz click en el toggle para **habilitar Realtime** en esa tabla
5. Repite para otras tablas si quieres (ej: `services`, `profiles`)

### Paso 3: Verificar

Una vez habilitado, recarga tu aplicación. Deberías ver en la consola (en desarrollo):
```
✅ Realtime conectado para appointments
```

---

## 🎯 ¿Qué es Realtime?

**Realtime** permite que los cambios en la base de datos se reflejen **instantáneamente** en la aplicación, sin necesidad de recargar la página.

**Ejemplo:**
- Creas una cita en una pestaña
- En otra pestaña con el dashboard abierto, la cita aparece **automáticamente**
- Sin tener que hacer refresh o esperar

---

## ⚠️ Importante

### Realtime NO es Obligatorio

La aplicación funciona **perfectamente** sin Realtime. Solo significa que:

- ✅ La app funciona sin problemas
- ✅ Tienes que hacer refresh manual para ver cambios nuevos
- ✅ Las actualizaciones no son instantáneas

### Con Realtime Habilitado

- ✅ Actualizaciones instantáneas
- ✅ Mejor experiencia de usuario
- ✅ Cambios se reflejan automáticamente

---

## 🔧 Verificar Estado Actual

Para ver si Realtime está habilitado:

1. Ve a Supabase Dashboard
2. Database → Replication
3. Busca la tabla `appointments`
4. Si el toggle está **encendido** (verde) → Realtime está habilitado
5. Si está **apagado** (gris) → Necesitas habilitarlo

---

## 🐛 Si el Error Persiste

Si después de habilitar Realtime sigues viendo el error:

1. Verifica que tengas la versión correcta de las credenciales de Supabase
2. Asegúrate de que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén correctos
3. Verifica que no haya restricciones de CORS o firewall bloqueando WebSockets

---

## 📝 Notas

- El error de WebSocket **no afecta la funcionalidad** de la app
- Es solo un mensaje informativo si Realtime no está habilitado
- La app funciona perfectamente sin actualizaciones en tiempo real
- Realtime es una **característica premium** que mejora la experiencia

---

## ✅ Checklist

- [ ] Ir a Supabase Dashboard
- [ ] Database → Replication
- [ ] Habilitar Realtime para tabla `appointments`
- [ ] Recargar la aplicación
- [ ] Verificar en consola que conecta (opcional, solo en dev)

---

**¡Listo!** Una vez habilitado, las actualizaciones serán en tiempo real. 🎉

