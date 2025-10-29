import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  
  // Supabase puede enviar el token en hash fragment o query params
  const code = requestUrl.searchParams.get("code");
  const accessToken = requestUrl.hash ? new URLSearchParams(requestUrl.hash.substring(1)).get("access_token") : null;
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  // Si hay access_token en el hash (confirmación de email)
  if (accessToken) {
    // Redirigir al dashboard con el hash para que el cliente maneje la sesión
    return NextResponse.redirect(new URL("/dashboard" + requestUrl.hash, requestUrl.origin));
  }

  // Si hay code (flow normal)
  if (code) {
    try {
      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Code exchange error:", error);
        return NextResponse.redirect(new URL("/login?error=auth_error", requestUrl.origin));
      }

      // Successfully exchanged code, redirect to dashboard
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch (err) {
      console.error("Callback error:", err);
      return NextResponse.redirect(new URL("/login?error=callback_error", requestUrl.origin));
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}

