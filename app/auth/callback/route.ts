import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            // No podemos setear cookies en un GET, pero lo manejaremos en el cliente
          },
          remove(name: string, options: any) {
            // No podemos remover cookies en un GET
          },
        },
      }
    );

    try {
      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error("❌ Code exchange error:", error);
        return NextResponse.redirect(new URL("/login?error=auth_error", requestUrl.origin));
      }

      if (data.session) {
        console.log("✅ Session created successfully for:", data.user?.email);
        
        // Crear la respuesta de redirección al dashboard
        const response = NextResponse.redirect(new URL(next, requestUrl.origin));
        
        // Setear cookies de sesión
        const { access_token, refresh_token } = data.session;
        
        response.cookies.set('sb-access-token', access_token, {
          path: '/',
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7, // 7 días
        });
        
        if (refresh_token) {
          response.cookies.set('sb-refresh-token', refresh_token, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 días
          });
        }
        
        return response;
      }

      console.error("❌ No session created");
      return NextResponse.redirect(new URL("/login?error=no_session", requestUrl.origin));
    } catch (err) {
      console.error("❌ Callback error:", err);
      return NextResponse.redirect(new URL("/login?error=callback_error", requestUrl.origin));
    }
  }

  // No code provided, redirect to email-confirmed for client-side handling
  console.log("⚠️ No code provided, redirecting to email-confirmed");
  return NextResponse.redirect(new URL("/email-confirmed", requestUrl.origin));
}

