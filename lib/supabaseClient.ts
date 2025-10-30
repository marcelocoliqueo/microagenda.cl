import { createClient, SupabaseClientOptions } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Missing Supabase environment variables. Please configure .env.local");
}

// Configuración de Realtime optimizada para conexiones estables
const realtimeOptions: SupabaseClientOptions<"public">["realtime"] = {
  params: {
    eventsPerSecond: 10,
  },
  // Habilitar logging para debugging (solo en desarrollo)
  log_level: process.env.NODE_ENV === 'development' ? 'info' : 'error',
};

// Silenciar errores de WebSocket en producción si Realtime no está disponible
// Estos errores son normales si Realtime no se puede conectar y la app funciona sin él
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  let wsErrorSuppressed = false;
  const originalError = console.error;
  console.error = function(...args: any[]) {
    const message = args.join(' ');
    // Solo suprimir errores de WebSocket de Supabase Realtime
    if (message.includes('WebSocket connection') && message.includes('supabase.co/realtime')) {
      if (!wsErrorSuppressed) {
        // Dejar pasar el primer error para diagnóstico, luego silenciar
        wsErrorSuppressed = true;
        originalError.apply(console, args);
      }
      // Silenciar errores subsecuentes
      return;
    }
    originalError.apply(console, args);
  };
}

// Create client with dummy values during build if env vars are missing
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
  {
    realtime: realtimeOptions,
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

// Configurar el token de Realtime automáticamente cuando hay una sesión activa
// Esto se ejecuta una vez al cargar el módulo, antes de cualquier uso de Realtime
if (typeof window !== 'undefined') {
  // Esperar a que el DOM esté listo y configurar el token si hay sesión
  const initRealtimeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        // Configurar el token sin cerrar conexiones existentes
        // El cliente de Supabase manejará la reconexión automáticamente
        supabase.realtime.setAuth(session.access_token);
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 Token de Realtime configurado al inicializar cliente');
        }
      }
    } catch (error) {
      // Ignorar errores en la inicialización
    }
  };
  
  // Ejecutar después de que el cliente esté listo
  setTimeout(initRealtimeAuth, 100);
  
  // También escuchar cambios de autenticación para actualizar el token
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.access_token && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
      // Actualizar el token - el cliente manejará la reconexión
      supabase.realtime.setAuth(session.access_token);
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Token de Realtime actualizado por cambio de autenticación');
      }
    }
  });
}

// Database types
export type Profile = {
  id: string;
  name: string;
  email: string;
  username: string | null;
  whatsapp: string | null;
  photo_url: string | null;
  auto_confirm: boolean;
  business_name: string | null;
  bio: string | null;
  subscription_status: string;
  current_plan_id: string | null;
  created_at: string;
};

export type Service = {
  id: string;
  user_id: string;
  name: string;
  duration: number;
  price: number;
  created_at: string;
};

export type Appointment = {
  id: string;
  user_id: string;
  client_name: string;
  client_phone: string;
  service_id: string;
  date: string;
  time: string;
  status: string;
  created_at: string;
  service?: Service;
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  is_active: boolean;
  created_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  mercadopago_id: string | null;
  status: string;
  start_date: string;
  end_date: string | null;
  renewal_date: string | null;
  trial: boolean;
  created_at: string;
};
