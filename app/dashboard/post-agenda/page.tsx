"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Download, Share2, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { downloadImage } from "./utils/downloadImage";
import { sharePost } from "./utils/sharePost";
import { useAgendaSnapshot } from "./hooks/useAgendaSnapshot";
import { AgendaPreviewCard } from "./components/AgendaPreviewCard";
import { StyleControls } from "./components/StyleControls";
import { UploadBackground } from "./components/UploadBackground";

export default function PostAgendaPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estado de personalización
  const [primaryColor, setPrimaryColor] = useState("#10B981");
  const [fontFamily, setFontFamily] = useState("Inter");
  const [bookedEmoji, setBookedEmoji] = useState("❌");
  const [footerText, setFooterText] = useState("¡Reserva tu cita ahora! 📅");
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null);

  // Hook para obtener disponibilidad
  const { weekSchedule, weekStartDate, loading: loadingSchedule } = useAgendaSnapshot(user?.id);

  useEffect(() => {
    checkAuth();
  }, []);

  // Cargar perfil y fondo al iniciar
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchBackground();
    }
  }, [user?.id]);

  // Aplicar color de marca del perfil
  useEffect(() => {
    if (profile?.brand_color) {
      const colorMap: Record<string, string> = {
        emerald: "#10B981",
        blue: "#3B82F6",
        purple: "#8B5CF6",
        pink: "#EC4899",
        orange: "#F97316",
        rose: "#F43F5E",
        cyan: "#06B6D4",
        amber: "#F59E0B",
      };
      const color = colorMap[profile.brand_color] || colorMap.emerald;
      setPrimaryColor(color);
    }
  }, [profile?.brand_color]);

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);
    } catch (error: any) {
      console.error("Auth check error:", error);
      toast({
        title: "Error",
        description: "No se pudo verificar la autenticación",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile() {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error("Error fetching profile:", error);
    }
  }

  async function fetchBackground() {
    if (!user?.id) return;

    try {
      const filePath = `user_${user.id}.jpg`;
      const { data } = supabase.storage
        .from("post_backgrounds")
        .getPublicUrl(filePath);

      // Verificar si el archivo existe haciendo una petición HEAD
      const response = await fetch(data.publicUrl, { method: "HEAD" });
      if (response.ok) {
        setBackgroundUrl(data.publicUrl);
      }
    } catch (error) {
      // Si no existe, no hacer nada
      console.log("No hay fondo personalizado");
    }
  }

  async function handleDownload() {
    try {
      const result = await downloadImage("agenda-preview-card", "agenda-semanal.png");
      
      if (result.success) {
        toast({
          title: "¡Descargado!",
          description: "La imagen se ha descargado correctamente",
        });
      } else {
        throw new Error(result.error || "Error desconocido");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo descargar la imagen",
        variant: "destructive",
      });
    }
  }

  async function handleShare() {
    try {
      // Primero generar la imagen
      const element = document.getElementById("agenda-preview-card");
      if (!element) {
        throw new Error("No se encontró el elemento a compartir");
      }

      // Convertir a data URL para compartir
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(element, {
        backgroundColor: "#ffffff",
        width: 1080,
        height: 1920,
        pixelRatio: 2,
      });

      if (!blob) {
        throw new Error("No se pudo generar la imagen");
      }

      const dataUrl = URL.createObjectURL(blob);
      const result = await sharePost(dataUrl, "Mi Agenda Semanal");

      if (result.success) {
        if (result.method === "clipboard") {
          toast({
            title: "¡Copiado!",
            description: "La imagen se ha copiado al portapapeles",
          });
        } else if (result.method === "share") {
          toast({
            title: "¡Compartido!",
            description: "La imagen se ha compartido correctamente",
          });
        }
      } else {
        throw new Error(result.error || "Error desconocido");
      }

      // Limpiar URL
      URL.revokeObjectURL(dataUrl);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo compartir la imagen",
        variant: "destructive",
      });
    }
  }

  if (loading || loadingSchedule) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Calendar className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: "var(--color-primary)" }} />
          <p className="text-slate-600">Cargando agenda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" style={{ color: "var(--color-primary)" }} />
            <h1 className="text-3xl font-bold text-slate-900">Post de Agenda</h1>
          </div>
          <p className="text-slate-600">
            Genera y comparte un post visual con tu disponibilidad semanal
          </p>
        </motion.div>

        {/* Layout principal: Controles a la izquierda, Preview a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panel izquierdo: Controles */}
          <div className="lg:col-span-1 space-y-6">
            <StyleControls
              primaryColor={primaryColor}
              onPrimaryColorChange={setPrimaryColor}
              fontFamily={fontFamily}
              onFontFamilyChange={setFontFamily}
              bookedEmoji={bookedEmoji}
              onBookedEmojiChange={setBookedEmoji}
              footerText={footerText}
              onFooterTextChange={setFooterText}
            />

            <UploadBackground
              userId={user?.id}
              currentBackgroundUrl={backgroundUrl}
              onBackgroundChange={setBackgroundUrl}
            />
          </div>

          {/* Panel central: Vista previa */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
                  Vista Previa
                </CardTitle>
                <CardDescription>
                  Esta es la vista previa de tu post. Los horarios se actualizan automáticamente.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6">
                {/* Vista previa del post */}
                <AgendaPreviewCard
                  weekSchedule={weekSchedule}
                  weekStartDate={weekStartDate}
                  businessName={profile?.business_name}
                  businessLogoUrl={profile?.business_logo_url}
                  backgroundUrl={backgroundUrl}
                  primaryColor={primaryColor}
                  fontFamily={fontFamily}
                  bookedEmoji={bookedEmoji}
                  footerText={footerText}
                />

                {/* Botones de acción */}
                <div className="flex gap-4 w-full max-w-md">
                  <Button
                    onClick={handleDownload}
                    className="flex-1"
                    style={{
                      background: `linear-gradient(to right, var(--color-primary), var(--color-accent))`,
                      color: "white",
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

