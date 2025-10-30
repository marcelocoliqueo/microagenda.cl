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
      <main className="relative flex-1 ml-[280px] overflow-y-auto overflow-x-hidden h-screen">
        {children}
      </main>
    </div>
  );
}

