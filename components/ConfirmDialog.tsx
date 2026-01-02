"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Trash2, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "primary";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "primary",
  isLoading = false,
}: ConfirmDialogProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: <Trash2 className="w-6 h-6 text-red-600" />,
          iconBg: "bg-red-100",
          button: "bg-red-600 hover:bg-red-700 text-white border-none",
          accent: "border-t-red-500",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          iconBg: "bg-amber-100",
          button: "bg-amber-600 hover:bg-amber-700 text-white border-none",
          accent: "border-t-amber-500",
        };
      case "info":
        return {
          icon: <Info className="w-6 h-6 text-blue-600" />,
          iconBg: "bg-blue-100",
          button: "bg-blue-600 hover:bg-blue-700 text-white border-none",
          accent: "border-t-blue-500",
        };
      default:
        return {
          icon: <HelpCircle className="w-6 h-6 text-primary" />,
          iconBg: "bg-primary/10",
          button: "bg-primary hover:brightness-110 text-white border-none",
          accent: "border-t-primary",
        };
    }
  };

  const styles = getVariantStyles();

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[400px] border-t-4 ${styles.accent} p-0 overflow-hidden`}>
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full flex-shrink-0 ${styles.iconBg}`}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {title}
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-2 leading-relaxed">
                  {description}
                </DialogDescription>
              </DialogHeader>
            </div>
          </div>
        </div>

        <DialogFooter className="bg-slate-50/80 p-4 gap-2 sm:gap-0 flex-row justify-end border-t border-slate-100">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 sm:flex-none text-slate-500 hover:text-slate-700 hover:bg-slate-100"
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 sm:flex-none font-semibold ${styles.button}`}
          >
            {isLoading ? "Cargando..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

