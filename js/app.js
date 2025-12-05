import { startCamera, stream } from "./camera.js";
import { getGeoLocationReal } from "./geo.js";
import { reverseGeocode } from "./nominatim.js";
import { initDB, savePhoto } from "./db.js";
import { stampPhoto } from "./logicStamp.js";
import { getMiniMapOSM } from "./realMapMini.js";
import { activeTemplate } from "./templates.js";
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

    if (!ok) {
        return showMessage("No se pudo acceder a la cámara", true);
    }

    document.getElementById("take-photo").disabled = false;
    showMessage("Cámara lista");
};

window.setMode = mode => {
    fichajeMode = mode;

    document.querySelectorAll(".tab-button")
      .forEach(b => b.classList.remove("active"));

    document.getElementById("tab-" + mode).classList.add("active");
    document.getElementById("manual-options").classList.toggle("hidden", mode !== "manual");
};

window.takePhoto = async () => {
    const canvas = document.getElementById("canvas");
    const video = document.getElementById("video");
    const ctx = canvas.getContext("2d");

    // Tamaño del canvas basado en la cámara
    const track = stream.getVideoTracks()[0];
    const s = track.getSettings();

    canvas.width = s.width || video.videoWidth;
    canvas.height = s.height || video.videoHeight;

    // Dibujar la imagen capturada
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg");

    // === METADATA ===
    const now = new Date();
    const date = now.toLocaleDateString("es-ES");
    const time = now.toLocaleTimeString("es-ES");
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // GPS real
    const geo = await getGeoLocationReal();
    const lat = geo.lat;
    const lon = geo.lon;

    // Reverse geocode
    const rev = await reverseGeocode(lat, lon);

    // Construir dirección completa
    const address = [
        rev.road || "",
        rev.house_number || "",
        rev.neighbourhood || rev.suburb || "",
        rev.city || rev.town || "",
        rev.county || "",
        rev.state || "",
        rev.country || ""
    ].filter(Boolean).join(", ");

    // === MINI MAPA REAL (solo si plantilla lo soporta) ===
    let miniMapUrl = null;

    if (activeTemplate.fields.map) {
        miniMapUrl = await getMiniMapOSM(
            lat,
            lon,
            activeTemplate.layout.map.width,
            activeTemplate.layout.map.height
        );
    }

    // === CREAR FOTO FINAL ESTAMPADA ===
    const stampedBlob = await stampPhoto(
        dataUrl,
        {
            lat,
            lon,
            date,
            time,
            timezone,
            address
        },
        miniMapUrl
    );

    // === GUARDAR REGISTRO EN DB ===
    const record = {
        id: Date.now(),
        timestamp: Date.now(),
        metadata: { lat, lon, date, time, timezone, address },
        stampedPhotoBlob: stampedBlob
    };

    await savePhoto(record);
    addPhotoToGallery(record);

    showMessage("Fichaje guardado");
};
