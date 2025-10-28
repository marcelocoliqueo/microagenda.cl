import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/email-confirmed";

  if (code) {
    try {
      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("Code exchange error:", error);
        return NextResponse.redirect(new URL("/login?error=auth_error", requestUrl.origin));
      }

      // Successfully exchanged code, redirect to confirmation page
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    } catch (err) {
      console.error("Callback error:", err);
      return NextResponse.redirect(new URL("/login?error=callback_error", requestUrl.origin));
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(new URL("/login", requestUrl.origin));
}

