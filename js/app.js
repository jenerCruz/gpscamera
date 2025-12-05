import { startCamera, stream } from "./camera.js";
import { getGeoLocationReal } from "./geo.js";
import { reverseGeocode } from "./nominatim.js";
import { initDB, savePhoto } from "./db.js";
import { applyStampAndGetBlob } from "./stamp.js";
import { addPhotoToGallery } from "./gallery.js";
import { showMessage } from "./utils.js";

window.onload = async () => {
    await initDB();
    setMode("directo");
    loadGallery();

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./sw.js");
    }
};

document.getElementById("start-camera").onclick = async () => {
    const video = document.getElementById("video");
    const ok = await startCamera(video);
    if (!ok) return showMessage("No se pudo acceder a la cámara", true);

    document.getElementById("take-photo").disabled = false;
    showMessage("Cámara lista");
};

window.setMode = mode => {
  fichajeMode = mode;
  document.querySelectorAll(".tab-button").forEach(b => b.classList.remove("active"));
  document.getElementById("tab-" + mode).classList.add("active");

  document.getElementById("manual-options").classList.toggle("hidden", mode !== "manual");
};

window.takePhoto = async () => {
  const canvas = document.getElementById("canvas");
  const video = document.getElementById("video");
  const ctx = canvas.getContext("2d");

  const track = stream.getVideoTracks()[0];
  const s = track.getSettings();

  canvas.width = s.width || video.videoWidth;
  canvas.height = s.height || video.videoHeight;

  ctx.drawImage(video, 0, 0);

  const dataUrl = canvas.toDataURL("image/jpeg");

  const now = new Date();
  const date = now.toLocaleDateString("es-ES");
  const time = now.toLocaleTimeString("es-ES");

  let geo = await getGeoLocationReal();
  let rev = await reverseGeocode(geo.lat, geo.lon);

  const blob = await applyStampAndGetBlob(dataUrl, {
    lat: geo.lat,
    lon: geo.lon,
    date,
    time,
    locationName: rev.line1
  });

  const record = {
    id: Date.now(),
    timestamp: Date.now(),
    metadata: { lat: geo.lat, lon: geo.lon, date, time, locationName: rev.line1 },
    stampedPhotoBlob: blob
  };

  await savePhoto(record);
  addPhotoToGallery(record);
  showMessage("Fichaje guardado");
};
