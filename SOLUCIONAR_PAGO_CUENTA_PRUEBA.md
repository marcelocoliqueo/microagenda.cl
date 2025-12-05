# Solucionar: No Puedo Pagar con Cuenta de Prueba de MercadoPago

## Problema

Tienes una cuenta de prueba de MercadoPago con saldo, pero no te deja pagar.

## Soluciones

### ✅ Solución 1: Usar Tarjeta de Prueba (Recomendado)

**El saldo de la cuenta de prueba puede no funcionar directamente.** Es mejor usar tarjetas de prueba:

1. En la pantalla de pago de MercadoPago, **NO uses "Dinero disponible"**
2. En su lugar, haz click en **"Elegir otro medio de pago"**
3. Selecciona **"Tarjeta de crédito"** o **"Tarjeta de débito"**
4. Usa una de estas tarjetas de prueba para **Chile**:

#### Tarjeta Visa (Pago Aprobado)
- **Número**: `4168 8188 4444 7115`
- **CVV**: `123`
- **Fecha de vencimiento**: `11/30` (o cualquier fecha futura)
- **Titular**: `APRO` ⚠️ **IMPORTANTE**: Este nombre hace que el pago se apruebe
- **Documento**: `123456789` (tipo: "otro")
- **Email**: Tu email de la cuenta de prueba

#### Tarjeta Mastercard (Pago Aprobado)
- **Número**: `5416 7526 0258 2580`
- **CVV**: `123`
- **Fecha de vencimiento**: `11/30`
- **Titular**: `APRO`
- **Documento**: `123456789`
- **Email**: Tu email de la cuenta de prueba

---

### ✅ Solución 2: Verificar Tipo de Cuenta de Prueba

La cuenta de prueba debe ser del tipo **"Comprador"** para poder hacer pagos:

1. Ve a [MercadoPago Developer](https://www.mercadopago.cl/developers)
2. **Tus integraciones** → Tu aplicación → **Cuentas de prueba**
3. Verifica que la cuenta que estás usando sea tipo **"Comprador"**
4. Si es tipo **"Vendedor"**, necesitas crear una cuenta **"Comprador"** nueva

---

### ✅ Solución 3: Verificar que Estés en Modo Prueba

1. En la pantalla de pago, verifica que diga **"Test"** en la esquina superior derecha
2. Si no dice "Test", puede ser que estés usando credenciales de producción
3. Verifica en Vercel que `MERCADOPAGO_ACCESS_TOKEN` empiece con `TEST-` (no `APP-`)

---

### ✅ Solución 4: Verificar Saldo de la Cuenta de Prueba

Si quieres usar el saldo disponible:

1. Ve a [MercadoPago Developer](https://www.mercadopago.cl/developers)
2. **Tus integraciones** → Tu aplicación → **Cuentas de prueba**
3. Busca tu cuenta de prueba
4. Click en los **3 puntos** → **Editar datos**
5. Verifica que tenga saldo suficiente (más de $8.500 CLP)
6. Si no tiene suficiente, agrega más dinero ficticio

**Nota**: A veces el saldo disponible no funciona en modo prueba. Es más confiable usar tarjetas de prueba.

---

### ✅ Solución 5: Verificar País de la Cuenta

La cuenta de prueba **Comprador** y **Vendedor** deben ser del **mismo país** (Chile en tu caso):

1. Verifica que ambas cuentas sean de Chile
2. Si una es de otro país, crea nuevas cuentas del mismo país

---

## ⚠️ Problemas Comunes

### "No se puede procesar el pago"
- **Causa**: Puede ser que el saldo disponible no funcione en modo prueba
- **Solución**: Usa una tarjeta de prueba en lugar del saldo disponible

### "Error al validar el pago"
- **Causa**: Puede ser que la cuenta de prueba no esté correctamente configurada
- **Solución**: Crea una nueva cuenta de prueba tipo "Comprador" y prueba de nuevo

### El botón "Pagar" está deshabilitado
- **Causa**: Puede faltar información o el método de pago no está disponible
- **Solución**: 
  1. Verifica que todos los campos estén completos
  2. Cambia a usar tarjeta de prueba en lugar de dinero disponible

---

## 🎯 Recomendación

**Para pruebas, siempre usa tarjetas de prueba en lugar del saldo disponible.** Las tarjetas de prueba son más confiables y te permiten probar diferentes escenarios (pago aprobado, rechazado, pendiente, etc.).

---

## 📋 Checklist de Verificación

- [ ] Cuenta de prueba es tipo **"Comprador"**
- [ ] Cuenta de prueba es del mismo país que la cuenta vendedor (Chile)
- [ ] Estás en modo **"Test"** (aparece en la pantalla de pago)
- [ ] `MERCADOPAGO_ACCESS_TOKEN` empieza con `TEST-` en Vercel
- [ ] Estás usando una **tarjeta de prueba** (no solo saldo disponible)
- [ ] El titular de la tarjeta es **`APRO`** para que se apruebe el pago

---

¿Sigue sin funcionar? Prueba con una tarjeta de prueba usando los datos de arriba. Es la forma más confiable de probar pagos en MercadoPago.

