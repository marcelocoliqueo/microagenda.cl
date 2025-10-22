import { useState, useEffect } from "react";
import { supabase, type Subscription } from "@/lib/supabaseClient";

export function useSubscription(userId: string | null) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchSubscription();
  }, [userId]);

  async function fetchSubscription() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId!)
        .eq("status", "active")
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      setSubscription(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    subscription,
    loading,
    error,
    refresh: fetchSubscription,
  };
}
