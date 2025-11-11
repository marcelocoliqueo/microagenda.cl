"use client";

import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-screen bg-gradient-to-b from-slate-50 to-white">
      <Sidebar />
      {/* Main Content - Scroll independiente del sidebar */}
      <main className="relative flex-1 lg:ml-[280px] pt-16 lg:pt-0 overflow-y-auto overflow-x-hidden min-h-screen">
        {children}
      </main>
    </div>
  );
}

