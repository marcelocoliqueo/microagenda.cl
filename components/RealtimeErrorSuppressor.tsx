"use client";

import { useEffect } from "react";

/**
 * Componente que silencia los errores de WebSocket de Supabase Realtime
 * que aparecen cuando Realtime no está habilitado o hay problemas de conexión.
 * 
 * Estos errores son esperados y no afectan la funcionalidad de la app,
 * ya que Realtime es completamente opcional.
 */
export function RealtimeErrorSuppressor() {
  useEffect(() => {
    // Guardar el error original de la consola
    const originalError = console.error;
    const originalWarn = console.warn;

    // Interceptar console.error
    console.error = (...args: any[]) => {
      // Convertir todos los argumentos a string para buscar
      const fullMessage = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg?.toString) return arg.toString();
        if (arg?.message) return arg.message;
        if (arg?.stack) return arg.stack;
        if (arg?.error?.message) return arg.error.message;
        return String(arg);
      }).join(' ').toLowerCase();
      
      // Silenciar errores relacionados con WebSocket de Supabase Realtime
      // También captura errores de conexión, timeouts, etc.
      const isRealtimeError = 
        (fullMessage.includes("websocket") || 
         fullMessage.includes("websocket connection") ||
         fullMessage.includes("failed to connect") ||
         fullMessage.includes("connection failed") ||
         fullMessage.includes("createwebsocket")) &&
        (fullMessage.includes("supabase") || 
         fullMessage.includes("realtime") ||
         fullMessage.includes("/realtime/v1/websocket") ||
         fullMessage.includes("/realtime/v1") ||
         fullMessage.includes("wss://") ||
         fullMessage.includes("kfqdjwlvrtpqmeqzsaou")); // Tu project ID
      
      if (isRealtimeError) {
        // Error silenciado - Realtime manejará los reintentos automáticamente
        return;
      }

      // Pasar todos los demás errores normalmente
      originalError.apply(console, args);
    };

    // Interceptar console.warn para mensajes relacionados con Realtime
    console.warn = (...args: any[]) => {
      const warnMessage = args[0]?.toString() || "";
      
      // Silenciar warnings relacionados con Realtime si son esperados
      if (
        warnMessage.includes("Realtime") &&
        warnMessage.includes("continuando sin actualizaciones")
      ) {
        // Warning silenciado - es informativo, no un error real
        return;
      }

      // Pasar todos los demás warnings normalmente
      originalWarn.apply(console, args);
    };

    // También interceptar eventos de error global para WebSocket
    const handleError = (event: ErrorEvent) => {
      const errorMessage = (
        event.message || 
        event.filename || 
        (event.error?.message) ||
        (event.error?.toString?.()) ||
        ""
      ).toLowerCase();
      
      const isRealtimeError = 
        (errorMessage.includes("websocket") || 
         errorMessage.includes("websocket connection") ||
         errorMessage.includes("failed to connect") ||
         errorMessage.includes("connection failed") ||
         errorMessage.includes("createwebsocket") ||
         errorMessage.includes("wss://")) &&
        (errorMessage.includes("supabase") || 
         errorMessage.includes("realtime") ||
         errorMessage.includes("/realtime/v1") ||
         errorMessage.includes("kfqdjwlvrtpqmeqzsaou"));
      
      if (isRealtimeError) {
        // Prevenir que el error aparezca en la consola
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return false;
      }
    };

    // Interceptar errores no capturados (con capture para interceptar antes)
    window.addEventListener("error", handleError, true);
    
    // También interceptar promesas rechazadas relacionadas con WebSocket
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = (
        event.reason?.toString?.() || 
        event.reason?.message ||
        String(event.reason)
      ).toLowerCase();
      
      if (
        (reason.includes("websocket") ||
         reason.includes("websocket connection") ||
         reason.includes("failed to connect") ||
         reason.includes("connection failed")) &&
        (reason.includes("supabase") || 
         reason.includes("realtime") ||
         reason.includes("kfqdjwlvrtpqmeqzsaou"))
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Limpiar al desmontar
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener("error", handleError, true);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  // Este componente no renderiza nada
  return null;
}
