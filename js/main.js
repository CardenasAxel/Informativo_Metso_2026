/*
 * Informativo: busca a la persona y muestra su participación según su rol.
 * Los datos vienen de la hoja de Google (Apps Script) o de CONFIG.demo.
 * Regla de seguridad: el contenido dinámico se inserta SOLO con textContent
 * o creando nodos. Nunca usar innerHTML con datos. Nunca mostrar lo que escribe el usuario.
 */
(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var $ = function (sel) { return document.querySelector(sel); };

  /* ---------- Aparición de secciones ---------- */
  var reveals = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Datos ---------- */
  // Compara nombres sin importar tildes, mayúsculas ni espacios de más.
  function norm(s) {
    return String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  }
  function anios(n) { return n === "1" ? "año" : "años"; }

  var form = $("#buscador"), input = $("#nombre"), btn = $("#ver"), err = $("#nombre-err");
  var resultado = $("#resultado"), saludo = $("#saludo");
  var MENSAJE = $("#mensaje").textContent;
  var personas = [];
  var nombres = {}; // nombre normalizado → nombre tal como está en la hoja

  function error(msg) {
    err.textContent = msg;
    err.hidden = !msg;
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
  }

  function cargar() {
    if (!CONFIG.APPS_SCRIPT_URL) {
      console.warn("[Informativo] MODO DEMO: APPS_SCRIPT_URL está vacío; se usan datos ficticios.");
      return Promise.resolve(CONFIG.demo);
    }
    return fetch(CONFIG.APPS_SCRIPT_URL).then(function (r) { return r.json(); }).then(function (d) {
      if (!d.ok || !Array.isArray(d.personas)) throw new Error(d.error || "respuesta inválida");
      return d.personas;
    });
  }

  cargar().then(function (lista) {
    personas = lista;
    // Quien homenajea aparece en la lista aunque no tenga fila propia en la hoja.
    lista.forEach(function (p) {
      [p.nombre, p.homenajeadoPor].forEach(function (n) {
        var k = norm(n);
        if (k && !nombres[k]) nombres[k] = String(n).trim();
      });
    });
    todos = Object.keys(nombres).map(function (k) { return nombres[k]; })
      .sort(function (a, b) { return a.localeCompare(b, "es"); });
    input.disabled = btn.disabled = false;
    input.placeholder = "Ej.: Ana Torres";
  }).catch(function (e) {
    console.error("[Informativo] No se pudo cargar la hoja:", e);
    input.placeholder = "";
    error("No pudimos cargar la lista. Recarga la página en unos minutos.");
  });

  /* ---------- Lista desplegable (patrón ARIA combobox) ---------- */
  var todos = [];     // nombres ordenados
  var visibles = [];  // nombres que coinciden con lo escrito
  var activo = -1;    // opción resaltada con el teclado
  var lista = $("#nombres");

  function abrir(si) {
    lista.hidden = !si;
    input.setAttribute("aria-expanded", String(si));
  }
  function pintar() {
    var k = norm(input.value);
    visibles = todos.filter(function (n) { return norm(n).indexOf(k) !== -1; });
    lista.replaceChildren();
    visibles.forEach(function (n, i) {
      var li = document.createElement("li");
      li.id = "op-" + i;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");
      li.textContent = n;
      lista.appendChild(li);
    });
    marcar(-1);
    abrir(visibles.length > 0);
  }
  function marcar(i) {
    activo = i;
    Array.prototype.forEach.call(lista.children, function (li, j) { li.setAttribute("aria-selected", String(j === i)); });
    if (i < 0) return input.removeAttribute("aria-activedescendant");
    input.setAttribute("aria-activedescendant", "op-" + i);
    lista.children[i].scrollIntoView({ block: "nearest" });
  }
  function elegir(i) {
    input.value = visibles[i];
    abrir(false);
    form.requestSubmit();
  }

  input.addEventListener("focus", pintar);
  input.addEventListener("click", function () { if (lista.hidden) pintar(); });
  input.addEventListener("input", function () { error(""); pintar(); });
  input.addEventListener("blur", function () { abrir(false); });
  input.addEventListener("keydown", function (e) {
    var n = visibles.length;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (lista.hidden) return pintar();
      marcar(e.key === "ArrowDown" ? Math.min(activo + 1, n - 1) : Math.max(activo - 1, 0));
    } else if (e.key === "Enter" && !lista.hidden && activo >= 0) {
      e.preventDefault();
      elegir(activo);
    } else if (e.key === "Escape") {
      abrir(false);
    }
  });
  // mousedown sin foco: el campo no pierde el foco al tocar la lista
  lista.addEventListener("mousedown", function (e) { e.preventDefault(); });
  lista.addEventListener("click", function (e) {
    var li = e.target.closest("li");
    if (li) elegir(Array.prototype.indexOf.call(lista.children, li));
  });

  /* ---------- Búsqueda ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    abrir(false);
    var k = norm(input.value);
    if (!k) return error("Escribe tu nombre o elígelo de la lista.");
    if (!nombres[k]) return error("No encontramos ese nombre. Elígelo de la lista.");
    error("");
    mostrar(k);
  });

  function mostrar(k) {
    var yo = personas.filter(function (p) { return norm(p.nombre) === k; })[0] || {};
    var rol = norm(yo.rol);
    var esHomenajeado = rol === "homenajeado" || rol === "homenajeada";
    var esEspecial = rol.indexOf("invitad") === 0;
    // Los invitados especiales (alta gerencia) no homenajean a nadie.
    var aCargo = esEspecial ? [] : personas.filter(function (p) { return norm(p.homenajeadoPor) === k; });

    saludo.textContent = nombres[k];

    $("#r-homenajeado").hidden = !esHomenajeado;
    if (esHomenajeado) {
      $("#anios").textContent = yo.anios;
      $(".years-lbl").textContent = anios(yo.anios) + " de servicio";
      $("#mensaje").textContent = yo.mensaje || MENSAJE;
    }

    $("#r-homenajeador").hidden = !aCargo.length;
    var ul = $("#homenajeados");
    ul.replaceChildren();
    aCargo.forEach(function (p) {
      var li = document.createElement("li");
      var n = document.createElement("span");
      n.textContent = p.nombre;
      li.appendChild(n);
      if (p.anios) {
        var y = document.createElement("span");
        y.className = "yrs";
        y.textContent = p.anios + " " + anios(p.anios);
        li.appendChild(y);
      }
      ul.appendChild(li);
    });

    $("#r-especial").hidden = !esEspecial;
    $("#r-ninguno").hidden = esHomenajeado || esEspecial || aCargo.length > 0;

    resultado.hidden = false;
    saludo.focus({ preventScroll: true });
    resultado.scrollIntoView();
  }

  $("#otro").addEventListener("click", function () {
    resultado.hidden = true;
    input.value = "";
    input.focus();
  });
})();
