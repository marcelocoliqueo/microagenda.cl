import { toPng } from "html-to-image";

export async function downloadImage(elementId: string, filename: string = "agenda-post.png") {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error("Elemento no encontrado");
    }

    // Configurar opciones para la imagen
    const options = {
      backgroundColor: "#ffffff",
      width: 1080,
      height: 1920,
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      },
      pixelRatio: 2, // Mayor calidad
    };

    // Convertir a PNG
    const dataUrl = await toPng(element, options);

    // Crear link de descarga
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (error: any) {
    console.error("Error al descargar imagen:", error);
    return { success: false, error: error.message };
  }
}

