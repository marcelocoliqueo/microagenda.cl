import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Hook para suscribirse a cambios en tiempo real de Supabase
 * 
 * Implementa reintentos inteligentes con backoff exponencial para manejar
 * problemas temporales de conexión sin acumular errores.
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
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const lastErrorRef = useRef<number>(0);
  const isSettingUpRef = useRef(false); // Prevenir múltiples setups simultáneos
  const isDisabledRef = useRef(false); // Marcar como deshabilitado después de múltiples fallos

  // Actualizar la referencia de la función sin causar re-suscripciones
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  // El listener de onAuthStateChange se maneja globalmente en supabaseClient.ts
  // No necesitamos duplicarlo aquí para evitar múltiples listeners

  const cleanupAll = () => {
    // Limpiar timeout de reintento
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    
    // Limpiar canal
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        // Ignorar errores al limpiar
      }
      channelRef.current = null;
    }
    
    isSettingUpRef.current = false;
  };

  useEffect(() => {
    // Limpiar todo inmediatamente cuando cambian las dependencias
    cleanupAll();

    if (!userId) {
      setIsConnected(false);
      return;
    }

    isMountedRef.current = true;
    setIsConnected(false);
    retryCountRef.current = 0;
    lastErrorRef.current = 0;
    isSettingUpRef.current = false;
    isDisabledRef.current = false; // Resetear cuando cambia userId o table

    // Definir setupRealtimeSubscription dentro del useEffect para evitar problemas de closure
    const setupRealtimeSubscription = async () => {
      // Prevenir múltiples setups simultáneos o si está deshabilitado
      if (!isMountedRef.current || !userId || isSettingUpRef.current || isDisabledRef.current) {
        return;
      }

      isSettingUpRef.current = true;
      
      // Limpiar cualquier suscripción o timeout anterior ANTES de crear nueva
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }

      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        } catch (error) {
          // Ignorar errores al limpiar
          channelRef.current = null;
        }
      }

      try {
        // Verificar que hay una sesión activa antes de suscribirse
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (!session || sessionError) {
          console.warn(`⚠️ No hay sesión activa, Realtime para ${table} no se conectará`, sessionError);
          setIsConnected(false);
          isSettingUpRef.current = false;
          return;
        }

        // IMPORTANTE: Configurar el token JWT ANTES de crear cualquier canal
        // El cliente de Supabase necesita este token para autenticar el WebSocket correctamente
        
        // Configurar el token JWT primero
        supabase.realtime.setAuth(session.access_token);
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`🔐 Configurando Realtime para ${table} con token de usuario ${userId?.substring(0, 8)}...`);
        }
        
        // Pequeño delay para asegurar que el token se configure
        await new Promise(resolve => setTimeout(resolve, 100));

        const channel = supabase
          .channel(`${table}_changes_${userId}`, {
            config: {
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
          .subscribe((status, err) => {
            if (!isMountedRef.current) return;
            
            if (status === 'SUBSCRIBED') {
              setIsConnected(true);
              retryCountRef.current = 0;
              lastErrorRef.current = 0;
              isSettingUpRef.current = false;
              
              console.log(`✅ Realtime conectado para ${table}`);
            } else if (status === 'CHANNEL_ERROR') {
              setIsConnected(false);
              isSettingUpRef.current = false;
              
              // Obtener mensaje de error
              const errorMsg = err?.message || err?.toString() || 'Error desconocido';
              
              // Solo mostrar errores si no está deshabilitado
              if (!isDisabledRef.current) {
                console.error(`❌ Error en Realtime para ${table}:`, errorMsg);
              }
              
              // Si el error es que Realtime no está habilitado, no reintentar indefinidamente
              if (errorMsg.includes('Realtime') && errorMsg.includes('disabled')) {
                isDisabledRef.current = true;
                console.warn(`⚠️ Realtime parece estar deshabilitado para ${table}. La app funcionará sin actualizaciones en tiempo real.`);
                return; // No reintentar si está deshabilitado
              }
              
              const now = Date.now();
              if (now - lastErrorRef.current > 5000) {
                lastErrorRef.current = now;
                retryCountRef.current++;
                
                const delay = Math.min(2000 * Math.pow(2, retryCountRef.current - 1), 60000);
                
                if (retryCountRef.current <= 3) {
                  console.log(`🔄 Reintentando conexión Realtime para ${table} en ${delay}ms (intento ${retryCountRef.current}/3)`);
                  retryTimeoutRef.current = setTimeout(() => {
                    if (isMountedRef.current && !isSettingUpRef.current && userId && !isDisabledRef.current) {
                      setupRealtimeSubscription();
                    }
                  }, delay);
                } else {
                  isDisabledRef.current = true;
                  console.warn(`⚠️ Realtime no disponible para ${table} después de 3 intentos. La app funcionará sin actualizaciones en tiempo real. Silenciando errores adicionales.`);
                  // No reintentar más si falla 3 veces consecutivamente
                }
              }
            } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
              setIsConnected(false);
              isSettingUpRef.current = false;
              
              // Solo mostrar warnings si no está deshabilitado
              if (!isDisabledRef.current) {
                console.warn(`⚠️ Realtime ${status.toLowerCase()} para ${table}. Intentando reconectar...`);
              }
              
              const now = Date.now();
              if (now - lastErrorRef.current > 5000 && !isDisabledRef.current) {
                lastErrorRef.current = now;
                retryTimeoutRef.current = setTimeout(() => {
                  if (isMountedRef.current && !isSettingUpRef.current && userId && !isDisabledRef.current) {
                    setupRealtimeSubscription();
                  }
                }, 2000);
              }
            }
          });

        channelRef.current = channel;
        isSettingUpRef.current = false;
      } catch (error: any) {
        setIsConnected(false);
        isSettingUpRef.current = false;
        console.error(`❌ Error al configurar Realtime para ${table}:`, error.message || error);
        
        // Reintentar después de un delay
        const now = Date.now();
        if (now - lastErrorRef.current > 5000) {
          lastErrorRef.current = now;
          retryTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current && !isSettingUpRef.current && userId) {
              setupRealtimeSubscription();
            }
          }, 3000);
        }
      }
    };

    // Usar setTimeout para evitar errores de WebSocket en el render inicial
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current && !isSettingUpRef.current) {
        setupRealtimeSubscription();
      }
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      isMountedRef.current = false;
      setIsConnected(false);
      cleanupAll();
    };
  }, [table, userId]);

  return { isConnected };
}
