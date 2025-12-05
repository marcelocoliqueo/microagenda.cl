# Cómo Cambiar el Nombre del Comercio en MercadoPago

## Problema

En la pantalla de pago de MercadoPago aparece "Huracán Air" en lugar de "MicroAgenda".

## ⚠️ Importante

El nombre que aparece en la **pantalla de pago** viene de la **configuración de la aplicación en MercadoPago Developer**, NO del código. El `statement_descriptor` que agregamos solo afecta el extracto de la tarjeta del cliente.

## Solución: Cambiar en MercadoPago Developer

### Paso 1: Acceder a la Configuración

1. Ve a [MercadoPago Developer](https://www.mercadopago.cl/developers)
2. Inicia sesión con tu cuenta
3. Click en **"Tus integraciones"** (arriba a la derecha)
4. Selecciona tu aplicación (la que tiene Application ID: `4223690054220076`)

### Paso 2: Editar la Aplicación

1. En la página de detalles de la aplicación, busca el botón **"Editar aplicación"** o **"Editar"**
2. En la sección **"Configuraciones básicas"**, busca:
   - **"Nombre de la aplicación"**: Debería decir "Microagenda" (ya lo cambiaste)
   - **"Nombre corto"**: Este es el que aparece en la pantalla de pago. Cambia "Huracán Air" a **"MicroAgenda"**
3. **Guarda los cambios** (botón "Guardar cambios" al final de la página)

### Paso 3: Verificar

1. Espera 2-3 minutos para que el cambio se propague
2. Crea una nueva preferencia de pago (haz click en "Reactivar" nuevamente)
3. El nombre debería aparecer como "MicroAgenda" en la pantalla de pago

## Si No Puedes Cambiar el Nombre

Si el campo "Nombre corto" está deshabilitado o no puedes editarlo:

1. **Verifica tu cuenta de MercadoPago**:
   - Ve a [mercadopago.cl](https://www.mercadopago.cl)
   - Verifica que tu cuenta esté completamente verificada
   - Completa todos los datos de perfil si faltan

2. **Contacta a Soporte de MercadoPago**:
   - Explica que necesitas cambiar el nombre del comercio que aparece en la pantalla de pago
   - Menciona que actualmente aparece "Huracán Air" y quieres que aparezca "MicroAgenda"
   - Proporciona el Application ID: `4223690054220076`

## Nota sobre Statement Descriptor

El `statement_descriptor: "MicroAgenda"` que agregamos en el código:
- ✅ **SÍ afecta**: El extracto de la tarjeta del cliente (lo que aparece en el resumen de la tarjeta)
- ❌ **NO afecta**: El nombre que aparece en la pantalla de pago de MercadoPago

El nombre en la pantalla de pago **solo** se puede cambiar desde la configuración de la aplicación en MercadoPago Developer.

