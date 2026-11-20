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
  // "homenajeados": cada quien ve sus años. "homenajes": jefe/supervisor ve a quiénes reconoce.
  var HOMENAJES = document.body.dataset.pagina === "homenajes";
  var personas = [];
  var nombres = {}; // nombre normalizado → nombre tal como está en la hoja

  // Logo de aniversario (assets/img/anios-N). null si no hay logo para esos años.
  var LOGOS = ["5", "10", "15", "20", "30"];
  function logo(n) {
    if (LOGOS.indexOf(n) === -1) return null;
    var pic = document.createElement("picture");
    var src = document.createElement("source");
    src.type = "image/webp";
    src.srcset = "../assets/img/anios-" + n + ".webp";
    var img = document.createElement("img");
    img.src = "../assets/img/anios-" + n + ".png";
    img.alt = n + " " + anios(n);
    pic.append(src, img);
    return pic;
  }

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
      if (!d.ok || !Array.isArray(d.homenajeados) || !Array.isArray(d.homenajes)) throw new Error(d.error || "respuesta inválida");
      return d;
    });
  }

  cargar().then(function (d) {
    personas = HOMENAJES ? d.homenajes : d.homenajeados;
    // En /homenajes se busca a quien entrega (jefe o supervisor); en /homenajeados, al homenajeado.
    personas.forEach(function (p) {
      (HOMENAJES ? [p.jefe, p.supervisor] : [p.nombre]).forEach(function (n) {
        var k = norm(n);
        if (k && !nombres[k]) nombres[k] = String(n).trim();
      });
    });
    todos = Object.keys(nombres).map(function (k) { return nombres[k]; })
      .sort(function (a, b) { return a.localeCompare(b, "es"); });
    input.disabled = btn.disabled = false;
    input.placeholder = HOMENAJES ? "Ej.: Jorge Ramos" : "Ej.: Ana Torres";
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
    saludo.textContent = nombres[k];

    if (HOMENAJES) {
      // Agrupa por años (de más a menos): un logo por grupo y debajo todos sus nombres.
      var grupos = {};
      personas.forEach(function (p) {
        if (norm(p.jefe) !== k && norm(p.supervisor) !== k) return;
        (grupos[p.anios] = grupos[p.anios] || []).push(p.nombre);
      });
      var box = $("#homenajeados");
      box.replaceChildren();
      Object.keys(grupos).sort(function (a, b) { return b - a; }).forEach(function (n) {
        var g = document.createElement("div");
        g.className = "group";
        // El logo ya dice "N años"; sin logo, se escriben los años.
        var t = logo(n);
        if (!t) {
          t = document.createElement("p");
          t.className = "years-lbl";
          t.textContent = n + " " + anios(n);
        }
        var ul = document.createElement("ul");
        ul.className = "people";
        grupos[n].forEach(function (nombre) {
          var li = document.createElement("li");
          li.textContent = nombre;
          ul.appendChild(li);
        });
        g.append(t, ul);
        box.appendChild(g);
      });
    } else {
      var yo = personas.filter(function (p) { return norm(p.nombre) === k; })[0];
      var pic = logo(yo.anios);
      var txt = yo.anios + " " + anios(yo.anios);
      $("#logo").replaceChildren(pic || "");
      // El logo ya dice "N años"; sin logo, se escriben los años.
      $("#anios").textContent = (pic ? "" : txt + " ") + "de trayectoria en Metso";
      $("#anios-txt").textContent = txt;
    }

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
