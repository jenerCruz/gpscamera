import { escapeHtml } from "./utils.js";

export function addPhotoToGallery(record) {
  const gallery = document.getElementById("gallery");
  const noPhotos = document.getElementById("no-photos");

  const img = URL.createObjectURL(record.stampedPhotoBlob);

  const el = document.createElement("div");
  el.className = "rounded-xl overflow-hidden shadow-md relative group";

  el.innerHTML = `
    <img src="${img}" class="w-full h-40 object-cover" />
    <div class="absolute inset-0 bg-black/30 flex items-end p-2">
      <div style="background:rgba(0,0,0,0.6);color:#fff;padding:6px;border-radius:6px">
        <div style="font-weight:600">${escapeHtml(record.metadata.locationName.line1)}</div>
        <div style="font-size:11px">${new Date(record.timestamp).toLocaleString()}</div>
      </div>
    </div>
  `;

  gallery.appendChild(el);
  noPhotos.classList.add("hidden");
}
