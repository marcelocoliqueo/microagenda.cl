# Plan de Pruebas - MicroAgenda

## ✅ Funcionalidades Implementadas

### 1. Sistema de Auto-actualización de Estados
### 2. Dashboard Rediseñado con Filtros
### 3. Vista Timeline Especial para Hoy
### 4. Sistema de Recordatorios Automáticos

---

## 🧪 Plan de Pruebas Detallado

### **FASE 1: Sistema de Auto-actualización de Estados**

#### 1.1 Prueba de Transición: Pending → Confirmed
**Objetivo**: Verificar que las citas pendientes se auto-confirmen después de 2 horas

**Pasos**:
1. Crear una cita nueva con estado `pending`
2. Modificar manualmente el `created_at` en la base de datos para simular que fue creada hace 3 horas
3. Ejecutar manualmente el endpoint: `POST /api/cron/auto-update-appointments`
4. Verificar que el estado cambió a `confirmed`

**Resultado Esperado**:
- ✅ Cita cambia de `pending` a `confirmed`
- ✅ Endpoint retorna `{ confirmed: 1 }`

---

#### 1.2 Prueba de Transición: Confirmed → Completed
**Objetivo**: Verificar que las citas confirmadas se auto-completen después de su hora de finalización

**Pasos**:
1. Crear una cita con estado `confirmed` para hoy
2. Asignar una hora que ya haya pasado (ej: 2 horas atrás)
3. El servicio debe tener duración definida (ej: 60 minutos)
4. Ejecutar endpoint de auto-actualización
5. Verificar que el estado cambió a `completed`

**Resultado Esperado**:
- ✅ Cita cambia de `confirmed` a `completed`
- ✅ Endpoint retorna `{ completed: 1 }`

---

#### 1.3 Prueba de Transición: Completed → Archived
**Objetivo**: Verificar que las citas completadas se archiven después de 7 días

**Pasos**:
1. Crear una cita con estado `completed`
2. Modificar el `date` en la base de datos para que sea hace 8 días
3. Ejecutar endpoint de auto-actualización
4. Verificar que el estado cambió a `archived`

**Resultado Esperado**:
- ✅ Cita cambia de `completed` a `archived`
- ✅ Endpoint retorna `{ archived: 1 }`

---

#### 1.4 Prueba de Seguridad del Endpoint
**Objetivo**: Verificar que el endpoint requiera autenticación

**Pasos**:
1. Intentar llamar al endpoint sin header `Authorization`
2. Verificar que retorne error 401

**Resultado Esperado**:
- ✅ Retorna `401 Unauthorized`
- ✅ Mensaje: "Unauthorized"

---

#### 1.5 Prueba del Cron Job
**Objetivo**: Verificar que el cron job esté configurado correctamente en Vercel

**Pasos**:
1. Verificar en `vercel.json` que existe:
```json
{
  "path": "/api/cron/auto-update-appointments",
  "schedule": "0 * * * *"
}
```
2. Desplegar a Vercel
3. Esperar 1 hora o revisar logs de Vercel
4. Verificar que se ejecutó el cron

**Resultado Esperado**:
- ✅ Cron configurado correctamente
- ✅ Se ejecuta cada hora
- ✅ Logs muestran ejecución exitosa

---

### **FASE 2: Dashboard Rediseñado con Filtros**

#### 2.1 Prueba del Filtro "Hoy"
**Objetivo**: Verificar que el filtro "Hoy" muestre solo citas del día actual

**Pasos**:
1. Crear 3 citas:
   - Cita A: Hoy, 10:00 AM, estado `confirmed`
   - Cita B: Mañana, 11:00 AM, estado `confirmed`
   - Cita C: Hace 2 días, estado `completed`
2. Navegar al dashboard
3. Hacer clic en el filtro "Hoy"
4. Verificar que solo aparezca la Cita A

**Resultado Esperado**:
- ✅ Solo se muestra la Cita A
- ✅ Contador del botón "Hoy" muestra: 1
- ✅ Título dice: "Citas de Hoy"

---

#### 2.2 Prueba del Filtro "Próximas"
**Objetivo**: Verificar que muestre citas de los próximos 7 días

**Pasos**:
1. Crear 4 citas:
   - Cita A: Mañana, estado `confirmed`
   - Cita B: En 3 días, estado `pending`
   - Cita C: En 10 días, estado `confirmed`
   - Cita D: Hoy, estado `completed`
2. Hacer clic en "Próximas"
3. Verificar que aparezcan solo Citas A y B

**Resultado Esperado**:
- ✅ Se muestran Citas A y B
- ✅ No se muestra Cita C (fuera de rango)
- ✅ No se muestra Cita D (completada)
- ✅ Contador muestra: 2

