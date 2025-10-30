import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Hook para suscribirse a cambios en tiempo real de Supabase
 * 
 * Implementa una suscripción simple y robusta siguiendo la documentación oficial
 * de Supabase para Postgres Changes con RLS.
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
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Actualizar la referencia de la función sin causar re-suscripciones
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const cleanup = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        // Ignorar errores al limpiar
      }
      channelRef.current = null;
    }
  };

  useEffect(() => {
    cleanup();

    if (!userId) {
      setIsConnected(false);
      return;
    }

    isMountedRef.current = true;
    setIsConnected(false);

    const setupSubscription = async () => {
      if (!isMountedRef.current || !userId) return;

      try {
        // Verificar sesión
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`⚠️ Sin sesión para Realtime en ${table}`);
          }
          return;
        }

        // Configurar token JWT (requerido para Postgres Changes con RLS)
        supabase.realtime.setAuth(session.access_token);

        // Crear canal según documentación oficial de Supabase
        // No usar presence para Postgres Changes - solo es necesario para Presence/Broadcast
        const channel = supabase
          .channel(`${table}_changes_${userId}`)
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
          .subscribe((status, err) => {
            if (!isMountedRef.current) return;
            
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Realtime conectado para ${table}`);
              }
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false);
              const errorMsg = err?.message || 'Error desconocido';
              console.error(`❌ Error Realtime para ${table}:`, errorMsg);
              
              // Reconectar después de 5 segundos
              if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
              }
              reconnectTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current && userId) {
                  setupSubscription();
                }
              }, 5000);
            } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
              setIsConnected(false);
              if (process.env.NODE_ENV === 'development') {
                console.warn(`⚠️ Realtime ${status.toLowerCase()} para ${table}. Reconectando...`);
              }
              
              // Reconectar después de 2 segundos
              if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
              }
              reconnectTimeoutRef.current = setTimeout(() => {
                if (isMountedRef.current && userId) {
                  setupSubscription();
                }
              }, 2000);
            }
          });

        channelRef.current = channel;
      } catch (error: any) {
        setIsConnected(false);
        console.error(`❌ Error al suscribirse a Realtime para ${table}:`, error.message || error);
        
        // Reconectar después de 3 segundos
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current && userId) {
            setupSubscription();
          }
        }, 3000);
      }
    };

    // Delay inicial para evitar problemas en el render
    const timeoutId = setTimeout(setupSubscription, 100);

    return () => {
      clearTimeout(timeoutId);
      isMountedRef.current = false;
      setIsConnected(false);
      cleanup();
    };
  }, [table, userId]);

  return { isConnected };
}
