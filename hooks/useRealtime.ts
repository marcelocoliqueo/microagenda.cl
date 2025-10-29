import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Hook para suscribirse a cambios en tiempo real de Supabase
 * 
 * IMPORTANTE: Para que funcione, Realtime debe estar habilitado en tu proyecto de Supabase:
 * 1. Ve a tu Dashboard de Supabase
 * 2. Settings > Database > Replication
 * 3. Asegúrate de que "Realtime" esté habilitado
 * 
 * Si no está habilitado, la app funcionará normalmente pero sin actualizaciones en tiempo real.
 * Los errores de WebSocket son silenciados si Realtime no está disponible.
 */
export function useRealtime(
  table: string,
  userId: string | null,
  onUpdate: () => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const isMountedRef = useRef(true);
  const onUpdateRef = useRef(onUpdate);
  const [isConnected, setIsConnected] = useState(false);

  // Actualizar la referencia de la función sin causar re-suscripciones
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!userId) {
      setIsConnected(false);
      return;
    }

    isMountedRef.current = true;
    setIsConnected(false);

    // Limpiar canal anterior si existe
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        // Ignorar errores al limpiar
      }
      channelRef.current = null;
    }

    const setupRealtimeSubscription = () => {
      try {
        const channel = supabase
          .channel(`${table}_changes_${userId}`, {
            config: {
              // Configuración para manejar errores silenciosamente
              presence: {
                key: userId,
              },
            },
          })
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
                onUpdateRef.current();
              }
            }
          )
          .subscribe((status) => {
            if (!isMountedRef.current) return;
            
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Realtime conectado para ${table}`);
              }
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              setIsConnected(false);
              // Los errores son esperados si Realtime no está habilitado
              // La app continúa funcionando normalmente sin actualizaciones en tiempo real
            }
          });

        channelRef.current = channel;
      } catch (error: any) {
        // Error silenciado - Realtime es opcional
        setIsConnected(false);
        // Solo loggear en desarrollo si es un error no esperado
        if (process.env.NODE_ENV === 'development' && 
            !error?.message?.includes('WebSocket') && 
            !error?.message?.includes('realtime')) {
          console.warn(`⚠️ Error al configurar Realtime para ${table}:`, error);
        }
      }
    };

    // Usar setTimeout para evitar errores de WebSocket en el render inicial
    const timeoutId = setTimeout(setupRealtimeSubscription, 100);

    return () => {
      clearTimeout(timeoutId);
      isMountedRef.current = false;
      setIsConnected(false);
      
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (error) {
          // Ignorar errores al limpiar
        }
        channelRef.current = null;
      }
    };
  }, [table, userId]); // Removido onUpdate de las dependencias

  return { isConnected };
}
