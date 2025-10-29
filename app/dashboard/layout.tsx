"use client";

import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      <Sidebar />
      {/* Main Content - Se ajusta automáticamente con el sidebar fijo */}
      <div className="flex-1 overflow-auto pl-[280px]">
        {children}
      </div>
    </div>
  );
}

