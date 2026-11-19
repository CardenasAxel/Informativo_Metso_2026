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
 * Pestaña "Personas", fila 1 = encabezados, columnas en este orden:
 *   A Nombres y Apellidos | B Rol | C Años de servicio | D Homenajeado por | E Mensaje
 *
 * Responde JSON: { ok: true, personas: [...] } o { ok: false, error: "<código>" }.
 * Solo se publican estas 5 columnas; cualquier otra columna de la hoja NO sale.
 */

var HOJA = 'Personas';

function doGet() {
  var hoja = SpreadsheetApp.getActive().getSheetByName(HOJA);
  if (!hoja) return json_({ ok: false, error: 'sin_hoja' });
  var personas = hoja.getDataRange().getDisplayValues().slice(1)
    .filter(function (f) { return String(f[0]).trim(); })
    .map(function (f) {
      return {
        nombre: limpio_(f[0]),
        rol: limpio_(f[1]),
        anios: limpio_(f[2]),
        homenajeadoPor: limpio_(f[3]),
        mensaje: limpio_(f[4])
      };
    });
  return json_({ ok: true, personas: personas });
}

function limpio_(v) {
  return String(v == null ? '' : v).trim().slice(0, 500);
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

// Ejecutar desde el editor para ver en el registro lo que publicará la página.
function probar() {
  Logger.log(doGet().getContent());
}
