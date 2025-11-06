"use client";

import { Palette, Type, Calendar, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StyleControlsProps {
  primaryColor: string;
  onPrimaryColorChange: (color: string) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  bookedEmoji: string;
  onBookedEmojiChange: (emoji: string) => void;
  footerText: string;
  onFooterTextChange: (text: string) => void;
  monthTitle?: string;
  onMonthTitleChange?: (title: string) => void;
  horasText?: string;
  onHorasTextChange?: (text: string) => void;
  disponiblesText?: string;
  onDisponiblesTextChange?: (text: string) => void;
}

export function StyleControls({
  primaryColor,
  onPrimaryColorChange,
  footerText,
  onFooterTextChange,
  monthTitle,
  onMonthTitleChange,
  horasText = "HORAS",
  onHorasTextChange,
  disponiblesText = "Disponibles",
  onDisponiblesTextChange,
}: StyleControlsProps) {
  return (
    <div className="space-y-4">
      {/* Color Principal */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
            <Label className="font-semibold">Color Principal</Label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => onPrimaryColorChange(e.target.value)}
              className="w-16 h-10 rounded-lg border-2 border-slate-200 cursor-pointer"
            />
            <Input
              type="text"
              value={primaryColor}
              onChange={(e) => onPrimaryColorChange(e.target.value)}
              placeholder="#10B981"
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Título del Mes */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
            <Label className="font-semibold">Título del Mes</Label>
          </div>
          <Input
            type="text"
            value={monthTitle || ""}
            onChange={(e) => onMonthTitleChange?.(e.target.value)}
            placeholder="Deja vacío para usar el mes actual"
            maxLength={20}
          />
          <p className="text-xs text-slate-500">Se mostrará en la parte superior del post</p>
        </CardContent>
      </Card>

      {/* Textos "HORAS" y "Disponibles" */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
            <Label className="font-semibold">Encabezado del Recuadro</Label>
          </div>
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-slate-500">Texto en mayúsculas</Label>
              <Input
                type="text"
                value={horasText}
                onChange={(e) => onHorasTextChange?.(e.target.value)}
                placeholder="HORAS"
                maxLength={15}
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500">Texto en cursiva</Label>
              <Input
                type="text"
                value={disponiblesText}
                onChange={(e) => onDisponiblesTextChange?.(e.target.value)}
                placeholder="Disponibles"
                maxLength={15}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Texto Final */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
            <Label className="font-semibold">Texto Final</Label>
          </div>
          <Input
            type="text"
            value={footerText}
            onChange={(e) => onFooterTextChange(e.target.value)}
            placeholder="Ej: Las horas se pueden modificar según disponibilidad"
            maxLength={100}
          />
          <p className="text-xs text-slate-500">{footerText.length}/100 caracteres</p>
        </CardContent>
      </Card>
    </div>
  );
}

