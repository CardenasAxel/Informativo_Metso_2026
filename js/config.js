/*
 * CONFIGURACIÓN EDITABLE
 * - APPS_SCRIPT_URL: URL /exec de la aplicación web de Apps Script que lee la hoja
 *   (ver GUIA_GOOGLE_SHEETS.md).
 * - Vacío = MODO DEMO: la página usa los datos FICTICIOS de "demo".
 */
const CONFIG = Object.freeze({
  APPS_SCRIPT_URL: "",

  // Mismas columnas que la hoja "Personas". Solo nombres inventados: nunca poner datos reales aquí.
  demo: [
    { nombre: "Ana Torres Ríos", rol: "Homenajeado", anios: "25", homenajeadoPor: "Carlos Mendoza Paz", mensaje: "" },
    { nombre: "Luis Quispe Huamán", rol: "Homenajeado", anios: "10", homenajeadoPor: "Carlos Mendoza Paz", mensaje: "Diez años haciendo que todo funcione. ¡Gracias, Luis!" },
    { nombre: "Carlos Mendoza Paz", rol: "Homenajeado", anios: "15", homenajeadoPor: "Jorge Ramos León", mensaje: "" },
    { nombre: "María Salas Vega", rol: "Invitado especial", anios: "", homenajeadoPor: "", mensaje: "" },
    { nombre: "Rosa Díaz Campos", rol: "", anios: "", homenajeadoPor: "", mensaje: "" }
  ]
});
