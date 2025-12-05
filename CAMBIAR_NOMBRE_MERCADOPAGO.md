# Cómo Cambiar el Nombre del Comercio en MercadoPago

## Problema

En la pantalla de pago de MercadoPago aparece "Huracán Air" en lugar de "MicroAgenda".

## Solución

El nombre del comercio se configura en **MercadoPago Developer**, no en el código. Sigue estos pasos:

### Paso 1: Acceder a la Configuración de la Aplicación

1. Ve a [MercadoPago Developer](https://www.mercadopago.cl/developers)
2. Inicia sesión con tu cuenta
3. Ve a **Tus integraciones** → Selecciona tu aplicación

### Paso 2: Cambiar el Nombre de la Aplicación

1. En la página de detalles de la aplicación, busca la sección **"Información de la aplicación"** o **"Configuración"**
2. Busca el campo **"Nombre de la aplicación"** o **"Nombre del comercio"**
3. Cambia el nombre de "Huracán Air" a **"MicroAgenda"**
4. Guarda los cambios

### Paso 3: Verificar

1. Crea una nueva preferencia de pago (haz click en "Reactivar" nuevamente)
2. El nombre debería aparecer como "MicroAgenda" en la pantalla de pago

## Nota

- El cambio puede tardar unos minutos en reflejarse
- Si no ves la opción de cambiar el nombre, puede ser que necesites verificar tu cuenta de MercadoPago primero
- En algunos casos, el nombre puede estar vinculado a la cuenta de MercadoPago principal, no a la aplicación específica

## Alternativa: Usar Statement Descriptor

Si no puedes cambiar el nombre de la aplicación, puedes usar el campo `statement_descriptor` en la preferencia de pago para que aparezca un nombre diferente en el extracto de la tarjeta del cliente.

Esto ya está implementado en el código, pero el nombre que aparece en la pantalla de pago viene de la configuración de la aplicación.

