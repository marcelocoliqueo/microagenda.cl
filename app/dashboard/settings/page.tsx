"use client";

import { useRouter } from "next/navigation";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Settings className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Configuración
        </h1>
        <p className="text-slate-600 mb-6 text-center max-w-md">
          Esta sección está en desarrollo. Aquí podrás configurar tu perfil, servicios y preferencias.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Volver al Dashboard
        </Button>
      </div>
    </div>
  );
}

