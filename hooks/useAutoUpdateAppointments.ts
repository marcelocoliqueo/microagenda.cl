import { useEffect, useRef } from "react";

/**
 * Hook para auto-actualizar estados de citas periódicamente
 *
 * Ejecuta la auto-actualización:
 * 1. Al montar el componente (carga inicial)
 * 2. Cada X minutos mientras el usuario tiene la app abierta
 * 3. Cuando el usuario vuelve a la pestaña (visibility change)
 *
 * @param intervalMinutes - Intervalo en minutos entre actualizaciones (default: 10)
 * @param enabled - Si está habilitado (default: true)
 */
export function useAutoUpdateAppointments(
  intervalMinutes: number = 10,
  enabled: boolean = true
) {
  const lastUpdateRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const runAutoUpdate = async () => {
    try {
      const now = Date.now();

      // Evitar ejecutar múltiples veces muy seguidas
      if (now - lastUpdateRef.current < 60000) {
        console.log("⏭️ Auto-actualización saltada (muy reciente)");
        return;
      }

      lastUpdateRef.current = now;

      console.log("🔄 Ejecutando auto-actualización de citas...");

      const response = await fetch("/api/auto-update-appointments", {
        method: "POST",
      });

      if (!response.ok) {
        console.error("❌ Error en auto-actualización:", response.statusText);
        return;
      }

      const data = await response.json();

      if (data.success && data.updates.total > 0) {
        console.log("✅ Citas actualizadas:", data.updates);

        // Disparar evento personalizado para que otros componentes se actualicen
        window.dispatchEvent(new CustomEvent("appointmentsUpdated", { detail: data.updates }));
      } else if (data.success) {
        console.log("✓ Auto-actualización completada (sin cambios)");
      }
    } catch (error) {
      console.error("❌ Error ejecutando auto-actualización:", error);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // 1. Ejecutar al montar
    runAutoUpdate();

    // 2. Configurar intervalo periódico
    intervalRef.current = setInterval(() => {
      runAutoUpdate();
    }, intervalMinutes * 60 * 1000);

    // 3. Ejecutar cuando el usuario vuelve a la pestaña
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("👁️ Usuario volvió a la pestaña, verificando actualizaciones...");
        runAutoUpdate();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [enabled, intervalMinutes]);

  return { runAutoUpdate };
}
