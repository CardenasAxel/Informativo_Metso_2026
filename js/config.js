/*
 * CONFIGURACIÓN EDITABLE
 * - APPS_SCRIPT_URL: URL /exec de la aplicación web de Apps Script que lee la hoja
 *   (ver GUIA_GOOGLE_SHEETS.md).
 * - Vacío = MODO DEMO: las páginas usan los datos FICTICIOS de "demo".
 */
const CONFIG = Object.freeze({
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzrhn7Rq4aq81pZWHkjZ7_5mo5ujGu4CAZ5ckHjVmChkAtXnIPzPl2EJg1C7QIqbQ-X/exec",

  // Misma forma que responde Code.gs. Solo nombres inventados: nunca poner datos reales aquí.
  demo: {
    // Pestaña "Homenajeados" → página /homenajeados
    homenajeados: [
      { nombre: "Ana Torres Ríos", anios: "30" },
      { nombre: "Luis Quispe Huamán", anios: "10" },
      { nombre: "Carlos Mendoza Paz", anios: "5" },
      { nombre: "Elena Vargas Soto", anios: "20" },
      { nombre: "Pedro Rojas Lima", anios: "15" },
      { nombre: "Sofía Paredes Gil", anios: "5" },
      { nombre: "Raúl Chávez Ortiz", anios: "5" }
    ],
    // Pestaña "Jefatura" → página /homenajes (jefe y supervisor entregan el reconocimiento)
    homenajes: [
      { jefe: "Jorge Ramos", supervisor: "Rosa Díaz", nombre: "Ana Torres Ríos", anios: "30" },
      { jefe: "Jorge Ramos", supervisor: "Rosa Díaz", nombre: "Luis Quispe Huamán", anios: "10" },
      { jefe: "Jorge Ramos", supervisor: "", nombre: "Carlos Mendoza Paz", anios: "5" },
      { jefe: "Jorge Ramos", supervisor: "", nombre: "Sofía Paredes Gil", anios: "5" },
      { jefe: "Jorge Ramos", supervisor: "", nombre: "Raúl Chávez Ortiz", anios: "5" },
      { jefe: "María Salas", supervisor: "Jorge Ramos", nombre: "Elena Vargas Soto", anios: "20" },
      { jefe: "María Salas", supervisor: "María Salas", nombre: "Pedro Rojas Lima", anios: "15" }
    ]
  }
});
