# Cambiar Nombre del Plan de "Único" a "Mensual"

## ⚠️ Problema Actual

El plan se llama **"Único"** en la base de datos, lo que puede confundir a los usuarios porque:
- ❌ "Único" suena a **pago único** (una sola vez)
- ❌ No deja claro que es una **suscripción mensual recurrente**
- ❌ En MercadoPago aparece como "MicroAgenda - Plan Único" que puede confundir

---

## ✅ Solución Recomendada

Cambiar el nombre del plan de **"Único"** a **"Mensual"** para que sea más claro.

---

## 📋 Pasos para Cambiar

### Opción 1: Cambiar en la Base de Datos (Recomendado)

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Ejecuta este query:

```sql
UPDATE plans 
SET name = 'Mensual' 
WHERE name = 'Único' AND is_active = true;
```

4. Verifica que se actualizó:

```sql
SELECT * FROM plans WHERE is_active = true;
```

Deberías ver:
```
name: "Mensual"
```

---

### Opción 2: Cambiar en el Código (Si quieres mantener "Único" pero mostrar "Mensual")

Si prefieres mantener "Único" en la base de datos pero mostrar "Mensual" en MercadoPago, puedes modificar el código:

**Archivo: `lib/mercadopagoClient.ts` y `app/api/create-subscription-preference/route.ts`**

Cambiar:
```typescript
reason: `MicroAgenda - Plan ${params.planName}`
```

Por:
```typescript
reason: `MicroAgenda - Plan Mensual`
```

O mejor aún, usar un mapeo:
```typescript
const displayName = params.planName === 'Único' ? 'Mensual' : params.planName;
reason: `MicroAgenda - Plan ${displayName}`
```

---

## 🎯 Recomendación Final

**Usa la Opción 1** (cambiar en la base de datos):
- ✅ Más simple y directo
- ✅ Consistente en toda la aplicación
- ✅ No requiere cambios en el código
- ✅ El nombre será "Mensual" en todos lados

---

## ✅ Después de Cambiar

1. Verifica que el cambio se aplicó en la base de datos
2. Crea una nueva suscripción desde tu app
3. Verifica que en MercadoPago aparezca **"MicroAgenda - Plan Mensual"** (no "Plan Único")

---

## 📝 Resultado Esperado

**Antes:**
- Base de datos: `name: "Único"`
- MercadoPago: "MicroAgenda - Plan Único" ❌ (confuso)

**Después:**
- Base de datos: `name: "Mensual"`
- MercadoPago: "MicroAgenda - Plan Mensual" ✅ (claro)

---

**Nota**: Si tienes usuarios existentes con el plan "Único", el cambio en la base de datos los actualizará automáticamente. No afectará sus suscripciones activas.

