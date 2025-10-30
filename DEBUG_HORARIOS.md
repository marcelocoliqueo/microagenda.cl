# Debug: Horarios Disponibles

## Problema
Los horarios disponibles no coinciden con los bloques configurados en disponibilidad.

## Verificación Necesaria

1. **Formato de guardado en BD:**
   - Se guarda: `start_time: "09:00:00"`, `end_time: "18:00:00"`
   
2. **Formato de lectura:**
   - Se lee: `substring(0, 5)` → `"09:00"` a `"18:00"`
   
3. **Generación de slots:**
   - `generateAvailableSlots` debería generar slots cada 30 min desde 09:00 hasta 17:30 (sin incluir 18:00)
   
4. **Posibles problemas:**
   - Los horarios ocupados podrían no coincidir en formato
   - Podría haber slots duplicados
   - La validación de serviceDuration podría estar eliminando slots válidos
   - Los bloques podrían estar siendo procesados incorrectamente

