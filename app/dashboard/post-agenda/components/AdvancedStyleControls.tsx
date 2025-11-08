"use client";

import { Palette, Type, Settings, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

interface AdvancedStyleControlsProps {
  // Colores
  primaryColor: string;
  onPrimaryColorChange: (color: string) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  boxBackgroundColor: string;
  onBoxBackgroundColorChange: (color: string) => void;

  // Textos
  monthTitle: string;
  onMonthTitleChange: (title: string) => void;
  horasText: string;
  onHorasTextChange: (text: string) => void;
  disponiblesText: string;
  onDisponiblesTextChange: (text: string) => void;
  footerText: string;
  onFooterTextChange: (text: string) => void;

  // Opciones de estilo
  boxOpacity: number;
  onBoxOpacityChange: (opacity: number) => void;
  borderRadius: number;
  onBorderRadiusChange: (radius: number) => void;
  showBusinessName: boolean;
  onShowBusinessNameChange: (show: boolean) => void;

  // Tamaños de fuente
  monthFontSize: number;
  onMonthFontSizeChange: (size: number) => void;
  titleFontSize: number;
  onTitleFontSizeChange: (size: number) => void;
  dayFontSize: number;
  onDayFontSizeChange: (size: number) => void;
  slotFontSize: number;
  onSlotFontSizeChange: (size: number) => void;
}

const COLOR_PRESETS = [
  { name: "Rosa Elegante", primary: "#8B7B7B", bg: "#FFE4E4", box: "#FFFFFF" },
  { name: "Azul Serenidad", primary: "#4A5568", bg: "#E0F2FE", box: "#FFFFFF" },
  { name: "Verde Menta", primary: "#10B981", bg: "#ECFDF5", box: "#FFFFFF" },
  { name: "Lila Romántico", primary: "#9333EA", bg: "#FAF5FF", box: "#FFFFFF" },
  { name: "Naranja Vibrante", primary: "#EA580C", bg: "#FFF7ED", box: "#FFFFFF" },
  { name: "Gris Minimalista", primary: "#374151", bg: "#F3F4F6", box: "#FFFFFF" },
];

export function AdvancedStyleControls(props: AdvancedStyleControlsProps) {
  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    props.onPrimaryColorChange(preset.primary);
    props.onBackgroundColorChange(preset.bg);
    props.onBoxBackgroundColorChange(preset.box);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: "var(--color-primary)" }} />
          Personalización
        </CardTitle>
        <CardDescription>
          Ajusta cada detalle de tu post de agenda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="colors">
              <Palette className="w-4 h-4 mr-1" />
              Colores
            </TabsTrigger>
            <TabsTrigger value="text">
              <Type className="w-4 h-4 mr-1" />
              Textos
            </TabsTrigger>
            <TabsTrigger value="style">
              <Settings className="w-4 h-4 mr-1" />
              Estilo
            </TabsTrigger>
            <TabsTrigger value="sizes">
              <Type className="w-4 h-4 mr-1" />
              Tamaños
            </TabsTrigger>
          </TabsList>

          {/* Tab: Colores */}
          <TabsContent value="colors" className="space-y-4">
            {/* Presets de Colores */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Presets de Colores</Label>
              <div className="grid grid-cols-2 gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                    className="justify-start h-auto py-3"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex gap-1">
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: preset.bg }}
                        />
                      </div>
                      <span className="text-xs">{preset.name}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Color Principal */}
            <div className="space-y-2">
              <Label>Color Principal</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={props.primaryColor}
                  onChange={(e) => props.onPrimaryColorChange(e.target.value)}
                  className="w-12 h-10 rounded-lg border-2 border-slate-200 cursor-pointer"
                />
                <Input
                  type="text"
                  value={props.primaryColor}
                  onChange={(e) => props.onPrimaryColorChange(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            {/* Color de Fondo */}
            <div className="space-y-2">
              <Label>Color de Fondo</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={props.backgroundColor}
                  onChange={(e) => props.onBackgroundColorChange(e.target.value)}
                  className="w-12 h-10 rounded-lg border-2 border-slate-200 cursor-pointer"
                />
                <Input
                  type="text"
                  value={props.backgroundColor}
                  onChange={(e) => props.onBackgroundColorChange(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>

            {/* Color del Recuadro */}
            <div className="space-y-2">
              <Label>Color del Recuadro</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={props.boxBackgroundColor}
                  onChange={(e) => props.onBoxBackgroundColorChange(e.target.value)}
                  className="w-12 h-10 rounded-lg border-2 border-slate-200 cursor-pointer"
                />
                <Input
                  type="text"
                  value={props.boxBackgroundColor}
                  onChange={(e) => props.onBoxBackgroundColorChange(e.target.value)}
                  className="flex-1 font-mono text-sm"
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab: Textos */}
          <TabsContent value="text" className="space-y-4">
            <div className="space-y-2">
              <Label>Título del Mes</Label>
              <Input
                type="text"
                value={props.monthTitle}
                onChange={(e) => props.onMonthTitleChange(e.target.value)}
                placeholder="Dejar vacío para mes actual"
                maxLength={20}
              />
              <p className="text-xs text-slate-500">Se mostrará en la parte superior</p>
            </div>

            <div className="space-y-2">
              <Label>Texto en Mayúsculas</Label>
              <Input
                type="text"
                value={props.horasText}
                onChange={(e) => props.onHorasTextChange(e.target.value)}
                placeholder="HORAS"
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label>Texto en Cursiva</Label>
              <Input
                type="text"
                value={props.disponiblesText}
                onChange={(e) => props.onDisponiblesTextChange(e.target.value)}
                placeholder="Disponibles"
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <Label>Texto Final</Label>
              <Input
                type="text"
                value={props.footerText}
                onChange={(e) => props.onFooterTextChange(e.target.value)}
                placeholder="Mensaje personalizado"
                maxLength={100}
              />
              <p className="text-xs text-slate-500">{props.footerText.length}/100 caracteres</p>
            </div>
          </TabsContent>

          {/* Tab: Estilo */}
          <TabsContent value="style" className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Opacidad del Recuadro</Label>
                <span className="text-sm text-slate-500">{props.boxOpacity}%</span>
              </div>
              <Slider
                value={[props.boxOpacity]}
                onValueChange={([value]) => props.onBoxOpacityChange(value)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Bordes Redondeados</Label>
                <span className="text-sm text-slate-500">{props.borderRadius}px</span>
              </div>
              <Slider
                value={[props.borderRadius]}
                onValueChange={([value]) => props.onBorderRadiusChange(value)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mostrar Nombre del Negocio</Label>
                <p className="text-xs text-slate-500">Se muestra como @nombre al final</p>
              </div>
              <Switch
                checked={props.showBusinessName}
                onCheckedChange={props.onShowBusinessNameChange}
              />
            </div>
          </TabsContent>

          {/* Tab: Tamaños */}
          <TabsContent value="sizes" className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tamaño del Mes</Label>
                <span className="text-sm text-slate-500">{props.monthFontSize}px</span>
              </div>
              <Slider
                value={[props.monthFontSize]}
                onValueChange={([value]) => props.onMonthFontSizeChange(value)}
                min={60}
                max={180}
                step={10}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tamaño del Título</Label>
                <span className="text-sm text-slate-500">{props.titleFontSize}px</span>
              </div>
              <Slider
                value={[props.titleFontSize]}
                onValueChange={([value]) => props.onTitleFontSizeChange(value)}
                min={40}
                max={120}
                step={4}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tamaño de los Días</Label>
                <span className="text-sm text-slate-500">{props.dayFontSize}px</span>
              </div>
              <Slider
                value={[props.dayFontSize]}
                onValueChange={([value]) => props.onDayFontSizeChange(value)}
                min={30}
                max={80}
                step={2}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Tamaño de los Horarios</Label>
                <span className="text-sm text-slate-500">{props.slotFontSize}px</span>
              </div>
              <Slider
                value={[props.slotFontSize]}
                onValueChange={([value]) => props.onSlotFontSizeChange(value)}
                min={24}
                max={72}
                step={2}
                className="w-full"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
