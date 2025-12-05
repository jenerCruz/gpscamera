// logicStamp.js
import { activeTemplate } from "./templates.js";

export async function stampPhoto(baseImageUrl, metadata, miniMapUrl) {
  
  return new Promise((resolve, reject) => {

    const imgBase = new Image();
    imgBase.crossOrigin = "anonymous";

    imgBase.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = imgBase.width;
      canvas.height = imgBase.height;

      const ctx = canvas.getContext("2d");

      // 1. Dibujar la plantilla PNG
      ctx.drawImage(imgBase, 0, 0);

      const style = activeTemplate.textStyle;
      ctx.fillStyle = style.color;
      ctx.font = style.font;
      ctx.textBaseline = "top";

      const layout = activeTemplate.layout;

      // 2. Insertar los DATOS según la plantilla activa
      if (activeTemplate.fields.date)
        ctx.fillText(`Fecha: ${metadata.date}`, layout.date.x, layout.date.y);

      if (activeTemplate.fields.time)
        ctx.fillText(`Hora: ${metadata.time}`, layout.time.x, layout.time.y);

      if (activeTemplate.fields.timezone)
        ctx.fillText(`Zona: ${metadata.timezone}`, layout.timezone.x, layout.timezone.y);

      if (activeTemplate.fields.address) {
        drawMultiline(
          ctx,
          `Ubicación: ${metadata.address}`,
          layout.address.x,
          layout.address.y,
          layout.address.maxWidth
        );
      }

      if (activeTemplate.fields.coords && metadata.lat && metadata.lon) {
        ctx.fillText(
          `Lat: ${metadata.lat.toFixed(6)}  Lon: ${metadata.lon.toFixed(6)}`,
          layout.coords.x,
          layout.coords.y
        );
      }

      // 3. Mini-mapa real
      if (activeTemplate.fields.map && miniMapUrl) {
        const mapImg = new Image();
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
        mapImg.src = miniMapUrl;
      } else {
        canvas.toBlob(blob => resolve(blob), "image/jpeg", 0.92);
      }
    };

    imgBase.onerror = reject;
    imgBase.src = activeTemplate.png;
  });
}



// Utilidad para texto multilinea
function drawMultiline(ctx, text, x, y, maxWidth) {
  const words = text.split(" ");
  let line = "";
  
  for (let w of words) {
    const testLine = line + w + " ";
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth) {
      ctx.fillText(line, x, y);
      line = w + " ";
      y += 28;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}
