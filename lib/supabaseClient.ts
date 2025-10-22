import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Missing Supabase environment variables. Please configure .env.local");
}

// Create client with dummy values during build if env vars are missing
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);

// Database types
export type Profile = {
  id: string;
  name: string;
  email: string;
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
