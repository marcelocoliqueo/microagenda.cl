"use client";

import { Palette, Type, Smile, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface StyleControlsProps {
  primaryColor: string;
  onPrimaryColorChange: (color: string) => void;
  fontFamily: string;
  onFontFamilyChange: (font: string) => void;
  bookedEmoji: string;
  onBookedEmojiChange: (emoji: string) => void;
  footerText: string;
  onFooterTextChange: (text: string) => void;
}

const fontOptions = [
  { value: "Inter", label: "Inter (Moderno)" },
  { value: "Poppins", label: "Poppins (Elegante)" },
  { value: "Roboto", label: "Roboto (Clásico)" },
  { value: "Open Sans", label: "Open Sans (Legible)" },
  { value: "Montserrat", label: "Montserrat (Bold)" },
];

const emojiOptions = [
  { value: "❌", label: "❌ Cruz" },
  { value: "🚫", label: "🚫 Prohibido" },
  { value: "⛔", label: "⛔ Señal" },
  { value: "🔒", label: "🔒 Cerrado" },
  { value: "💤", label: "💤 Ocupado" },
];

export function StyleControls({
  primaryColor,
  onPrimaryColorChange,
  fontFamily,
  onFontFamilyChange,
  bookedEmoji,
  onBookedEmojiChange,
  footerText,
  onFooterTextChange,
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

      {/* Tipografía */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
            <Label className="font-semibold">Tipografía</Label>
          </div>
          <Select value={fontFamily} onValueChange={onFontFamilyChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Emoji para Horas Ocupadas */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
            <Label className="font-semibold">Emoji para Horas Ocupadas</Label>
          </div>
          <Select value={bookedEmoji} onValueChange={onBookedEmojiChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {emojiOptions.map((emoji) => (
                <SelectItem key={emoji.value} value={emoji.value}>
                  {emoji.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            placeholder="Ej: ¡Reserva tu cita ahora! 📅"
            maxLength={100}
          />
          <p className="text-xs text-slate-500">{footerText.length}/100 caracteres</p>
        </CardContent>
      </Card>
    </div>
  );
}

