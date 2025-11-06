"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings as SettingsIcon,
  AlertTriangle,
  CheckCircle2,
  User,
  Building2,
  Upload,
  X,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase, type Profile } from "@/lib/supabaseClient";

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newBusinessName, setNewBusinessName] = useState("");
  const [businessLogoFile, setBusinessLogoFile] = useState<File | null>(null);
  const [businessLogoPreview, setBusinessLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Función para normalizar el username (reemplazar espacios con guiones y limpiar)
  const normalizeUsername = (input: string): string => {
    return input
      .toLowerCase()
      .replace(/\s+/g, "-")           // Espacios a guiones
      .replace(/[^a-z0-9-_]/g, "")    // Solo letras, números, guiones y guión bajo
      .replace(/-+/g, "-")            // Eliminar múltiples guiones seguidos
      .replace(/^-+|-+$/g, "");       // Eliminar guiones al inicio y final
  };

  // Comprimir imagen antes de subir
  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Redimensionar si es muy grande (max 800x800)
          const maxSize = 800;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            'image/jpeg',
            0.85 // Calidad 85%
          );
        };
        img.onerror = () => reject(new Error('Image load failed'));
      };
      reader.onerror = () => reject(new Error('File read failed'));
    });
  }

  async function handleLogoUpload(file: File): Promise<string | null> {
    if (!user) return null;

    try {
      setUploadingLogo(true);

      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Por favor selecciona una imagen",
          variant: "destructive",
        });
        return null;
      }

      // Validar tamaño original (max 10MB antes de comprimir)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "La imagen es muy grande. Máximo 10MB.",
          variant: "destructive",
        });
        return null;
      }

      // Comprimir y optimizar imagen
      toast({
        title: "Optimizando imagen...",
        description: "Esto tomará solo unos segundos",
      });

      const compressedFile = await compressImage(file);
      
      console.log('📦 Tamaño original:', (file.size / 1024).toFixed(2), 'KB');
      console.log('📦 Tamaño optimizado:', (compressedFile.size / 1024).toFixed(2), 'KB');
      console.log('📊 Reducción:', (((file.size - compressedFile.size) / file.size) * 100).toFixed(1), '%');

      // Crear nombre único para el archivo
      const fileName = `${user.id}-${Date.now()}.jpg`;
      const filePath = `business-logos/${fileName}`;

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public-assets')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        // Si el bucket no existe, intentar crearlo y luego subir
        if (uploadError.message.includes('Bucket not found')) {
          toast({
            title: "Error",
            description: "El sistema de almacenamiento no está configurado. Contacta al soporte.",
            variant: "destructive",
          });
          return null;
        }
        throw uploadError;
      }

      // Obtener URL pública
      const { data } = supabase.storage
        .from('public-assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error("Logo upload error:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo subir el logo",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploadingLogo(false);
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBusinessLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setBusinessLogoFile(file);
  }

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);
      
      // Inicializar valores para edición
      if (profileData) {
        setNewUsername(profileData.username || "");
        setNewBusinessName(profileData.business_name || "");
        setBusinessLogoPreview(profileData.business_logo_url || null);
      }
    } catch (error: any) {
      console.error("Auth check error:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la configuración",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUsername() {
    if (!user || !profile) return;

    // Validar username
    if (!newUsername.trim()) {
      toast({
        title: "Error",
        description: "Debes ingresar un nombre de usuario",
        variant: "destructive",
      });
      return;
    }

    const normalizedUsername = normalizeUsername(newUsername.trim());

    if (normalizedUsername.length < 3) {
      toast({
        title: "Error",
        description: "El nombre de usuario debe tener al menos 3 caracteres",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ username: normalizedUsername })
        .eq("id", user.id);

      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: "Error",
            description: "Este nombre de usuario ya está en uso. Prueba con otro.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setProfile({ ...profile, username: normalizedUsername });
      setEditingUsername(false);
      toast({
        title: "¡Actualizado!",
        description: "Tu nombre de usuario ha sido actualizado",
      });
    } catch (error: any) {
      console.error("Update username error:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el nombre de usuario",
        variant: "destructive",
      });
    }
  }

  async function handleUpdateBusinessInfo() {
    if (!user || !profile) return;

    try {
      let logoUrl = businessLogoPreview;

      // Si hay un nuevo archivo, subirlo primero
      if (businessLogoFile) {
        const uploadedUrl = await handleLogoUpload(businessLogoFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        } else {
          return; // Error al subir, no continuar
        }
      }

      // Actualizar perfil
      const { error } = await supabase
        .from("profiles")
        .update({
          business_name: newBusinessName.trim() || null,
          business_logo_url: logoUrl,
        })
        .eq("id", user.id);

      if (error) throw error;

      // Actualizar perfil local
      setProfile({
        ...profile,
        business_name: newBusinessName.trim() || null,
        business_logo_url: logoUrl,
      });

      setEditingBusiness(false);
      setBusinessLogoFile(null);

      toast({
        title: "¡Actualizado!",
        description: "La información de tu negocio ha sido actualizada",
      });
    } catch (error: any) {
      console.error("Update business info error:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información del negocio",
        variant: "destructive",
      });
    }
  }

  async function handleToggleAutoConfirm() {
    if (!user || !profile) return;

    const newValue = !profile.auto_confirm;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ auto_confirm: newValue })
        .eq("id", user.id);

      if (error) throw error;

      setProfile({ ...profile, auto_confirm: newValue });
      toast({
        title: "Configuración actualizada",
        description: newValue 
          ? "Las citas se confirmarán automáticamente" 
          : "Ahora debes confirmar manualmente cada cita",
      });
    } catch (error: any) {
      console.error("Update auto confirm error:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("¿Estás seguro? Esta acción no se puede deshacer y eliminará todos tus datos.")) return;

    if (!user) return;

    try {
      // Delete all user data
      await supabase.from("appointments").delete().eq("user_id", user.id);
      await supabase.from("services").delete().eq("user_id", user.id);
      await supabase.from("subscriptions").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);

      // Sign out
      await supabase.auth.signOut();

      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta y todos tus datos han sido eliminados",
      });

      router.push("/");
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la cuenta",
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <SettingsIcon className="w-6 h-6 text-primary animate-pulse" />
            </div>
          </div>
          <p className="text-slate-600 font-medium">Cargando configuración...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8" style={{ color: "var(--color-primary)" }} />
          Configuración
        </h1>
        <p className="text-slate-600">
          Personaliza cómo funciona tu agenda
        </p>
      </motion.div>

      {/* Auto Confirm Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Confirmación Automática</CardTitle>
            <CardDescription>
              Personaliza cómo se confirman las citas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-4">
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">Confirmación automática</h4>
                  {profile?.auto_confirm && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm text-muted">
                  {profile?.auto_confirm
                    ? "Las citas se confirman automáticamente sin tu intervención"
                    : "Debes confirmar manualmente cada cita antes de que el cliente la vea confirmada"}
                </p>
              </div>
              <Button
                variant={profile?.auto_confirm ? "default" : "outline"}
                size="lg"
                onClick={handleToggleAutoConfirm}
                className="ml-4"
              >
                {profile?.auto_confirm ? "Activada" : "Desactivada"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Username Section - Solo si completó onboarding */}
      {profile?.onboarding_completed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Nombre de Usuario
              </CardTitle>
              <CardDescription>
                Cambia la URL de tu agenda pública
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingUsername ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_username">Nuevo nombre de usuario</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500 whitespace-nowrap">microagenda.cl/u/</span>
                      <Input
                        id="edit_username"
                        placeholder="tu-negocio"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        maxLength={50}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateUsername} variant="default">
                      Guardar Cambios
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingUsername(false);
                        setNewUsername(profile?.username || "");
                      }}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-1 flex-1">
                    <h4 className="font-medium">URL de tu agenda</h4>
                    <code className="block text-sm bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 font-mono">
                      microagenda.cl/u/{profile?.username}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setEditingUsername(true)}
                    className="ml-4"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Business Info Section - Solo si completó onboarding */}
      {profile?.onboarding_completed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Información del Negocio
              </CardTitle>
              <CardDescription>
                Personaliza cómo aparece tu negocio en la agenda pública
              </CardDescription>
            </CardHeader>
            <CardContent>
              {editingBusiness ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_business_name">Nombre del negocio</Label>
                    <Input
                      id="edit_business_name"
                      placeholder="Ej: Salón de Belleza María"
                      value={newBusinessName}
                      onChange={(e) => setNewBusinessName(e.target.value)}
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Logo del negocio</Label>
                    {businessLogoPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={businessLogoPreview}
                          alt="Logo preview"
                          className="h-24 w-24 object-contain rounded-lg border border-slate-200"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setBusinessLogoFile(null);
                            setBusinessLogoPreview(null);
                          }}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-white hover:bg-red-50 p-0"
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                        <input
                          type="file"
                          id="edit_logo_input"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="edit_logo_input"
                          className="cursor-pointer flex flex-col items-center gap-2"
                        >
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-slate-400" />
                          </div>
                          <span className="text-sm text-slate-600 font-medium">Subir logo</span>
                          <span className="text-xs text-slate-500">PNG, JPG hasta 10MB</span>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleUpdateBusinessInfo} 
                      variant="default"
                      disabled={uploadingLogo}
                    >
                      {uploadingLogo ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingBusiness(false);
                        setNewBusinessName(profile?.business_name || "");
                        setBusinessLogoPreview(profile?.business_logo_url || null);
                        setBusinessLogoFile(null);
                      }}
                      variant="outline"
                      disabled={uploadingLogo}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between py-4">
                  <div className="space-y-3 flex-1">
                    {profile?.business_name && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-600">Nombre</h4>
                        <p className="text-base font-semibold text-slate-900">{profile.business_name}</p>
                      </div>
                    )}
                    {profile?.business_logo_url && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-600 mb-2">Logo</h4>
                        <img
                          src={profile.business_logo_url}
                          alt="Logo del negocio"
                          className="h-16 w-16 object-contain rounded-lg border border-slate-200"
                        />
                      </div>
                    )}
                    {!profile?.business_name && !profile?.business_logo_url && (
                      <p className="text-sm text-slate-500 italic">
                        No has configurado información del negocio aún
                      </p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setEditingBusiness(true)}
                    className="ml-4"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
            </div>
            <CardDescription>
              Acciones irreversibles que afectarán tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Eliminar Cuenta</h4>
                <p className="text-sm text-muted mb-4">
                  Esta acción eliminará permanentemente tu cuenta, citas, servicios y todos tus datos personales conforme a la Ley 19.628. Esta acción no se puede deshacer.
                </p>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  size="lg"
                >
                  Eliminar Cuenta y Todos los Datos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
