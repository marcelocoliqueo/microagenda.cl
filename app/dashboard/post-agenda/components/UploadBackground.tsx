"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabaseClient";

interface UploadBackgroundProps {
  userId: string | null;
  currentBackgroundUrl: string | null;
  onBackgroundChange: (url: string | null) => void;
}

export function UploadBackground({
  userId,
  currentBackgroundUrl,
  onBackgroundChange,
}: UploadBackgroundProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validar archivo
  function validateFile(file: File): { valid: boolean; error?: string } {
    // Tamaño máximo: 2 MB
    const maxSize = 2 * 1024 * 1024; // 2 MB en bytes
    if (file.size > maxSize) {
      return { valid: false, error: "El archivo debe ser menor a 2 MB" };
    }

    // Formatos permitidos
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Solo se permiten archivos JPG, PNG o WEBP" };
    }

    return { valid: true };
  }

  // Comprimir imagen
  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxWidth = 1080;
          const maxHeight = 1920;
          
          let width = img.width;
          let height = img.height;

          // Calcular dimensiones manteniendo proporción
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("No se pudo crear el contexto del canvas"));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Error al comprimir la imagen"));
                return;
              }
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            },
            "image/jpeg",
            0.85 // Calidad 85%
          );
        };
        img.onerror = () => reject(new Error("Error al cargar la imagen"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Error al leer el archivo"));
      reader.readAsDataURL(file);
    });
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    // Validar
    const validation = validateFile(file);
    if (!validation.valid) {
      toast({
        title: "Error",
        description: validation.error || "Archivo inválido",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // Comprimir imagen
      const compressedFile = await compressImage(file);

      // Subir a Supabase Storage
      const filePath = `user_${userId}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("post_backgrounds")
        .upload(filePath, compressedFile, {
          cacheControl: "3600",
          upsert: true, // Sobrescribir si existe
        });

      if (uploadError) {
        throw uploadError;
      }

      // Obtener URL pública
      const { data } = supabase.storage
        .from("post_backgrounds")
        .getPublicUrl(filePath);

      onBackgroundChange(data.publicUrl);

      toast({
        title: "¡Fondo actualizado!",
        description: "El fondo se ha subido correctamente",
      });
    } catch (error: any) {
      console.error("Error al subir fondo:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir el fondo",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleRemoveBackground() {
    if (!userId || !currentBackgroundUrl) return;

    try {
      const filePath = `user_${userId}.jpg`;
      const { error } = await supabase.storage
        .from("post_backgrounds")
        .remove([filePath]);

      if (error) throw error;

      onBackgroundChange(null);

      toast({
        title: "Fondo eliminado",
        description: "El fondo se ha eliminado correctamente",
      });
    } catch (error: any) {
      console.error("Error al eliminar fondo:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el fondo",
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
          <h3 className="font-semibold text-lg">Fondo Personalizado</h3>
        </div>

        {/* Vista previa del fondo actual */}
        {currentBackgroundUrl && (
          <div className="relative rounded-lg overflow-hidden border-2 border-slate-200">
            <img
              src={currentBackgroundUrl}
              alt="Fondo actual"
              className="w-full h-32 object-cover"
            />
            <button
              onClick={handleRemoveBackground}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              title="Eliminar fondo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Botón de subir */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            id="background-upload"
          />
          <label htmlFor="background-upload">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading}
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? "Subiendo..." : currentBackgroundUrl ? "Cambiar fondo" : "Subir fondo"}
              </span>
            </Button>
          </label>
          <p className="text-xs text-slate-500 text-center">
            Máx 2 MB • JPG, PNG o WEBP • Recomendado: 1080x1920px
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

