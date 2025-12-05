// logicStamp.js
import { activeTemplate } from "./templates.js";

/**
 * Estampa una foto con una plantilla y metadatos dinámicos.
 * @param {string} baseImageUrl - Foto original (dataURL o blob URL)
 * @param {object} metadata
 * @param {string|null} miniMapUrl - Imagen real del mapa (OSM static)
 */
export async function stampPhoto(baseImageUrl, metadata, miniMapUrl) {

  return new Promise((resolve, reject) => {

    const photo = new Image();
    photo.crossOrigin = "anonymous";

    photo.onload = () => {

      const canvas = document.createElement("canvas");
      canvas.width = photo.width;
      canvas.height = photo.height;
      const ctx = canvas.getContext("2d");

      // === (1) fondo: FOTO ORIGINAL ===
      ctx.drawImage(photo, 0, 0, canvas.width, canvas.height);

      // === (2) PLANTILLA PNG ===
      const templateImg = new Image();
      templateImg.crossOrigin = "anonymous";

      templateImg.onload = () => {

        ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);

        // === (3) CONFIGURACIONES DE ESTILO ===
        const style = activeTemplate.textStyle;
        const layout = activeTemplate.layout;

        ctx.fillStyle = style.color;
        ctx.font = style.font;
        ctx.textBaseline = "top";

        // === (4) CAMPOS DE TEXTO ===
        if (activeTemplate.fields.date)
          ctx.fillText(metadata.date, layout.date.x, layout.date.y);

        if (activeTemplate.fields.time)
          ctx.fillText(metadata.time, layout.time.x, layout.time.y);

        if (activeTemplate.fields.timezone)
          ctx.fillText(metadata.timezone, layout.timezone.x, layout.timezone.y);

        if (activeTemplate.fields.address)
          drawMultiline(
            ctx,
            metadata.address,
            layout.address.x,
            layout.address.y,
            layout.address.maxWidth
          );

        if (activeTemplate.fields.coords && metadata.lat && metadata.lon) {
          ctx.fillText(
            `Lat: ${metadata.lat.toFixed(6)} | Lon: ${metadata.lon.toFixed(6)}`,
            layout.coords.x,
            layout.coords.y
          );
        }

        // === (5) MINI-MAPA REAL (si existe y la plantilla lo soporta) ===
        if (activeTemplate.fields.map && miniMapUrl) {
          
          const mapImg = new Image();
          mapImg.crossOrigin = "anonymous";

          mapImg.onload = () => {

            ctx.drawImage(
              mapImg,
              layout.map.x,
              layout.map.y,
              layout.map.width,
              layout.map.height
            );

            canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.92);
          };

          // Fallback si el mapa falla
          mapImg.onerror = () => {
            console.warn("No se pudo cargar mini-mapa real, continuando sin él.");
            canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.92);
          };

          mapImg.src = miniMapUrl;

        } else {
          canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.92);
        }

      }; // templateImg.onload

      templateImg.onerror = reject;
      templateImg.src = activeTemplate.png;

    }; // photo.onload

    photo.onerror = reject;
    photo.src = baseImageUrl;

  });
}



/* ===========================================
   Utilidad para texto multilinea
=========================================== */
function drawMultiline(ctx, text, x, y, maxWidth) {
  const words = text.split(" ");
  let line = "";

  for (let w of words) {
    const testLine = line + w + " ";
    if (ctx.measureText(testLine).width > maxWidth) {
      ctx.fillText(line, x, y);
      line = w + " ";
      y += 32; // altura de línea
    } else {
      line = testLine;
    }
  }

  ctx.fillText(line, x, y);
}
