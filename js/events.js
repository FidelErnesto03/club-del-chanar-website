/* ============================================================
   El Club del Chañar — Agenda (events.js)
   Carga, valida, ordena, filtra y renderiza los eventos.
   Fuente: agenda.endpoint (Apps Script) → data/events.json (fallback)
   Directriz v2.0 §20–§42, §58–§62
   ============================================================ */
(function () {
  "use strict";

  var LOCAL_FALLBACK = "data/events.json";
  var DEFAULT_LIMIT = 4;

  var cfg = null;
  var agenda = null;
  var state = { events: [], featured: null, rest: [], total: 0 };

  /* ---------- utilidades ---------- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === "className") node.className = attrs[k];
        else if (k === "textContent") node.textContent = attrs[k];
        else if (k === "innerHTML") node.innerHTML = attrs[k];
        else if (attrs[k] != null) node.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      (Array.isArray(children) ? children : [children]).forEach(function (c) {
        if (c == null) return;
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  function setText(selector, text) {
    var node = document.querySelector(selector);
    if (node && text != null) node.textContent = text;
  }

  /* -- Imágenes responsive desde manifest de derivados (V12) -- */
  function responsive(img, src, sizes) {
    if (!img) return;
    img.src = src;
    var m = window.ClubImgManifest;
    if (!m) return;
    var rel = String(src).replace(/^assets\/img\//, "");
    var widths = m[rel];
    if (!widths || !widths.length) return;
    var base = "assets/img/_derived/" + rel.replace(/\.webp$/, "");
    img.srcset = widths.map(function (w) { return base + "-" + w + ".webp " + w + "w"; }).join(", ");
    if (sizes) img.sizes = sizes;
  }

  /* ---------- analítica (§75–§76) ---------- */
  function track(name, params) {
    if (!cfg || !cfg.analytics || cfg.analytics.enabled === false) return;
    var eventName = (cfg.analytics.events && cfg.analytics.events[name]) || name;
    var payload = { event: eventName };
    if (params) { for (var k in params) payload[k] = params[k]; }
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
      if (typeof window.gtag === "function") window.gtag("event", eventName, payload);
    } catch (e) { /* la analítica nunca rompe la página */ }
  }

  /* ---------- validación (§60) ---------- */
  function isNonEmpty(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  /* Disponibilidad: ausente = desconocido; negativo se normaliza a 0; mayor a capacidad se limita (H07) */
  function normalizeAvailable(value, capacity) {
    if (value == null || value === "") return null;
    var n = Number(value);
    if (isNaN(n)) return null;
    if (n < 0) return 0;
    if (capacity > 0 && n > capacity) return capacity;
    return n;
  }

  function parseDate(value) {
    if (!isNonEmpty(value)) return null;
    /* Fechas "YYYY-MM-DD" se interpretan como locales para evitar el
       corrimiento de un día por zona horaria (UTC vs. AR). */
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
    var d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  /* Un evento mal cargado nunca rompe la página: se descarta en silencio. */
  function normalize(raw) {
    try {
      if (!raw || typeof raw !== "object") return null;
      if (!isNonEmpty(raw.id) || !isNonEmpty(raw.status) || !isNonEmpty(raw.title)) return null;
      var date = parseDate(raw.date); /* puede ser null: evento sin fecha (Fecha a confirmar) */

      var endDate = parseDate(raw.endDate) || date;
      if (endDate) endDate.setHours(23, 59, 59, 999);

      var status = String(raw.status).trim().toLowerCase();

      return {
        id: String(raw.id).trim(),
        status: status,
        featured: raw.featured === true || String(raw.featured).toLowerCase() === "true",
        category: isNonEmpty(raw.category) ? raw.category : "",
        title: String(raw.title).trim(),
        subtitle: isNonEmpty(raw.subtitle) ? raw.subtitle : "",
        shortDescription: isNonEmpty(raw.shortDescription)
          ? raw.shortDescription
          : (isNonEmpty(raw.subtitle) ? raw.subtitle : ""),
        teaser: isNonEmpty(raw.teaser) ? raw.teaser : "",
        longDescription: isNonEmpty(raw.longDescription) ? raw.longDescription : "",
        date: date,
        endDate: endDate,
        time: isNonEmpty(raw.time) ? raw.time : "",
        price: isNonEmpty(raw.priceLabel) ? raw.priceLabel : (raw.price != null ? String(raw.price) : ""),
        capacity: Number(raw.capacity) || 0,
        available: normalizeAvailable(raw.available, Number(raw.capacity) || 0),
        host: isNonEmpty(raw.host) ? raw.host : "",
        image: isNonEmpty(raw.image) ? raw.image : "",
        ctaLabel: isNonEmpty(raw.ctaLabel) ? raw.ctaLabel : "",
        tags: Array.isArray(raw.tags) ? raw.tags : []
      };
    } catch (e) {
      return null;
    }
  }

  /* ---------- imagen con fallback por categoría (§38) ---------- */
  function imageFor(event) {
    if (event.image) return event.image;
    var map = agenda.categoryDefaults || {};
    if (event.category && map[event.category]) return map[event.category];
    return agenda.defaultImage || "";
  }

  /* ---------- formato ---------- */
  function formatDay(date) {
    try {
      var parts = new Intl.DateTimeFormat("es-AR", {
        weekday: "short", day: "numeric", month: "short"
      }).format(date);
      return parts.replace(/\./g, "").replace(/,/g, "").toUpperCase();
    } catch (e) {
      return date.toISOString().slice(0, 10);
    }
  }

  function formatLong(date) {
    try {
      return new Intl.DateTimeFormat("es-AR", {
        day: "numeric", month: "long", year: "numeric"
      }).format(date);
    } catch (e) {
      return date.toISOString().slice(0, 10);
    }
  }

  /* ---------- WhatsApp (§40, §55) ---------- */
  function whatsappUrl(event) {
    var number = (cfg.contact && cfg.contact.whatsapp) || "";
    var lines = [];
    var greeting = isNonEmpty(agenda.eventGreeting) ? agenda.eventGreeting : "Hola. Quiero consultar por";
    lines.push(greeting + " “" + event.title + "” " +
      (isNonEmpty(agenda.eventClosing) ? agenda.eventClosing : "en El Club del Chañar."));
    if (event.date) lines.push(formatLong(event.date));
    var idLabel = isNonEmpty(agenda.eventIdLabel) ? agenda.eventIdLabel : "EVENTO";
    lines.push(idLabel + ": " + event.id);
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(lines.join("\n"));
  }

  /* ---------- selección y orden (§25, §61) ---------- */
  function selectEvents(list) {
    var now = new Date();
    var visible = list.filter(function (e) {
      /* §24: solo published/soldout se muestran; draft, cancelled y finished se excluyen en silencio */
      return e.status === "published" || e.status === "soldout";
    });
    /* Con fecha: solo los próximos (endDate >= hoy). Sin fecha: siempre visibles (Fecha a confirmar). */
    var dated = visible.filter(function (e) { return !!e.date && e.endDate >= now; });
    var undated = visible.filter(function (e) { return !e.date; });
    dated.sort(function (a, b) { return a.date - b.date; });
    var ordered = dated.concat(undated); /* los sin fecha van después de los que ya tienen fecha */

    var nearest = dated[0] || null;
    var featured = nearest;

    var featuredList = dated.filter(function (e) { return e.featured; });
    if (featuredList.length) {
      var candidate = featuredList[0]; /* el más próximo de los destacados */
      /* §61: no adelantar un destacado lejano sobre uno que sucede pronto */
      var windowMs = 45 * 24 * 60 * 60 * 1000;
      if (nearest && (candidate.date - nearest.date) <= windowMs) featured = candidate;
    }

    var rest = ordered.filter(function (e) { return e !== featured; });
    return { featured: featured, rest: rest, total: ordered.length, all: ordered };
  }

  /* ---------- render de una tarjeta (§23) ---------- */
  function buildCard(event, isFeatured) {
    var card = el("article", {
      className: "agenda-card" + (isFeatured ? " agenda-card--featured" : ""),
      "data-event-id": event.id,
      "data-event-card": event.id
    });

    var img = el("img", {
      className: "agenda-card__image",
      alt: event.title + (event.category ? " — " + event.category : "") + " en El Club del Chañar",
      loading: "lazy",
      decoding: "async"
    });
    responsive(img, imageFor(event), isFeatured ? "(min-width: 900px) 50vw, 100vw" : "(min-width: 900px) 33vw, 104px");
    card.appendChild(el("div", { className: "agenda-card__media" }, img));

    var body = el("div", { className: "agenda-card__body" });

    body.appendChild(el("p", { className: "agenda-card__date" + (event.date ? "" : " agenda-card__date--tbd"), textContent: event.date ? formatDay(event.date) : (agenda.dateTbdLabel || "Fecha a confirmar") }));
    if (event.category) body.appendChild(el("p", { className: "agenda-card__category", textContent: event.category.toUpperCase() }));
    var titleBtn = el("button", { type: "button", className: "agenda-card__title agenda-card__title-btn", textContent: event.title, "aria-haspopup": "dialog" });
    titleBtn.addEventListener("click", function () { openEventDetail(event, titleBtn); });
    body.appendChild(titleBtn);
    var teaser = event.teaser || event.shortDescription;
    if (teaser) body.appendChild(el("p", { className: "agenda-card__desc", textContent: teaser }));

    var soldOut = event.status === "soldout" || event.available === 0;
    var facts = el("ul", { className: "agenda-card__facts" });
    if (event.time) facts.appendChild(el("li", { textContent: event.time }));
    if (event.price) facts.appendChild(el("li", { textContent: event.price }));
    if (soldOut) {
      facts.appendChild(el("li", { className: "agenda-card__fact--soldout", textContent: agenda.soldoutLabel || "Agotado" }));
    } else if (event.available != null && event.available > 0) {
      facts.appendChild(el("li", {
        className: "agenda-card__fact--avail",
        textContent: event.available + " " + (agenda.availableSuffix || "lugares")
      }));
    } else {
      facts.appendChild(el("li", { className: "agenda-card__fact--unknown", textContent: agenda.availabilityUnknownLabel || "Cupos a confirmar" }));
    }
    if (facts.children.length) body.appendChild(facts);

    var ctaLabel = soldOut
      ? (agenda.waitlistLabel || "Lista de espera")
      : (event.ctaLabel || "Quiero participar");
    var cta = el("a", {
      className: "btn btn--primary agenda-card__cta",
      href: whatsappUrl(event),
      target: "_blank",
      rel: "noopener noreferrer",
      "data-event-cta": event.id
    });
    cta.appendChild(el("span", { textContent: ctaLabel }));
    cta.addEventListener("click", function () {
      track("click_event", { event_id: event.id, source: "agenda" });
      track("click_whatsapp", { event_id: event.id, source: "agenda" });
    });
    body.appendChild(cta);

    card.appendChild(body);
    return card;
  }

  /* ---------- Detalle de evento (modal accesible) ---------- */
  var eventModal = null, eventModalTrigger = null, eventModalFocusables = [];
  var modalBackground = [
    document.querySelector("header"),
    document.querySelector("main"),
    document.querySelector("footer"),
    document.querySelector(".mobile-cta")
  ];

  function setModalBackgroundInert(on) {
    modalBackground.forEach(function (n) {
      if (!n) return;
      if (on) n.setAttribute("inert", "");
      else n.removeAttribute("inert");
    });
  }

  function openEventDetail(event, trigger) {
    var modal = document.querySelector("[data-event-modal]");
    if (!modal) return;
    eventModal = modal; eventModalTrigger = trigger;
    setText("[data-event-category]", event.category ? event.category.toUpperCase() : "");
    setText("[data-event-title]", event.title);
    var meta = [];
    meta.push(event.date ? formatLong(event.date) : (agenda.dateTbdLabel || "Fecha a confirmar"));
    if (event.time) meta.push(event.time);
    if (event.status === "soldout" || event.available === 0) meta.push(agenda.soldoutLabel || "Agotado");
    else if (event.available != null && event.available > 0) meta.push(event.available + " " + (agenda.availableSuffix || "lugares"));
    else meta.push(agenda.availabilityUnknownLabel || "Cupos a confirmar");
    if (event.host) meta.push(event.host);
    setText("[data-event-meta]", meta.join(" · "));
    var desc = [event.shortDescription, event.longDescription].filter(isNonEmpty).join(" ");
    setText("[data-event-desc]", desc);
    var tagsEl = modal.querySelector("[data-event-tags]");
    if (tagsEl) {
      tagsEl.innerHTML = "";
      (event.tags || []).forEach(function (t) { tagsEl.appendChild(el("li", { textContent: t })); });
    }
    var cta = modal.querySelector("[data-event-cta]");
    if (cta) {
      cta.href = whatsappUrl(event);
      setText("[data-event-cta-label]", (event.status === "soldout" || event.available === 0)
        ? (agenda.waitlistLabel || "Lista de espera")
        : (event.ctaLabel || "Quiero participar"));
    }
    modal.hidden = false;
    modal.setAttribute("aria-modal", "true");
    setModalBackgroundInert(true);
    eventModalFocusables = Array.prototype.slice.call(modal.querySelectorAll("button, [href]"));
    var close = modal.querySelector("button[data-event-close]");
    if (close) close.focus();
  }

  function closeEventDetail() {
    if (!eventModal) return;
    eventModal.hidden = true;
    eventModal.removeAttribute("aria-modal");
    setModalBackgroundInert(false);
    if (eventModalTrigger) eventModalTrigger.focus();
    eventModal = null;
  }

  document.addEventListener("keydown", function (e) {
    if (!eventModal) return;
    if (e.key === "Escape") { closeEventDetail(); return; }
    if (e.key === "Tab") {
      var f = eventModalFocusables.filter(function (n) { return n.getClientRects().length; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- datos estructurados: Event (§64) ---------- */
  function ymd(d) {
    var m = d.getMonth() + 1, day = d.getDate();
    return d.getFullYear() + "-" + (m < 10 ? "0" : "") + m + "-" + (day < 10 ? "0" : "") + day;
  }

  function timeParts(str) {
    if (!isNonEmpty(str)) return { start: null, end: null };
    var parts = String(str).replace(/[–—]/g, "-").split("-");
    function pick(s) {
      var m = /(\d{1,2}):(\d{2})/.exec(s || "");
      return m ? (m[1].length < 2 ? "0" + m[1] : m[1]) + ":" + m[2] : null;
    }
    return { start: pick(parts[0]), end: pick(parts[1]) };
  }

  function eventSchema(list) {
    var base = (cfg.site && cfg.site.url) ? String(cfg.site.url).replace(/\/$/, "") : "";
    return list.filter(function (e) { return !!e.date; }).map(function (e) {
      var t = timeParts(e.time);
      var node = {
        "@type": "Event",
        "name": e.title,
        "startDate": ymd(e.date) + (t.start ? "T" + t.start + ":00-03:00" : ""),
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "location": {
          "@type": "Place",
          "name": "El Club del Chañar",
          "address": { "@type": "PostalAddress", "addressLocality": "Río Ceballos", "addressRegion": "Córdoba", "addressCountry": "AR" }
        },
        "description": e.shortDescription || e.subtitle || e.title,
        "organizer": { "@type": "Organization", "name": "El Club del Chañar", "url": base + "/" },
        "url": base + "/#agenda"
      };
      if (t.end) node.endDate = ymd(e.endDate) + "T" + t.end + ":00-03:00";
      var img = imageFor(e);
      if (img) node.image = img.indexOf("http") === 0 ? img : base + "/" + img;
      var kw = (e.tags && e.tags.length) ? e.tags.join(", ") : e.category;
      if (kw) node.keywords = kw;
      return node;
    });
  }

  function injectEventSchema(list) {
    var prev = document.querySelector('script[data-jsonld="events"]');
    if (prev && prev.parentNode) prev.parentNode.removeChild(prev);
    if (!list || !list.length) return;
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-jsonld", "events");
    script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": eventSchema(list) });
    document.head.appendChild(script);
  }

  /* ---------- render de la sección ---------- */
  function render() {
    var body = document.querySelector("[data-agenda-body]");
    var emptyEl = document.querySelector("[data-agenda-empty]");
    var actions = document.querySelector("[data-agenda-actions]");
    var section = document.getElementById("agenda");
    if (!body) return;

    var limit = Number(agenda.limit) || DEFAULT_LIMIT;
    var hasEvents = state.total > 0;

    body.innerHTML = "";

    if (!hasEvents) {
      if (agenda.hideWhenEmpty && section) section.hidden = true;
      if (emptyEl) emptyEl.hidden = false;
      if (actions) actions.hidden = true;
      injectEventSchema([]);
      return;
    }
    if (section) section.hidden = false;
    if (emptyEl) emptyEl.hidden = true;

    var cards = [];
    if (state.featured) cards.push(buildCard(state.featured, true));
    state.rest.slice(0, Math.max(0, limit - 1)).forEach(function (e) {
      cards.push(buildCard(e, false));
    });
    cards.forEach(function (c) { body.appendChild(c); });

    /* Adaptar la grilla al número real de eventos (CA-06) */
    var secondary = cards.length - 1;
    if (cards.length === 1) {
      body.classList.add("is-single");
      body.style.gridTemplateRows = "";
      var featOnly = body.querySelector(".agenda-card--featured");
      if (featOnly) featOnly.style.gridRow = "";
    } else {
      body.classList.remove("is-single");
      body.style.gridTemplateRows = "repeat(" + secondary + ", minmax(0, 1fr))";
      var feat = body.querySelector(".agenda-card--featured");
      if (feat) feat.style.gridRow = "1 / span " + secondary;
    }
    injectEventSchema(state.all);

    if (state.total > limit && actions) {
      actions.hidden = false;
      var more = actions.querySelector("[data-agenda-more]");
      if (more && !more.getAttribute("href").startsWith("http")) {
        var number = (cfg.contact && cfg.contact.whatsapp) || "";
        more.href = "https://wa.me/" + number + "?text=" +
          encodeURIComponent("Hola, quiero pedir la agenda completa de El Club del Chañar.");
        more.target = "_blank";
        more.rel = "noopener noreferrer";
      }
    } else if (actions) {
      actions.hidden = true;
    }

    track("view_event", { count: state.total, source: "agenda" });
  }

  /* ---------- carga de datos (§36) ---------- */
  function fetchJson(url, options) {
    return fetch(url, options).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }

  function extractEvents(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.events)) return data.events;
    return null;
  }

  function applyData(data) {
    var raw = extractEvents(data);
    if (!raw) throw new Error("estructura de eventos inválida");
    var normalized = [];
    raw.forEach(function (item) {
      var ev = normalize(item);
      if (ev) normalized.push(ev);
      else if (item && item.id) console.warn("Agenda: evento descartado por datos incompletos:", item.id);
    });
    var selected = selectEvents(normalized);
    state.featured = selected.featured;
    state.rest = selected.rest;
    state.total = selected.total;
    state.all = selected.all;
  }

  function load() {
    var endpoint = agenda && agenda.endpoint ? agenda.endpoint : "";
    var primary = endpoint
      ? fetchJson(endpoint, { method: "GET", cache: "no-store" })
      : Promise.reject(new Error("sin endpoint remoto"));

    return primary
      .then(applyData)
      .catch(function (err) {
        if (endpoint) console.warn("Agenda: endpoint remoto no disponible, se usa fallback local.", err && err.message);
        return fetchJson(LOCAL_FALLBACK, { cache: "no-store" }).then(applyData);
      })
      .catch(function (err) {
        console.warn("Agenda: no se pudieron cargar eventos.", err && err.message);
        state.featured = null; state.rest = []; state.total = 0;
      });
  }

  /* ---------- textos desde config ---------- */
  function hydrateTexts() {
    setText("[data-agenda-title]", agenda.title);
    setText("[data-agenda-subtitle]", agenda.subtitle);
    setText("[data-agenda-empty-title]", agenda.emptyTitle);
    setText("[data-agenda-empty-text]", agenda.emptyText);
    setText("[data-agenda-empty-cta-label]", agenda.emptyCtaLabel);
    setText("[data-agenda-more-label]", agenda.showMoreLabel);
    setText("[data-agenda-optin-label]", agenda.optinLabel);
    var optin = document.querySelector("[data-agenda-optin]");
    if (optin && cfg.contact && cfg.contact.whatsapp) {
      optin.href = "https://wa.me/" + cfg.contact.whatsapp + "?text=" +
        encodeURIComponent(agenda.optinMessage || "Hola, quiero que me avisen de nuevas experiencias en El Club del Chañar.");
    }

    var emptyCta = document.querySelector("[data-agenda-empty-cta]");
    if (emptyCta && cfg.contact && cfg.contact.whatsapp) {
      emptyCta.href = "https://wa.me/" + cfg.contact.whatsapp + "?text=" +
        encodeURIComponent("Hola, quiero enterarme de lo próximo en El Club del Chañar.");
      emptyCta.target = "_blank";
      emptyCta.rel = "noopener noreferrer";
    }
    if (emptyCta) {
      emptyCta.addEventListener("click", function () {
        track("click_whatsapp", { source: "agenda_empty" });
      });
    }
  }

  /* ---------- API pública ---------- */
  function init(config) {
    cfg = config || {};
    agenda = cfg.agenda || {};
    var section = document.getElementById("agenda");
    if (!section) return Promise.resolve();
    var modal = document.querySelector("[data-event-modal]");
    if (modal) modal.querySelectorAll("[data-event-close]").forEach(function (n) { n.addEventListener("click", closeEventDetail); });
    hydrateTexts();
    return load().then(function () { render(); });
  }

  window.ClubEvents = {
    init: init,
    render: render,
    track: track
  };
})();
