import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";

export function useRealtime(
  table: string,
  userId: string | null,
  onUpdate: () => void
) {
  useEffect(() => {
    if (!userId) return;

    let channel: RealtimeChannel;

    const setupRealtimeSubscription = async () => {
      try {
        channel = supabase
          .channel(`${table}_changes`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: table,
              filter: `user_id=eq.${userId}`,
            },
            () => {
              onUpdate();
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`✅ Realtime conectado para ${table}`);
            } else if (status === 'CHANNEL_ERROR') {
              console.warn(`⚠️ Error en Realtime para ${table}, continuando sin actualizaciones en tiempo real`);
            }
          });
      } catch (error) {
        // Silenciar errores de WebSocket - la app funciona sin Realtime
        console.warn(`⚠️ No se pudo conectar a Realtime para ${table}, continuando sin actualizaciones en tiempo real`);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [table, userId, onUpdate]);
}
