# 🔧 Instrucciones para Aplicar Migración de Username

## ⚠️ IMPORTANTE - Leer Antes de Usar el Dashboard

Para que funcione correctamente la funcionalidad de **nombres de usuario personalizados** y **enlaces públicos**, necesitas aplicar una migración en la base de datos de Supabase.

---

## 📋 Pasos a Seguir

### 1️⃣ Accede a Supabase

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto de MicroAgenda
3. En el menú lateral, haz clic en **"SQL Editor"**

### 2️⃣ Ejecuta la Migración

1. Copia TODO el contenido del archivo `supabase_add_username.sql` (está en la raíz del proyecto)
2. Pégalo en el editor SQL de Supabase
3. Haz clic en **"Run"** (botón verde)
4. Espera a que se complete (debería decir "Success")

### 3️⃣ Verificación

Para verificar que la migración se aplicó correctamente:

```sql
-- Ejecuta esta consulta en el SQL Editor:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'username';
```

Deberías ver:
- **column_name**: `username`
- **data_type**: `text`

---

## 🎯 ¿Qué Hace Esta Migración?

La migración agrega:

1. ✅ Campo `username` en la tabla `profiles`
2. ✅ Constraint de unicidad (cada username es único)
3. ✅ Validación de formato (solo minúsculas, números, guiones y guiones bajos)
4. ✅ Índice para búsquedas rápidas
5. ✅ Función auxiliar para generar usernames sugeridos

---

## 💡 Cómo Funciona Ahora

### ANTES (sin migración):
- ❌ El enlace se generaba automáticamente desde el email
- ❌ No se podía personalizar
- ❌ Formato: `microagenda.cl/u/usuario@gmail`

### DESPUÉS (con migración):
- ✅ Configuras tu propio username
- ✅ URL limpia y profesional
- ✅ Formato: `microagenda.cl/u/tu-nombre`
- ✅ Puedes editarlo cuando quieras

---

## 🚀 Uso en el Dashboard

Una vez aplicada la migración:

1. **Primera vez**: Verás un mensaje pidiendo configurar tu username
2. **Configurar**: Haz clic en "Configurar Ahora"
3. **Elige**: Ingresa tu nombre de usuario deseado
4. **Reglas**:
   - Solo minúsculas
   - Números permitidos
   - Guiones (-) y guiones bajos (_) permitidos
   - Sin espacios ni caracteres especiales
5. **Ejemplos válidos**:
   - `juan-perez`
   - `clinica-luz`
   - `dr_martinez`
   - `consultora2024`

---

## 🔗 Copiar Enlace

Una vez configurado tu username:
- Verás tu enlace público completo
- Botón "Copiar Enlace" funcional
- Botón "Editar" para cambiar tu username cuando quieras

---

## ⚠️ Problemas Comunes

### "El nombre de usuario ya está en uso"
**Solución**: Alguien más ya lo tiene. Prueba con otro nombre o agrega números (ej: `juan-perez-2`)

### "No puedo guardar el username"
**Posibles causas**:
1. No aplicaste la migración → Aplícala siguiendo los pasos arriba
2. Usaste caracteres no permitidos → Solo minúsculas, números, `-` y `_`
3. Dejaste el campo vacío → Ingresa al menos 3 caracteres

### "El enlace público no funciona"
**Solución**: 
1. Verifica que configuraste tu username
2. Comparte el enlace COMPLETO incluyendo `https://`
3. Ejemplo correcto: `https://microagenda.cl/u/tu-nombre`

---

## 🎨 Personalización Adicional

Recuerda que también puedes:
- Cambiar el color de marca (8 opciones disponibles)
- Configurar servicios y precios
- Definir horarios de atención
- Todo desde la página de **Configuración** en el dashboard

---

## 📞 Soporte

Si tienes problemas aplicando la migración:
1. Verifica que copiaste TODO el contenido del archivo `.sql`
2. Asegúrate de estar en el proyecto correcto de Supabase
3. Si el error persiste, contacta a soporte con el mensaje de error exacto

---

## ✅ Checklist de Deployment

Antes de usar la plataforma:

- [ ] Migración de username aplicada en Supabase
- [ ] Username configurado en tu perfil
- [ ] Al menos 1 servicio creado
- [ ] Horarios de atención configurados
- [ ] Enlace público probado y funcionando

---

**¡Listo!** Una vez completados estos pasos, tu plataforma de agendamiento estará 100% funcional 🎉

