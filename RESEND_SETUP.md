# 📧 Configuración de Resend para MicroAgenda

## 🚀 Pasos para Configurar Resend

### 1. Crear cuenta en Resend

1. Ve a [https://resend.com](https://resend.com)
2. Crea una cuenta (es gratis hasta 3,000 emails/mes)
3. Verifica tu email

### 2. Obtener API Key

1. Ve a **API Keys** en el dashboard de Resend
2. Click en **Create API Key**
3. Dale un nombre (ej: "MicroAgenda Production")
4. Copia la API key (solo se muestra una vez)

### 3. Configurar Dominio (Opcional pero Recomendado)

Para usar `noreply@microagenda.cl` necesitas verificar tu dominio:

1. Ve a **Domains** en Resend
2. Click en **Add Domain**
3. Ingresa `microagenda.cl`
4. Agrega los registros DNS que Resend te proporciona:
   - **TXT record** para verificación
   - **SPF record** para autenticación
   - **DKIM records** para firma
5. Espera a que se verifique (puede tardar hasta 24 horas)

**Nota**: Mientras verificas el dominio, puedes usar el dominio de prueba de Resend: `onboarding@resend.dev`

### 4. Configurar Variables de Entorno

#### En Desarrollo (`.env.local`):

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### En Vercel (Production):

1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega:
   - `RESEND_API_KEY` = `re_xxxxxxxxxxxxx`
   - `NEXT_PUBLIC_APP_URL` = `https://microagenda.cl`
4. Marca las 3 opciones: Production, Preview, Development
5. Click **Save**

### 5. Verificar Configuración

Una vez configurado, los emails se enviarán automáticamente. Si no hay `RESEND_API_KEY`, los emails se mostrarán en la consola como mock emails (útil para desarrollo).

## 📊 Límites del Plan Gratuito

- **3,000 emails/mes** gratis
- **100 emails/día** gratis
- Después de eso: $20/mes por 50,000 emails

## 🔍 Testing

Para probar sin configurar Resend:
- Los emails se mostrarán en la consola del servidor
- Útil para desarrollo local
- Formato: `📧 [MOCK EMAIL]`

## ✅ Checklist

- [ ] Cuenta de Resend creada
- [ ] API Key obtenida
- [ ] Variable `RESEND_API_KEY` configurada en `.env.local`
- [ ] Variable `RESEND_API_KEY` configurada en Vercel
- [ ] Variable `NEXT_PUBLIC_APP_URL` configurada
- [ ] Dominio verificado (opcional)
- [ ] Probar envío de email de prueba

## 🐛 Troubleshooting

### Error: "Invalid API key"
- Verifica que la API key esté correcta
- Asegúrate de que no tenga espacios extra
- Verifica que esté en las variables de entorno correctas

### Emails no se envían
- Revisa la consola del servidor para errores
- Verifica que `RESEND_API_KEY` esté configurada
- Revisa el dashboard de Resend para logs de envío

### Emails van a spam
- Verifica tu dominio en Resend
- Configura SPF y DKIM correctamente
- Usa un dominio verificado en lugar de `onboarding@resend.dev`

