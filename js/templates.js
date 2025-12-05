// templates.js
//
// SISTEMA DE PLANTILLAS PROFESIONAL PARA ESTAMPADO
// Cada plantilla define:
// - PNG base
// - Campos permitidos
// - Posiciones exactas de texto
// - Posición del mapa
// - Si usa coordenadas o no

export const templates = {
  
  // 🔵 PLANTILLA 1 — Estilo corporativo simple
  "corporate-simple": {
    png: "./templates/corporate-simple.png",

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
      date:     { x: 60,  y: 80  },
      time:     { x: 60,  y: 140 },
      timezone: { x: 60,  y: 200 },

      address:  { x: 60,  y: 260, maxWidth: 800 },

      coords:   { x: 60,  y: 320 },

      // Mapa miniatura
      map: {
        x: 900,
        y: 40,
        width: 260,
        height: 200
      }
    }
  },

  // 🔵 PLANTILLA 2 — Estilo minimalista negro
  "minimal
