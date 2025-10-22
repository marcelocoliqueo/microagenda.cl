import { supabase } from "./supabaseClient";

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user || null;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return { authorized: false, user: null, profile: null };
  }

  const profile = await getProfile(user.id);
  if (!profile) {
    return { authorized: false, user, profile: null };
  }

  return { authorized: true, user, profile };
}

export async function requireSubscription() {
  const auth = await requireAuth();
  if (!auth.authorized || !auth.profile) {
    return { authorized: false, hasSubscription: false };
  }

  // Check if user has active subscription or is in trial
  const hasActiveSubscription =
    auth.profile.subscription_status === "active" ||
    auth.profile.subscription_status === "trial";

  return {
    authorized: true,
    hasSubscription: hasActiveSubscription,
    user: auth.user,
    profile: auth.profile,
  };
}