---

#### 2.3 Prueba del Filtro "Completadas"
**Objetivo**: Verificar que muestre solo citas completadas (últimos 30 días)

**Pasos**:
1. Crear 3 citas:
   - Cita A: Hace 5 días, estado `completed`
   - Cita B: Hace 40 días, estado `completed`
   - Cita C: Mañana, estado `confirmed`
2. Hacer clic en "Completadas"
3. Verificar que solo aparezca Cita A

**Resultado Esperado**:
- ✅ Solo se muestra Cita A
- ✅ Cita B no aparece (más de 30 días)
- ✅ Ordenadas por fecha descendente

---

#### 2.4 Prueba del Filtro "Todas"
**Objetivo**: Verificar que muestre todas las citas activas (no archivadas)

**Pasos**:
1. Crear 4 citas:
   - Cita A: Mañana, estado `pending`
   - Cita B: Hoy, estado `completed`
   - Cita C: Hace 10 días, estado `completed`
   - Cita D: Hace 20 días, estado `archived`
2. Hacer clic en "Todas"
3. Verificar que aparezcan A, B y C (no D)

**Resultado Esperado**:
- ✅ Se muestran Citas A, B y C
- ✅ Cita D (archived) no aparece
- ✅ Ordenadas por fecha y hora

---

#### 2.5 Prueba de Persistencia de Filtro
**Objetivo**: Verificar que el filtro se mantenga al recargar

**Pasos**:
1. Seleccionar filtro "Completadas"
2. Recargar la página (F5)
3. Verificar que siga en "Completadas" o vuelva a default

**Resultado Esperado**:
- ⚠️ Por ahora vuelve a "Próximas" (default)
- 💡 Mejora futura: Guardar en localStorage

---

#### 2.6 Prueba de Responsive de Filtros
**Objetivo**: Verificar que los filtros se vean bien en móvil

**Pasos**:
1. Abrir dashboard en móvil (o DevTools responsive)
2. Verificar que los botones de filtro:
   - Se apilen verticalmente en móvil
   - Mantengan iconos y contadores visibles
   - Texto no se corte

**Resultado Esperado**:
- ✅ Botones responsivos
- ✅ Texto legible
- ✅ Contadores visibles

---

### **FASE 3: Vista Timeline Especial para Hoy**

#### 3.1 Prueba de Visualización Timeline
**Objetivo**: Verificar que la vista timeline se muestre correctamente

**Pasos**:
1. Crear 3 citas para hoy:
   - 9:00 AM, estado `completed`
   - 11:00 AM, estado `confirmed` (hora actual: 10:30 AM)
   - 2:00 PM, estado `pending`
2. Navegar al dashboard
3. Seleccionar filtro "Hoy"
4. Verificar que se muestre timeline con indicadores

**Resultado Esperado**:
- ✅ Se muestra vista timeline (no lista normal)
- ✅ Línea vertical conectando las citas
- ✅ Citas ordenadas por hora

---

#### 3.2 Prueba de Estado "En Curso"
**Objetivo**: Verificar que citas actuales se marquen como "En curso"

**Pasos**:
1. Crear cita para hoy a la hora actual (ej: si son 11:00 AM, crear cita a las 11:00 AM)
2. Servicio con duración 60 minutos
3. Estado `confirmed`
4. Navegar al dashboard filtro "Hoy"
5. Verificar que muestre badge "En curso" y animación

**Resultado Esperado**:
- ✅ Badge "En curso" visible
- ✅ Indicador azul pulsando
- ✅ Caja resaltada con borde azul

---

#### 3.3 Prueba de Acciones Contextuales
**Objetivo**: Verificar que los botones cambien según el estado

**Pasos**:
1. Crear 3 citas para hoy:
   - Cita A: `pending`, hora futura → Debe mostrar botón "Confirmar"
   - Cita B: `confirmed`, hora actual → Debe mostrar botón "Marcar Completada"
   - Cita C: `completed`, hora pasada → Solo selector de estado
2. Verificar botones en cada cita

**Resultado Esperado**:
- ✅ Cita A: Botón verde "Confirmar"
- ✅ Cita B: Botón verde "Marcar Completada" + animación
- ✅ Cita C: Solo selector estándar

---

#### 3.4 Prueba de Colores por Estado
**Objetivo**: Verificar que los colores cambien según estado y tiempo

**Pasos**:
1. Crear citas con diferentes estados:
   - `pending` (futuro) → Fondo amarillo
   - `confirmed` (futuro) → Fondo blanco
   - `confirmed` (en curso) → Fondo azul
   - `completed` → Fondo verde
   - `cancelled` → Fondo rojo
