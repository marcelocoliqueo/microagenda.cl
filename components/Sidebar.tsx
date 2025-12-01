"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  Palette,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Package,
  Clock,
  Image,
  Mail,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null },
  { name: "Citas", href: "/dashboard/appointments", icon: Calendar, badge: null },
  { name: "Calendario", href: "/dashboard/calendar", icon: CalendarDays, badge: "Nuevo" },
  { name: "Servicios", href: "/dashboard/services", icon: Package, badge: null },
  { name: "Horarios", href: "/dashboard/schedule", icon: Clock, badge: null },
  { name: "Post de Agenda", href: "/dashboard/post-agenda", icon: Image, badge: null },
  { name: "Clientes", href: "/dashboard/clients", icon: Users, badge: null },
  { name: "Informes", href: "/dashboard/reports", icon: BarChart3, badge: "Pro" },
  { name: "Emails (Test)", href: "/dashboard/emails", icon: Mail, badge: "Beta" },
  { name: "Configuración", href: "/dashboard/settings", icon: Settings, badge: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const { brandColor, setBrandColor, allColors } = useTheme();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Header - Show only on mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt={APP_NAME} className="h-8 w-8" />
          <span className="font-bold text-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
            {APP_NAME}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Mobile Menu Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-16 bottom-0 z-50 w-[280px] bg-white border-r border-slate-200 shadow-2xl flex flex-col overflow-y-auto"
            >
              {/* Navigation */}
              <nav className="flex-1 py-6 px-3">
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = item.href === "/dashboard"
                      ? pathname === item.href
                      : pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;

                    return (
                      <Link key={item.name} href={item.href}>
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                            isActive
                              ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-lg"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          )}
                        >
                          <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "")}
                            style={!isActive ? { color: "var(--color-primary)" } : {}}
                          />
                          <span className="flex-1 font-medium text-sm">{item.name}</span>
                          {item.badge && (
                            <span className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              isActive ? "bg-white/20 text-white" : ""
                            )}
                            style={!isActive ? {
                              backgroundColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.1)`,
                              color: `var(--color-primary)`
                            } : {}}
                            >
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Color Picker in Mobile Menu */}
              <div className="px-3 pb-6">
                <Card className="border-slate-200/70 bg-gradient-to-br from-slate-50 to-white">
                  <CardContent className="p-4">
                    <button
                      onClick={() => setShowColorPicker(!showColorPicker)}
                      className="flex items-center gap-2 text-sm font-medium text-slate-700 w-full mb-3"
                    >
                      <Palette className="w-4 h-4" />
                      <span>Color de Marca</span>
                      <Sparkles className="w-3 h-3 ml-auto text-amber-500" />
                    </button>
                    {showColorPicker && (
                      <div className="grid grid-cols-4 gap-2">
                        {allColors.map((color) => (
                          <button
                            key={color.id}
                            onClick={() => setBrandColor(color.id)}
                            className={cn(
                              "w-10 h-10 rounded-lg transition-all",
                              brandColor.id === color.id && "ring-2 ring-offset-2 ring-slate-400"
                            )}
                            style={{ backgroundColor: color.primary }}
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar - Hidden on mobile */}
      <motion.aside
        animate={{ width: isCollapsed ? "80px" : "280px" }}
        className="hidden lg:flex fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200/70 shadow-xl flex-col"
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/70 bg-gradient-to-br from-slate-50 to-white">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <img src="/logo.png" alt={APP_NAME} className="h-8 w-8" />
              <span className="font-bold text-lg bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent">
                {APP_NAME}
              </span>
            </motion.div>
          )}
          {isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center w-full"
            >
              <img src="/logo.png" alt={APP_NAME} className="h-8 w-8" />
            </motion.div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              // Para Dashboard, solo activo si es exactamente /dashboard
              // Para otros items, activo si coincide exacto o es subruta
              const isActive = item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(item.href + "/");
              const Icon = item.icon;

              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-lg"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                    style={isActive ? { 
                      boxShadow: `0 10px 15px -3px rgba(var(--color-primary-rgb, 16, 185, 129), 0.1), 0 4px 6px -2px rgba(var(--color-primary-rgb, 16, 185, 129), 0.05)` 
                    } : {}}
                  >
                    <Icon 
                      className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "")} 
                      style={!isActive ? { color: "var(--color-primary)" } : {}}
                    />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 font-medium text-sm">{item.name}</span>
                        {item.badge && (
                          <span 
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full",
                              isActive 
                                ? "bg-white/20 text-white" 
                                : ""
                            )}
                            style={!isActive ? {
                              backgroundColor: `rgba(var(--color-primary-rgb, 16, 185, 129), 0.1)`,
                              color: `var(--color-primary)`
                            } : {}}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Color Picker Section */}
        {!isCollapsed && (
          <div className="px-3 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-slate-200/70 bg-gradient-to-br from-slate-50 to-white">
                <CardContent className="p-4">
                  <button
                    onClick={() => setShowColorPicker(!showColorPicker)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 w-full mb-3"
                  >
                    <Palette className="w-4 h-4" />
                    <span>Color de Marca</span>
                    <Sparkles className="w-3 h-3 ml-auto text-amber-500" />
                  </button>

                  <AnimatePresence>
                    {showColorPicker && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                      >
                        <div className="grid grid-cols-4 gap-2">
                          {allColors.map((color) => (
                            <motion.button
                              key={color.id}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setBrandColor(color.id)}
                              className={cn(
                                "w-10 h-10 rounded-lg transition-all",
                                brandColor.id === color.id
                                  ? "ring-2 ring-offset-2 ring-slate-400 shadow-lg"
                                  : "hover:shadow-md"
                              )}
                              style={{ backgroundColor: color.primary }}
                              title={color.name}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 text-center mt-2">
                          {brandColor.name}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Collapse Button */}
        <div className="p-3 border-t border-slate-200/70">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full justify-center hover:bg-slate-100"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </motion.aside>
    </>
  );
}
