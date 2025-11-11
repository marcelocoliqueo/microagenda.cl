export async function sharePost(imageUrl: string, title: string = "Mi Agenda Semanal") {
  try {
    // Si el navegador soporta Web Share API (móviles principalmente)
    if (navigator.share) {
      // Convertir data URL a blob para compartir
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "agenda-post.png", { type: "image/png" });

      await navigator.share({
        title,
        text: "¡Revisa mi agenda semanal!",
        files: [file],
      });

      return { success: true, method: "share" };
    } else {
      // Fallback: copiar imagen al portapapeles
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);

        return { success: true, method: "clipboard" };
      } catch (clipboardError) {
        // Si falla clipboard, descargar la imagen
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = "agenda-post.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { success: true, method: "download" };
      }
    }
  } catch (error: any) {
    // Si el usuario canceló el diálogo de compartir, no es un error real
    const isUserCancellation = 
      error.name === "AbortError" || 
      error.name === "NotAllowedError" ||
      error.message?.toLowerCase().includes("cancel") ||
      error.message?.toLowerCase().includes("abort") ||
      error.message === "Share Canceled";
    
    if (isUserCancellation) {
      // Usuario canceló, no mostrar error
      return { success: false, cancelled: true };
    }
    
    console.error("Error al compartir:", error);
    return { success: false, error: error.message };
  }
}

