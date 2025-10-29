"use client";

import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppointmentsPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Calendar className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Gestión de Citas
        </h1>
        <p className="text-slate-600 mb-6 text-center max-w-md">
          Esta sección está en desarrollo. Por ahora, puedes gestionar tus citas desde el Dashboard principal.
        </p>
        <Button onClick={() => router.push("/dashboard")}>
          Volver al Dashboard
        </Button>
      </div>
    </div>
  );
}

