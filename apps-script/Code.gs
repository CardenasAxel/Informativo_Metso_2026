/**
 * Informativo · Ceremonia de Años de Servicio Metso
 * --------------------------------------------------
 * Script VINCULADO a la hoja de cálculo (Extensiones → Apps Script). Solo LEE.
 * Pasos en GUIA_GOOGLE_SHEETS.md.
 *
 * Implementar como aplicación web:
 *   - Ejecutar como: Yo
 *   - Quién tiene acceso: Cualquier usuario
 *
 * Fila 1 = encabezados. Se leen las columnas por POSICIÓN (el texto del encabezado no importa):
 *   Pestaña "Homenajeados": A Rol | B Años de servicio | C Nombre completo
 *   Pestaña "Jefatura":     A Rol | B Jefatura (entrega 1) | C Supervisor (entrega 2, "Apellido, Nombre")
 *                           | D Colaborador homenajeado | E Años que cumple
 *
 * Responde JSON:
 *   { ok: true, homenajeados: [{nombre, anios}], homenajes: [{jefe, supervisor, nombre, anios}] }
 *   o { ok: false, error: "<código>" }.
 * Solo se publican esas columnas; cualquier otra columna de la hoja NO sale.
 */

function doGet() {
  var libro = SpreadsheetApp.getActive();
  var h = libro.getSheetByName('Homenajeados'), j = libro.getSheetByName('Jefatura');
  if (!h || !j) return json_({ ok: false, error: 'sin_hoja' });

  var homenajeados = filas_(h)
    .filter(function (f) { return limpio_(f[2]); })
    .map(function (f) { return { nombre: limpio_(f[2]), anios: limpio_(f[1]) }; });

  var homenajes = filas_(j)
    .filter(function (f) { return limpio_(f[3]); })
    .map(function (f) {
      return { jefe: limpio_(f[1]), supervisor: alDerecho_(f[2]), nombre: limpio_(f[3]), anios: limpio_(f[4]) };
    });

  return json_({ ok: true, homenajeados: homenajeados, homenajes: homenajes });
}

function filas_(hoja) {
  return hoja.getDataRange().getDisplayValues().slice(1);
}

function limpio_(v) {
  return String(v == null ? '' : v).trim().slice(0, 200);
}

// "Olivas, Alex" → "Alex Olivas", para que coincida con la columna de Jefatura.
function alDerecho_(v) {
  var s = limpio_(v), i = s.indexOf(',');
  return i === -1 ? s : (s.slice(i + 1).trim() + ' ' + s.slice(0, i).trim()).trim();
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Ejecutar desde el editor para ver en el registro lo que publicarán las páginas.
function probar() {
  Logger.log(doGet().getContent());
}
