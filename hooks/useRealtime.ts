import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";

// Realtime es completamente opcional - la app funciona sin él
// Los errores de WebSocket son esperados si Realtime no está habilitado en Supabase
export function useRealtime(
  table: string,
  userId: string | null,
  onUpdate: () => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (!userId) return;

    isMountedRef.current = true;

    const setupRealtimeSubscription = () => {
      try {
        const channel = supabase
          .channel(`${table}_changes_${Date.now()}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: table,
              filter: `user_id=eq.${userId}`,
            },
            () => {
              if (isMountedRef.current) {
                onUpdate();
              }
            }
          )
          .subscribe((status) => {
            if (!isMountedRef.current) return;
            
            if (status === 'SUBSCRIBED') {
              if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Realtime conectado para ${table}`);
              }
            }
            // Todos los demás estados (ERROR, TIMED_OUT, CLOSED) son esperados
            // si Realtime no está habilitado en el proyecto de Supabase
            // La app continúa funcionando normalmente sin actualizaciones en tiempo real
          });

        channelRef.current = channel;
      } catch (error) {
        // Error silenciado - Realtime es opcional
      }
    };

    // Usar setTimeout para evitar errores de WebSocket en el render inicial
    const timeoutId = setTimeout(setupRealtimeSubscription, 0);

    return () => {
      clearTimeout(timeoutId);
      isMountedRef.current = false;
      
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          // Ignorar errores al limpiar
        }
        channelRef.current = null;
      }
    };
  }, [table, userId, onUpdate]);
}
