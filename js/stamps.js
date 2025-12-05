import { createMiniMapSVG } from "./utils.js";

export function applyStampAndGetBlob(dataUrl, meta) {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext("2d");

      ctx.drawImage(img, 0, 0);

      const pad = img.width * 0.03;
      const boxH = img.height * 0.18;
      const x = pad;
      const y = img.height - boxH - pad;

      ctx.fillStyle = "rgba(0,0,0,0.6)";
      ctx.fillRect(x, y, img.width - pad * 2, boxH);

      ctx.fillStyle = "#fff";
      ctx.textBaseline = "top";

      const f1 = img.width * 0.04;
      const f2 = img.width * 0.026;

      ctx.font = `bold ${f1}px sans-serif`;
      ctx.fillText(`${meta.date} ${meta.time}`, x + 10, y + 10);

      ctx.font = `${f2}px sans-serif`;
      ctx.fillText(meta.locationName, x + 10, y + 10 + f1 + 5);

      ctx.fillText(
        `Lat: ${meta.lat.toFixed(6)} Lon: ${meta.lon.toFixed(6)}`,
        x + 10,
        y + 10 + f1 + 5 + f2 + 5
      );

      const mini = new Image();
      mini.onload = () => {
        ctx.drawImage(mini, img.width - pad - 84, y + 10, 84, 64);
        c.toBlob(b => resolve(b), "image/jpeg", 0.92);
      };
      mini.src = createMiniMapSVG(meta.lat, meta.lon);
    };

    img.src = dataUrl;
  });
}
