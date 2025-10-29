"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * Componente que maneja automáticamente los tokens de autenticación
 * que vienen en el hash fragment (#access_token=...) desde emails de Supabase
 */
export function AuthHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleHashChange = async () => {
      // Verificar si hay un hash en la URL
      const hash = window.location.hash;
      
      if (!hash) return;

      console.log("🔍 AuthHandler: Hash detectado en URL");

      // Parsear los parámetros del hash
      const hashParams = new URLSearchParams(hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const type = hashParams.get("type");

      // Si hay tokens de autenticación en el hash
      if (accessToken && type) {
        console.log("✅ AuthHandler: Tokens de autenticación encontrados, tipo:", type);

        try {
          // Establecer la sesión con los tokens del hash
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || "",
          });

          if (error) {
            console.error("❌ AuthHandler: Error al establecer sesión:", error);
            // Limpiar el hash y mostrar error
            window.location.hash = "";
            router.push("/login?error=session_error");
            return;
          }

          if (data.session) {
            console.log("✅ AuthHandler: Sesión establecida exitosamente para:", data.user?.email);
            
            // Limpiar el hash de la URL
            window.history.replaceState(null, "", window.location.pathname);
            
            // Redirigir al dashboard
            console.log("➡️ AuthHandler: Redirigiendo al dashboard");
            router.push("/dashboard");
            router.refresh();
          }
        } catch (err) {
          console.error("❌ AuthHandler: Error inesperado:", err);
          window.location.hash = "";
          router.push("/login?error=unexpected_error");
        }
      }
    };

    // Ejecutar al montar el componente
    handleHashChange();

    // También escuchar cambios en el hash (por si acaso)
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [router]);

  // Este componente no renderiza nada
  return null;
}

