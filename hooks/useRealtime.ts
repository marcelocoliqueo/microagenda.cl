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
  const isSettingUpRef = useRef(false);

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
        const channel = channelRef.current;
        // NO llamar unsubscribe() - removeChannel() ya maneja todo el cleanup
        // Llamar unsubscribe() antes de removeChannel() causa un ciclo infinito
        supabase.removeChannel(channel);
      } catch (error) {
        // Ignorar errores al limpiar
      }
      channelRef.current = null;
    }
    isSettingUpRef.current = false;
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
      // Evitar múltiples configuraciones simultáneas
      if (isSettingUpRef.current || !isMountedRef.current || !userId) {
        return;
      }

      isSettingUpRef.current = true;

      try {
        // Verificar sesión
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError || !isMountedRef.current) {
          isSettingUpRef.current = false;
          if (process.env.NODE_ENV === 'development') {
            console.warn(`⚠️ Sin sesión para Realtime en ${table}`);
          }
          return;
        }

        // Asegurar que el token está configurado ANTES de crear el canal
        // Esto es crítico: el token se envía en el mensaje phx_join
        supabase.realtime.setAuth(session.access_token);

        // Esperar un momento para que el token se propague
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!isMountedRef.current) {
          isSettingUpRef.current = false;
          return;
        }

        // Crear canal único por tabla y usuario
        const channelName = `${table}_changes_${userId}_${Date.now()}`;
        const channel = supabase
          .channel(channelName)
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
              isSettingUpRef.current = false;
              if (process.env.NODE_ENV === 'development') {
                console.log(`✅ Realtime conectado para ${table}`);
              }
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false);
              isSettingUpRef.current = false;
              retryCountRef.current += 1;
              
              // Solo intentar reconectar si no hemos excedido el límite de reintentos
              if (retryCountRef.current <= MAX_RETRIES) {
                // Limpiar canal anterior antes de reconectar (guardar referencia primero)
                const oldChannel = channelRef.current;
                channelRef.current = null;
                
                // Remover canal después de un tick para evitar conflictos
                setTimeout(() => {
                  if (oldChannel) {
                    try {
                      supabase.removeChannel(oldChannel);
                    } catch (e) {
                      // Ignorar errores
                    }
                  }
                }, 0);
                
                // Reconectar después de 5 segundos solo si aún está montado
                if (isMountedRef.current && !reconnectTimeoutRef.current) {
                  reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectTimeoutRef.current = null;
                    if (isMountedRef.current && userId) {
                      setupSubscription();
                    }
                  }, 5000);
                }
              } else {
                // Después de MAX_RETRIES, dejar de intentar y silenciar errores
                if (process.env.NODE_ENV === 'development') {
                  console.warn(`⚠️ Realtime no disponible para ${table} después de ${MAX_RETRIES} intentos. Continuando sin actualizaciones en tiempo real.`);
                }
                channelRef.current = null;
              }
            } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
              setIsConnected(false);
              isSettingUpRef.current = false;
              retryCountRef.current += 1;
              
              // Solo intentar reconectar si no hemos excedido el límite de reintentos
              if (retryCountRef.current <= MAX_RETRIES) {
                // Limpiar canal anterior antes de reconectar (guardar referencia primero)
                const oldChannel = channelRef.current;
                channelRef.current = null;
                
                // Remover canal después de un tick para evitar conflictos
                setTimeout(() => {
                  if (oldChannel) {
                    try {
                      supabase.removeChannel(oldChannel);
                    } catch (e) {
                      // Ignorar errores
                    }
                  }
                }, 0);
                
                // Reconectar después de 2 segundos solo si aún está montado
                if (isMountedRef.current && !reconnectTimeoutRef.current) {
                  reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectTimeoutRef.current = null;
                    if (isMountedRef.current && userId) {
                      setupSubscription();
                    }
                  }, 2000);
                }
              } else {
                // Después de MAX_RETRIES, dejar de intentar y silenciar errores
                if (process.env.NODE_ENV === 'development') {
                  console.warn(`⚠️ Realtime no disponible para ${table} después de ${MAX_RETRIES} intentos. Continuando sin actualizaciones en tiempo real.`);
                }
                channelRef.current = null;
              }
            }
          });

        channelRef.current = channel;
      } catch (error: any) {
        setIsConnected(false);
        isSettingUpRef.current = false;
        console.error(`❌ Error al suscribirse a Realtime para ${table}:`, error.message || error);
        
        // Reconectar después de 3 segundos solo si aún está montado
        if (isMountedRef.current && userId && !reconnectTimeoutRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            if (isMountedRef.current && userId) {
              setupSubscription();
            }
          }, 3000);
        }
      }
    };

    // Delay inicial para asegurar que todo esté listo
    const timeoutId = setTimeout(() => {
      setupSubscription();
    }, 200);

    return () => {
      clearTimeout(timeoutId);
      isMountedRef.current = false;
      setIsConnected(false);
      cleanup();
    };
  }, [table, userId]);

  return { isConnected };
}
