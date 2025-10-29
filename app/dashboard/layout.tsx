"use client";

import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <Sidebar />
      
      {/* Main Content - El sidebar maneja su propio ancho con margin-left fijo */}
      <div className="flex-1 overflow-auto ml-[280px] lg:ml-[280px]">
        {children}
      </div>
    </div>
  );
}

