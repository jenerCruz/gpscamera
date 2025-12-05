// ==========================================================
// app.js — CONTROL CENTRAL DE LA APLICACIÓN
// ==========================================================

import { startCamera, stream } from "./camera.js";
import { getGeoLocationReal } from "./geo.js";
import { reverseGeocode } from "./nominatim.js";
import { initDB, savePhoto, loadGallery } from "./db.js";
import { stampPhoto } from "./logicStamp.js";
import { addPhotoToGallery } from "./gallery.js";
import { showMessage } from "./utils.js";
import { templates, setTemplate } from "./templates.js";
import { generateRealMiniMap } from "./realMapMini.js";

// Estado
let fichajeMode = "directo";


// ==========================================================
// INICIALIZACIÓN
// ==========================================================
window.onload = async () => {
    await initDB();
    loadGallery();
    setMode("directo");

    // Registrar SW
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./sw.js")
        .then(() => console.log("SW listo"))
        .catch(err => console.warn("SW error:", err));
    }
};


// ==========================================================
// CONTROL DE MODO: DIRECTO / MANUAL
// ==========================================================
window.setMode = mode => {
    fichajeMode = mode;

    document.querySelectorAll(".tab-button")
        .forEach(b => b.classList.remove("active"));

    document.getElementById("tab-" + mode).classList.add("active");

    document
        .getElementById("manual-options")
        .classList.toggle("hidden", mode !== "manual");
};



// ==========================================================
// INICIAR CÁMARA
// ==========================================================
document.getElementById("start-camera").onclick = async () => {
    const video = document.getElementById("video");

    const ok = await startCamera(video);
    if (!ok) return showMessage("No se pudo acceder a la cámara", true);

    document.getElementById("take-photo").disabled = false;
    showMessage("Cámara lista");
};



// ==========================================================
// TOMAR FOTO
// ==========================================================
window.takePhoto = async () => {

    if (!stream) return showMessage("Cámara no activa", true);

    const canvas = document.getElementById("canvas");
    const video  = document.getElementById("video");
    const ctx    = canvas.getContext("2d");

    const track = stream.getVideoTracks()[0];
    const s = track.getSettings();

    canvas.width  = s.width  || video.videoWidth;
    canvas.height = s.height || video.videoHeight;

    ctx.drawImage(video, 0, 0);

    const basePhotoUrl = canvas.toDataURL("image/jpeg");

    // Fecha y hora
    const now  = new Date();
    const date = now.toLocaleDateString("es-ES");
    const time = now.toLocaleTimeString("es-ES");
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    // ==========================
    // GEO → MANUAL / DIRECTO
    // ==========================
    let lat = null;
    let lon = null;
    let address = "Sin dirección";

    if (fichajeMode === "manual") {
        const txtLocation = document.getElementById("manual-location-input").value.trim();
        const txtCoords   = document.getElementById("manual-coords").value.trim();

        if (txtLocation) address = txtLocation;

        if (txtCoords) {
            const [latS, lonS] = txtCoords.split(/[, ]+/);
            lat = parseFloat(latS);
            lon = parseFloat(lonS);
        } else {
            try {
                let geo = await getGeoLocationReal();
                lat = geo.lat;
                lon = geo.lon;
            } catch {}
        }

    } else {
        let geo = await getGeoLocationReal();
        lat = geo.lat;
        lon = geo.lon;
    }

    // ==========================
    // REVERSE GEOCODE REAL
    // ==========================
    if (lat && lon) {
        try {
            let rev = await reverseGeocode(lat, lon);
            address = rev.line1;
        } catch {
            address = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
        }
    }

    // ==========================
    // MAPA MINIATURA REAL
    // ==========================
    let miniMapUrl = null;
    if (lat && lon) {
        miniMapUrl = await generateRealMiniMap(lat, lon);
    }

    // ==========================
    // APLICAR ESTAMPADO
    // ==========================
    const stampedBlob = await stampPhoto(basePhotoUrl, {
        date,
        time,
        timezone,
        address,
        lat,
        lon
    }, miniMapUrl);

    // ==========================
    // GUARDAR EN INDEXEDDB
    // ==========================
    const record = {
        id: Date.now(),
        timestamp: Date.now(),
        metadata: { date, time, timezone, address, lat, lon },
        stampedPhotoBlob: stampedBlob
    };

    await savePhoto(record);
    addPhotoToGallery(record);

    showMessage("Fichaje guardado exitosamente");
};



// ==========================================================
// CAMBIAR PLANTILLA MANUALMENTE
// ==========================================================
window.changeTpl = name => {
    setTemplate(name);
    showMessage("Plantilla cambiada a: " + name);
};



// ==========================================================
// SUBIR PNG COMO PLANTILLA NUEVA (USUARIO FINAL)
// ==========================================================
const tplInput = document.getElementById("tpl-upload");
const tplPreview = document.getElementById("tpl-preview");

if (tplInput) {
    tplInput.addEventListener("change", async () => {

        const file = tplInput.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        tplPreview.src = url;

        const id = "user-" + file.name.replace(".png", "").toLowerCase();

        templates[id] = {
            png: url,

            fields: {
                date: true,
                time: true,
                timezone: true,
                address: true,
                coords: true,
                map: true
            },

            textStyle: {
                color: "#ffffff",
                font: "bold 32px Inter"
            },

            layout: {
                date:     { x: 60,  y: 80 },
                time:     { x: 60,  y: 140 },
                timezone: { x: 60,  y: 200 },
                address:  { x: 60,  y: 260, maxWidth: 650 },
                coords:   { x: 60,  y: 320 },
                map: {
                    x: 900,
                    y: 40,
                    width: 260,
                    height: 200
                }
            }
        };

        setTemplate(id);
        showMessage("✔ Plantilla personalizada cargada y activada");
    });
}
