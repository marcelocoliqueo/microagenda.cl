# Configurar URLs de Redireccionamiento en MercadoPago

## ¿Es Necesario?

**No es estrictamente necesario** porque ya estamos configurando las URLs en cada preferencia de pago (`back_urls`), pero es **recomendado** como respaldo y buena práctica.

## URLs a Configurar

En la sección **"URLs de redireccionamiento"** de tu aplicación en MercadoPago Developer, agrega estas URLs:

### URLs de Éxito (Success)
```
https://microagenda.cl/dashboard?payment=success
```

### URLs de Fallo (Failure)
```
https://microagenda.cl/dashboard?payment=failure
```

### URLs Pendientes (Pending)
```
https://microagenda.cl/dashboard?payment=pending
```

## ¿Qué Hace Cada URL?

1. **Success**: Después de un pago exitoso, el usuario es redirigido aquí
2. **Failure**: Si el pago es rechazado, el usuario es redirigido aquí
3. **Pending**: Si el pago queda pendiente, el usuario es redirigido aquí

## Nota Importante

- Estas URLs son **valores por defecto** que MercadoPago usará si no especificamos `back_urls` en la preferencia
- Como **ya estamos especificando** `back_urls` en cada preferencia de pago (en el código), estas URLs de la aplicación son un respaldo
- Es buena práctica tenerlas configuradas por si acaso

## Verificación

Después de configurar:
1. Haz una prueba de pago
2. Completa el pago (o cancélalo)
3. Verifica que te redirija correctamente a `/dashboard?payment=success` (o `failure`)

## URLs Actuales en el Código

El código ya está configurado para usar estas URLs automáticamente:

```typescript
back_urls: {
  success: `${APP_URL}/dashboard?payment=success`,
  failure: `${APP_URL}/dashboard?payment=failure`,
  pending: `${APP_URL}/dashboard?payment=pending`,
}
```

Donde `APP_URL` es `https://microagenda.cl` en producción.

---

**Conclusión**: Configúralas como respaldo, pero el sistema funcionará correctamente aunque no las configures porque ya las especificamos en cada preferencia.

