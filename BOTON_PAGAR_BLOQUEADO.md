# Solución: Botón "Pagar" Bloqueado en MercadoPago

## Problema

El botón "Pagar" aparece bloqueado (gris) y no puedes completar el pago, incluso con una tarjeta de prueba válida.

## Causas Comunes

### 1. ❌ Campos Incompletos o Inválidos

El botón se desbloquea **solo cuando todos los campos están completos y válidos**:

- ✅ Número de tarjeta completo (16 dígitos)
- ✅ CVV completo (3 dígitos)
- ✅ Fecha de vencimiento seleccionada
- ✅ Nombre del titular completo
- ✅ Documento completo
- ✅ Email válido

### 2. ❌ Datos del Titular Incorrectos

Para que el pago se apruebe en modo prueba, el **nombre del titular** debe ser específico:

- ✅ **`APRO`** → Pago aprobado
- ❌ Cualquier otro nombre → Puede causar problemas

### 3. ❌ Formato de Documento Incorrecto

Para Chile, el documento debe ser:
- Tipo: **"Otro"** (no RUT ni DNI)
- Número: **`123456789`** (9 dígitos)

---

## ✅ Solución Paso a Paso

### Paso 1: Completar TODOS los Campos

1. **Número de tarjeta**: `4168 8188 4444 7115`
   - Debe aparecer completo (16 dígitos)
   - Verifica que no haya espacios extra

2. **CVV**: `123`
   - Debe tener exactamente 3 dígitos

3. **Fecha de vencimiento**: 
   - Mes: `11`
   - Año: `30` (o cualquier año futuro)
   - Debe estar seleccionada, no solo escrita

4. **Nombre del titular**: `APRO` ⚠️ **MUY IMPORTANTE**
   - Debe ser exactamente **`APRO`** (en mayúsculas)
   - Este nombre hace que el pago se apruebe automáticamente
   - No uses tu nombre real ni "Test User"

5. **Documento**:
   - Tipo: **"Otro"** (no RUT, no DNI)
   - Número: `123456789`

6. **Email**: 
   - Debe ser un email válido
   - Puede ser el de tu cuenta de prueba

### Paso 2: Verificar que el Formulario Esté Completo

Antes de que el botón se desbloquee, verifica:

- [ ] El número de tarjeta aparece completo (sin espacios)
- [ ] El CVV tiene 3 dígitos
- [ ] La fecha de vencimiento está seleccionada (no solo escrita)
- [ ] El nombre del titular es exactamente **`APRO`**
- [ ] El documento tiene tipo y número
- [ ] El email está completo

### Paso 3: Esperar Validación

A veces MercadoPago tarda unos segundos en validar los campos. Espera 2-3 segundos después de completar todos los campos.

---

## 🔍 Verificación Visual

El botón "Pagar" debería:
- ❌ **Gris/deshabilitado**: Faltan campos o hay errores
- ✅ **Azul/habilitado**: Todos los campos están completos y válidos

---

## ⚠️ Errores Comunes

### Error 1: "Nombre del titular" con nombre real
- ❌ **Incorrecto**: "Juan Pérez", "Test User", "Marcelo"
- ✅ **Correcto**: `APRO`

### Error 2: Documento tipo incorrecto
- ❌ **Incorrecto**: Tipo "RUT" o "DNI"
- ✅ **Correcto**: Tipo "Otro" con número `123456789`

### Error 3: Fecha de vencimiento no seleccionada
- ❌ **Incorrecto**: Escribir "11/30" manualmente
- ✅ **Correcto**: Seleccionar mes y año desde los dropdowns

### Error 4: CVV incompleto
- ❌ **Incorrecto**: Solo 2 dígitos o vacío
- ✅ **Correcto**: Exactamente 3 dígitos (`123`)

---

## 📋 Checklist Completo

Antes de intentar pagar, verifica:

- [ ] Número de tarjeta: `4168 8188 4444 7115` (completo, 16 dígitos)
- [ ] CVV: `123` (3 dígitos)
- [ ] Fecha de vencimiento: `11/30` (seleccionada desde dropdowns)
- [ ] Nombre del titular: `APRO` (exactamente así, en mayúsculas)
- [ ] Tipo de documento: **"Otro"**
- [ ] Número de documento: `123456789`
- [ ] Email: Completo y válido
- [ ] Estás en modo **"Test"** (aparece en la esquina superior derecha)

---

## 🎯 Datos Exactos para Probar (Chile)

Copia y pega estos datos exactos:

```
Tarjeta: 4168 8188 4444 7115
CVV: 123
Vencimiento: 11/30
Titular: APRO
Documento Tipo: Otro
Documento Número: 123456789
Email: (tu email de prueba)
```

---

## 💡 Si Aún No Funciona

1. **Limpia el caché del navegador** y prueba de nuevo
2. **Prueba en una ventana de incógnito**
3. **Verifica en la consola del navegador** (F12) si hay errores en rojo
4. **Prueba con la tarjeta Mastercard** en lugar de Visa:
   - Número: `5416 7526 0258 2580`
   - Resto de datos igual

---

## 🔴 Errores en la Consola

Si ves errores en la consola del navegador (F12):

- **"No length configuration provided"**: Ignóralo, es solo un warning
- **"invalid property settings"**: Ignóralo, es solo un warning
- **Errores en rojo**: Estos sí son importantes, compártelos

Los warnings amarillos de MercadoPago son normales y no afectan el pago.

---

¿Sigue bloqueado? Verifica especialmente que el **nombre del titular sea exactamente `APRO`** y que el **tipo de documento sea "Otro"**.