2. Verificar colores en timeline

**Resultado Esperado**:
- ✅ Cada estado tiene su color correcto
- ✅ Transiciones suaves entre colores

---

#### 3.5 Prueba de Timeline Vacío
**Objetivo**: Verificar mensaje cuando no hay citas hoy

**Pasos**:
1. Asegurarse de NO tener citas para hoy
2. Seleccionar filtro "Hoy"
3. Verificar mensaje amigable

**Resultado Esperado**:
- ✅ Ícono de reloj
- ✅ Mensaje: "No tienes citas para hoy"
- ✅ Submensaje: "Disfruta tu día libre"

---

### **FASE 4: Sistema de Recordatorios Automáticos**

#### 4.1 Prueba de Recordatorio 24 Horas
**Objetivo**: Verificar envío de recordatorio 24h antes

**Pasos**:
1. Crear cita para mañana a las 10:00 AM
2. Estado `confirmed`
3. Agregar email válido en `client_phone` (temporal)
4. Ejecutar manualmente: `POST /api/send-reminders`
5. Verificar logs y email recibido

**Resultado Esperado**:
- ✅ Endpoint retorna `{ sent24h: 1 }`
- ✅ Email recibido con template correcto
- ✅ Subject: "Recordatorio: [Servicio] mañana a las [Hora]"

---

#### 4.2 Prueba de Recordatorio 2 Horas
**Objetivo**: Verificar envío de recordatorio 2h antes

**Pasos**:
1. Crear cita para hoy en exactamente 2.5 horas
2. Estado `confirmed`
3. Agregar email válido
4. Ejecutar endpoint de recordatorios
5. Verificar email con template urgente

**Resultado Esperado**:
- ✅ Endpoint retorna `{ sent2h: 1 }`
- ✅ Email con diseño amarillo/naranja urgente
- ✅ Subject: "¡Tu cita es en 2 horas! - [Servicio]"
- ✅ Badge "Recordatorio Urgente"

---

#### 4.3 Prueba de Múltiples Recordatorios
**Objetivo**: Verificar que un endpoint envíe ambos tipos

**Pasos**:
1. Crear:
   - Cita A: Mañana a las 10:00 AM
   - Cita B: Hoy en 2.5 horas
2. Ejecutar endpoint una sola vez
3. Verificar que envíe ambos

**Resultado Esperado**:
- ✅ Retorna `{ sent24h: 1, sent2h: 1, total: 2 }`
- ✅ Se reciben 2 emails diferentes

---

#### 4.4 Prueba de Validación de Email
**Objetivo**: Verificar que no falle si falta email

**Pasos**:
1. Crear cita sin `client_phone` (null o vacío)
2. Ejecutar endpoint
3. Verificar que no crashee

**Resultado Esperado**:
- ✅ Endpoint no falla
- ✅ Log: "⚠️ Cita [ID] sin email/teléfono"
- ✅ Continúa con otras citas

---

#### 4.5 Prueba de Cron Job de Recordatorios
**Objetivo**: Verificar que el cron se ejecute cada hora

**Pasos**:
1. Verificar `vercel.json`:
```json
{
  "path": "/api/send-reminders",
  "schedule": "0 12 * * *"
}
```
2. Cambiar a cada hora:
```json
{
  "path": "/api/send-reminders",
  "schedule": "0 * * * *"
}
```
3. Desplegar y verificar logs

**Resultado Esperado**:
- ✅ Se ejecuta cada hora
- ✅ Logs muestran: "🔔 Iniciando proceso de recordatorios..."

---

#### 4.6 Prueba de Templates de Email
**Objetivo**: Verificar diseño de emails en diferentes clientes

**Pasos**:
1. Enviar emails de prueba a:
   - Gmail (desktop)
   - Gmail (mobile)
   - Outlook
   - Apple Mail
2. Verificar renderizado

**Resultado Esperado**:
- ✅ HTML renderiza correctamente
- ✅ Colores y estilos se mantienen
- ✅ Responsive en móvil
- ✅ Imágenes se cargan

---

### **FASE 5: Pruebas de Integración**

#### 5.1 Prueba de Flujo Completo
**Objetivo**: Simular el ciclo de vida completo de una cita

**Pasos**:
1. Usuario crea cita para mañana
2. Sistema envía recordatorio 24h
3. Usuario recibe email
4. Pasan 2 horas → cita se auto-confirma
5. Al día siguiente, 2h antes → envía segundo recordatorio
6. Hora de la cita → aparece como "En curso" en timeline
7. Después de duración → se marca `completed`
8. Después de 7 días → se archiva

**Resultado Esperado**:
- ✅ Todos los pasos se ejecutan automáticamente
- ✅ Usuario recibe 2 emails
- ✅ Estados cambian correctamente

---

#### 5.2 Prueba de Carga
**Objetivo**: Verificar rendimiento con muchas citas

**Pasos**:
1. Crear 100 citas para hoy (script)
2. Navegar al dashboard
3. Medir tiempo de carga
4. Cambiar entre filtros

**Resultado Esperado**:
- ✅ Carga en < 2 segundos
- ✅ Filtros responden inmediatamente
- ✅ Timeline renderiza sin lag

---

#### 5.3 Prueba de Concurrencia
**Objetivo**: Verificar que cron jobs no se ejecuten simultáneamente

**Pasos**:
1. Simular 2 ejecuciones del cron al mismo tiempo
2. Verificar logs
3. Asegurar que no envíe duplicados

**Resultado Esperado**:
- ✅ Solo una ejecución procesa las citas
- ✅ No hay emails duplicados

---

### **FASE 6: Pruebas de Usuario (UAT)**

#### 6.1 Prueba de Usabilidad
**Objetivo**: Verificar que usuarios reales entiendan la interfaz

**Pasos**:
1. Dar acceso a 5 usuarios reales
2. Pedirles que:
   - Creen una cita
   - Usen los filtros
   - Vean su timeline del día
3. Recoger feedback

**Resultado Esperado**:
- ✅ Usuarios entienden los filtros
- ✅ Timeline es intuitivo
- ✅ No hay confusión

---

#### 6.2 Prueba de Accesibilidad
**Objetivo**: Verificar que sea accesible

**Pasos**:
1. Usar Lighthouse en Chrome DevTools
2. Revisar:
   - Contraste de colores
   - Navegación con teclado
   - Lectores de pantalla
3. Corregir issues

**Resultado Esperado**:
- ✅ Score de accesibilidad > 90
- ✅ Todos los botones navegables con Tab
- ✅ Textos legibles

---

## 📋 Checklist de Pruebas

### Sistema de Auto-actualización
- [ ] 1.1 Pending → Confirmed
- [ ] 1.2 Confirmed → Completed
- [ ] 1.3 Completed → Archived
- [ ] 1.4 Seguridad del endpoint
- [ ] 1.5 Cron job configurado

### Dashboard con Filtros
- [ ] 2.1 Filtro "Hoy"
- [ ] 2.2 Filtro "Próximas"
- [ ] 2.3 Filtro "Completadas"
- [ ] 2.4 Filtro "Todas"
- [ ] 2.5 Persistencia (opcional)
- [ ] 2.6 Responsive

### Vista Timeline
- [ ] 3.1 Visualización timeline
- [ ] 3.2 Estado "En curso"
- [ ] 3.3 Acciones contextuales
- [ ] 3.4 Colores por estado
- [ ] 3.5 Mensaje vacío

### Sistema de Recordatorios
- [ ] 4.1 Recordatorio 24h
- [ ] 4.2 Recordatorio 2h
- [ ] 4.3 Múltiples recordatorios
- [ ] 4.4 Validación de email
- [ ] 4.5 Cron job cada hora
- [ ] 4.6 Templates de email

### Integración
- [ ] 5.1 Flujo completo
- [ ] 5.2 Prueba de carga
- [ ] 5.3 Concurrencia

### Usuario Final
- [ ] 6.1 Usabilidad
- [ ] 6.2 Accesibilidad

---

## 🐛 Registro de Bugs

| ID | Fecha | Funcionalidad | Descripción | Severidad | Estado |
|----|-------|---------------|-------------|-----------|--------|
| - | - | - | - | - | - |

---

## 📊 Métricas de Éxito

- ✅ **100% de tests pasados**
- ✅ **0 errores críticos**
- ✅ **< 2s tiempo de carga dashboard**
- ✅ **> 95% emails entregados**
- ✅ **Score Lighthouse > 90**

---

## 🚀 Próximos Pasos Después de Pruebas

1. **Monitoreo en Producción**
   - Configurar Sentry para errores
   - Logs de cron jobs en Vercel
   - Tracking de emails (Resend dashboard)

2. **Mejoras Identificadas**
   - Implementar persistencia de filtro (localStorage)
   - Agregar campo `email` real en appointments
   - Optimizar queries con índices en Supabase

3. **Siguiente Fase de Desarrollo**
   - Vista de calendario visual (drag & drop)
   - Bloqueos inteligentes de tiempo
   - CRM de clientes con historial
   - Métricas de negocio

---

**Fecha de Creación**: 2025-11-11
**Última Actualización**: 2025-11-11
**Responsable**: Equipo MicroAgenda
