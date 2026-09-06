/* ============================================================
   El Club del Chañar — Casa Abierta
   JS-driven: config.json as SINGLE source of truth (§13)
   Populates: hero, certainty, encounters, casa,
   coordination, gallery, FAQ, form, footer — all from config
   ============================================================ */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* -- Helpers -- */
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === "className") node.className = attrs[k];
        else if (k === "textContent") node.textContent = attrs[k];
        else if (k === "innerHTML") node.innerHTML = attrs[k];
        else if (k.indexOf("data-") === 0) node.setAttribute(k, attrs[k]);
        else node.setAttribute(k, attrs[k]);
      }
    }
    if (children) {
      if (!Array.isArray(children)) children = [children];
      children.forEach(function (c) {
        if (c == null) return;
        node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  function init() {
    fetch("data/config.json?v=14")
      .then(function (r) { return r.json(); })
      .then(function (cfg) { bootstrap(cfg); })
      .catch(function (err) {
        console.error("config.json load failed:", err);
        document.documentElement.classList.add("is-ready");
      });
  }

  function bootstrap(cfg) {
    if (!cfg) { root.classList.add("is-ready"); return; }

    /* ============================================================
       Populate ALL content from config (AC-1: single source)
       ============================================================ */

    /* -- Hero + carrusel + logo -- */
    if (cfg.hero) {
      /* Carrusel: poblar slides desde config */
      var carouselImages = cfg.hero.carousel || [cfg.hero.image];
      var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
      carouselImages.forEach(function (src, i) {
        if (slides[i]) {
          slides[i].src = src;
          slides[i].alt = i === 0 ? (cfg.hero.imageAlt || "") : "";
        }
      });

      setText("[data-hero-title]", cfg.hero.title);
      setText("[data-hero-subtitle]", cfg.hero.subtitle);
      setText("[data-hero-facts]", cfg.hero.facts);
      setText("[data-hero-cta-primary-text]", cfg.hero.ctaPrimary);
      setText("[data-hero-cta-secondary-text]", cfg.hero.ctaSecondary);
    }

    /* -- Hero location (clickeable a Google Maps) -- */
    if (cfg.location) {
      var locEl = document.querySelector("[data-hero-location]");
      if (locEl) {
        if (cfg.contact && cfg.contact.mapsUrl) {
          locEl.innerHTML = cfg.location.publicLabel.replace(" · ", "<br />");
          locEl.href = cfg.contact.mapsUrl;
        } else {
          locEl.hidden = true;
        }
      }
    }

    /* -- Scene tabs + stage -- */
    var scenes = {};
    if (cfg.experiences) {
      var tabsContainer = document.querySelector("[data-scene-tabs]");
      if (tabsContainer) {
        tabsContainer.innerHTML = "";
        cfg.experiences.forEach(function (exp, i) {
          scenes[exp.id] = {
            src: exp.image,
            alt: exp.imageAlt,
            message: exp.message,
            capacity: String(exp.capacity),
            cta: exp.cta,
            type: exp.id,
            shifts: exp.shifts || []
          };
          var btn = el("button", {
            className: "scene-tab" + (i === 0 ? " is-active" : ""),
            type: "button",
            role: "tab",
            id: "scene-tab-" + exp.id,
            "aria-selected": i === 0 ? "true" : "false",
            "aria-controls": "scene-stage",
            tabindex: i === 0 ? "0" : "-1",
            "data-scene": exp.id,
            textContent: exp.verb
          });
          tabsContainer.appendChild(btn);
        });
      }
    }

    /* -- El Club: menú gráfico + galería con auto-carga -- */
    var casaSpaces = cfg.casa || [];
    var casaState = { active: -1, images: [], index: 0 };

    var casaMenu = document.querySelector("[data-casa-menu]");
    var casaCards = document.querySelector("[data-casa-cards]");
    var casaHeader = document.querySelector("[data-casa-header]");
    var casaGallery = document.querySelector("[data-casa-gallery]");
    var casaImage = document.querySelector("[data-casa-image]");
    var casaName = document.querySelector("[data-casa-name]");
    var casaPhrase = document.querySelector("[data-casa-phrase]");
    var casaFacts = document.querySelector("[data-casa-facts]");
    var casaDots = document.querySelector("[data-casa-dots]");
    var casaPrev = document.querySelector("[data-casa-prev]");
    var casaNext = document.querySelector("[data-casa-next]");
    var casaBack = document.querySelector("[data-casa-back]");

    /* Poblar tarjetas del menú */
    if (casaCards && casaSpaces.length) {
      casaCards.innerHTML = "";
      casaSpaces.forEach(function (space, i) {
        var card = document.createElement("button");
        card.type = "button";
        card.className = "casa__card";
        card.setAttribute("data-space-index", i);
        var img = document.createElement("img");
        img.src = space.imageDir + "01.webp";
        img.alt = space.imageAlt;
        img.loading = "lazy";
        card.appendChild(img);
        var label = document.createElement("span");
        label.className = "casa__card-label";
        label.textContent = space.name;
        card.appendChild(label);
        card.addEventListener("click", function () { openCasaGallery(i); });
        casaCards.appendChild(card);
      });
    }

    /* Auto-cargar imágenes de un directorio (01.webp, 02.webp, ... hasta 404) */
    function loadCasaImages(dir, callback) {
      var images = [];
      var idx = 1;
      function tryNext() {
        var num = idx < 10 ? "0" + idx : "" + idx;
        var src = dir + num + ".webp";
        var img = new Image();
        img.onload = function () {
          images.push(src);
          idx++;
          tryNext();
        };
        img.onerror = function () {
          callback(images);
        };
        img.src = src;
      }
      tryNext();
    }

    /* Abrir galería de un espacio */
    function openCasaGallery(i) {
      casaState.active = i;
      casaState.index = 0;
      var space = casaSpaces[i];
      loadCasaImages(space.imageDir, function (images) {
        casaState.images = images;
        casaState.index = 0;
        /* Llenar info */
        if (casaName) casaName.textContent = space.name;
        if (casaPhrase) casaPhrase.textContent = space.phrase;
        if (casaFacts) {
          casaFacts.innerHTML = "";
          (space.facts || []).forEach(function (f) {
            casaFacts.appendChild(el("li", { textContent: f }));
          });
        }
        /* Dots */
        if (casaDots) {
          casaDots.innerHTML = "";
          images.forEach(function (_, di) {
            var dot = el("button", {
              type: "button",
              className: "casa__dot" + (di === 0 ? " is-active" : ""),
              "data-dot-index": di
            });
            dot.addEventListener("click", function () { casaGoTo(di); });
            casaDots.appendChild(dot);
          });
        }
        /* Mostrar primera imagen */
        showCasaImage(0);
        /* Transición: ocultar menú y header, mostrar galería */
        if (casaMenu) casaMenu.classList.add("is-hidden");
        if (casaHeader) casaHeader.classList.add("is-hidden");
        if (casaGallery) {
          casaGallery.hidden = false;
          /* Forzar reflow para que la transición funcione */
          void casaGallery.offsetWidth;
          casaGallery.classList.add("is-visible");
        }
        updateCasaNav();
      });
    }

    /* Cerrar galería y volver al menú */
    function closeCasaGallery() {
      if (casaGallery) {
        casaGallery.classList.remove("is-visible");
        setTimeout(function () {
          casaGallery.hidden = true;
        }, 400);
      }
      if (casaMenu) casaMenu.classList.remove("is-hidden");
      if (casaHeader) casaHeader.classList.remove("is-hidden");
      casaState.active = -1;
    }

    /* Mostrar imagen en posición i */
    function showCasaImage(i) {
      if (!casaImage || !casaState.images.length) return;
      casaImage.classList.add("is-swapping");
      setTimeout(function () {
        casaImage.src = casaState.images[i];
        casaImage.alt = casaSpaces[casaState.active].imageAlt;
        casaImage.classList.remove("is-swapping");
      }, 200);
      casaState.index = i;
      /* Actualizar dots */
      var dots = casaDots ? casaDots.querySelectorAll(".casa__dot") : [];
      dots.forEach(function (dot, di) {
        dot.classList.toggle("is-active", di === i);
      });
      updateCasaNav();
    }

    function casaGoTo(i) {
      if (i < 0 || i >= casaState.images.length) return;
      showCasaImage(i);
    }

    function casaNextImg() {
      if (casaState.index < casaState.images.length - 1) showCasaImage(casaState.index + 1);
    }

    function casaPrevImg() {
      if (casaState.index > 0) showCasaImage(casaState.index - 1);
    }

    function updateCasaNav() {
      if (casaPrev) casaPrev.disabled = casaState.index === 0;
      if (casaNext) casaNext.disabled = casaState.index === casaState.images.length - 1;
    }

    if (casaPrev) casaPrev.addEventListener("click", casaPrevImg);
    if (casaNext) casaNext.addEventListener("click", casaNextImg);
    if (casaBack) casaBack.addEventListener("click", closeCasaGallery);

    /* Botón ampliar — abre el lightbox compartido */
    var casaExpand = document.querySelector("[data-casa-expand]");
    if (casaExpand) {
      casaExpand.addEventListener("click", function () {
        if (!lightbox) return;
        var space = casaSpaces[casaState.active];
        if (!space || !casaState.images.length) return;
        lbData = casaState.images.map(function (src, idx) {
          return { src: src, alt: space.imageAlt, caption: idx === 0 ? space.name + " — " + space.phrase : space.name };
        });
        openLightbox(casaState.index, casaExpand);
      });
    }

    /* Teclado: flechas para navecar, Escape para salir */
    document.addEventListener("keydown", function (e) {
      if (casaState.active < 0) return;
      if (e.key === "ArrowLeft") casaPrevImg();
      else if (e.key === "ArrowRight") casaNextImg();
      else if (e.key === "Escape") closeCasaGallery();
    });

    /* -- Coordination steps -- */
    var stepIcons = {
      chat: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
      calendar: '<rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
      home: '<path d="M3 12l9-8 9 8M5 10v10h14V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
      check: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M22 4L12 14.01l-3-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
    };
    if (cfg.coordination) {
      var stepsContainer = document.querySelector("[data-coordination-steps]");
      if (stepsContainer) {
        stepsContainer.innerHTML = "";
        cfg.coordination.forEach(function (item, i) {
          var text = typeof item === "string" ? item : item.step;
          var detail = typeof item === "object" && item.detail ? item.detail : "";
          var iconKey = typeof item === "object" && item.icon ? item.icon : "";
          var li = el("li");
          var number = el("span", { className: "step__number", textContent: String(i + 1) });
          if (detail) {
            number.setAttribute("tabindex", "0");
            number.setAttribute("aria-label", text);
          }
          li.appendChild(number);
          if (iconKey && stepIcons[iconKey]) {
            var iconSvg = el("span", { className: "step__icon", innerHTML: '<svg viewBox="0 0 24 24" aria-hidden="true">' + stepIcons[iconKey] + "</svg>" });
            li.appendChild(iconSvg);
          }
          li.appendChild(el("p", { textContent: text }));
          if (detail) {
            var tooltip = el("span", { className: "step__tooltip", textContent: detail });
            tooltip.setAttribute("id", "step-tooltip-" + (i + 1));
            tooltip.setAttribute("role", "tooltip");
            li.appendChild(tooltip);
            number.setAttribute("aria-describedby", "step-tooltip-" + (i + 1));
          }
          stepsContainer.appendChild(li);
        });
        /* Reveal animado al entrar en viewport */
        if ("IntersectionObserver" in window) {
          var stepsObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                stepsContainer.classList.add("is-revealed");
                stepsObserver.unobserve(stepsContainer);
              }
            });
          }, { threshold: 0.3 });
          stepsObserver.observe(stepsContainer);
        } else {
          stepsContainer.classList.add("is-revealed");
        }
      }
    }

    /* -- Experiencias: carrusel automático con descubrimiento dinámico -- */
    var galleryData = [];
    var carousel = document.querySelector("[data-gallery-carousel]");
    var dotsContainer = document.querySelector("[data-gallery-dots]");
    var galleryIndex = 0;
    var galleryTimer = null;
    var galleryInterval = 5000;

    function buildGalleryCarousel(items) {
      if (!carousel || !items.length) return;
      var exp = cfg.experiencias || {};
      var altBase = exp.alt || "Encuentro real en El Club del Chañar";

      galleryData = items.map(function (item) {
        return { src: item.src, alt: altBase, caption: item.caption || "" };
      });

      /* Slides */
      carousel.innerHTML = "";
      items.forEach(function (item, i) {
        var slide = el("div", { className: "gallery__slide" + (i === 0 ? " is-active" : "") });
        slide.appendChild(el("img", { src: item.src, alt: altBase, loading: "lazy" }));
        if (item.caption) {
          slide.appendChild(el("div", { className: "gallery__slide-caption", textContent: item.caption }));
        }
        carousel.appendChild(slide);
      });

      /* Dots */
      if (dotsContainer) {
        dotsContainer.innerHTML = "";
        items.forEach(function (item, i) {
          var dot = el("button", {
            className: "gallery__dot" + (i === 0 ? " is-active" : ""),
            type: "button",
            "aria-label": "Ir a la imagen " + (i + 1),
            "data-gallery-dot": String(i)
          });
          dotsContainer.appendChild(dot);
        });
      }

      /* Click en slide — abrir lightbox */
      carousel.addEventListener("click", function () {
        if (lightbox && galleryData.length) {
          lbData = galleryData;
          openLightbox(galleryIndex, carousel);
        }
      });

      /* Pausa en hover/focus — WCAG 2.2.2 */
      carousel.addEventListener("mouseenter", stopGalleryAuto);
      carousel.addEventListener("mouseleave", startGalleryAuto);
      carousel.addEventListener("focusin", stopGalleryAuto);
      carousel.addEventListener("focusout", startGalleryAuto);

      /* Auto-play solo cuando está visible */
      if ("IntersectionObserver" in window) {
        var galleryAutoObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) startGalleryAuto();
            else stopGalleryAuto();
          });
        }, { threshold: 0.3 });
        galleryAutoObserver.observe(carousel);
      } else {
        startGalleryAuto();
      }
    }

    function showGallerySlide(idx) {
      var slides = carousel ? carousel.querySelectorAll(".gallery__slide") : [];
      var dots = dotsContainer ? dotsContainer.querySelectorAll(".gallery__dot") : [];
      slides.forEach(function (s, si) { s.classList.toggle("is-active", si === idx); });
      dots.forEach(function (d, di) { d.classList.toggle("is-active", di === idx); });
      galleryIndex = idx;
    }

    function nextGallerySlide() {
      if (galleryData.length) showGallerySlide((galleryIndex + 1) % galleryData.length);
    }

    function startGalleryAuto() {
      if (galleryTimer) return;
      galleryTimer = setInterval(nextGallerySlide, galleryInterval);
    }

    function stopGalleryAuto() {
      if (galleryTimer) { clearInterval(galleryTimer); galleryTimer = null; }
    }

    /* Click en dot — ir a esa imagen y reiniciar timer */
    if (dotsContainer) {
      dotsContainer.addEventListener("click", function (e) {
        var dot = e.target.closest("[data-gallery-dot]");
        if (!dot) return;
        var idx = parseInt(dot.getAttribute("data-gallery-dot"), 10);
        showGallerySlide(idx);
        stopGalleryAuto();
        startGalleryAuto();
      });
    }

    /* Descubrir imágenes: index.json (carga paralela) con fallback secuencial */
    if (cfg.experiencias && cfg.experiencias.imageDir) {
      var expDir = cfg.experiencias.imageDir;
      var expItems = [];

      /* Carga paralela via index.json */
      fetch(expDir + "index.json")
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (files) {
          if (!files || !files.length) throw new Error("no index");
          /* Cargar todas las imágenes + captions en paralelo */
          return Promise.all(files.map(function (fname) {
            var num = fname.replace(/\.\w+$/, "");
            var src = expDir + fname;
            var txtSrc = expDir + num + ".txt";
            return fetch(txtSrc)
              .then(function (r) { return r.ok ? r.text() : ""; })
              .then(function (text) { return { src: src, caption: text.trim() }; })
              .catch(function () { return { src: src, caption: "" }; });
          }));
        })
        .then(function (items) {
          expItems = items;
          buildGalleryCarousel(expItems);
        })
        .catch(function () {
          /* Fallback: descubrimiento secuencial (01.webp, 02.webp, ... hasta 404) */
          var expIdx = 1;
          function tryNextExp() {
            var num = expIdx < 10 ? "0" + expIdx : "" + expIdx;
            var src = expDir + num + ".webp";
            var txtSrc = expDir + num + ".txt";
            var img = new Image();
            img.onload = function () {
              fetch(txtSrc)
                .then(function (r) { return r.ok ? r.text() : ""; })
                .then(function (text) {
                  expItems.push({ src: src, caption: text.trim() });
                })
                .catch(function () {
                  expItems.push({ src: src, caption: "" });
                })
                .finally(function () {
                  expIdx++;
                  tryNextExp();
                });
            };
            img.onerror = function () {
              buildGalleryCarousel(expItems);
            };
            img.src = src;
          }
          tryNextExp();
        });
    }

    /* -- FAQ -- */
    if (cfg.faq) {
      var faqContainer = document.querySelector("[data-faq-list]");
      if (faqContainer) {
        faqContainer.innerHTML = "";
        cfg.faq.forEach(function (item, i) {
          var div = el("div", { className: "faq__item" });
          var btn = el("button", {
            className: "faq__question",
            type: "button",
            "aria-expanded": "false",
            "aria-controls": "faq-" + i
          });
          btn.appendChild(el("span", { textContent: item.question }));
          btn.appendChild(el("svg", { className: "faq__icon", "aria-hidden": "true", viewBox: "0 0 24 24" }));
          var answer = el("div", { className: "faq__answer", id: "faq-" + i, role: "region" });
          var answerInner = el("div", { className: "faq__answer-inner" });
          answerInner.appendChild(el("p", { textContent: item.answer }));
          answer.appendChild(answerInner);
          div.appendChild(btn);
          div.appendChild(answer);
          faqContainer.appendChild(div);
        });
      }
    }

    /* -- FAQ: bloque de ubicación + reveal -- */
    var faqLocation = document.querySelector("[data-faq-location]");
    if (faqLocation && cfg.location) {
      var locLabel = document.querySelector("[data-faq-location-label]");
      var locAddress = document.querySelector("[data-faq-location-address]");
      var locAccess = document.querySelector("[data-faq-location-access]");
      var locCta = document.querySelector("[data-faq-location-cta]");
      if (locLabel) locLabel.textContent = "Dónde estamos";
      if (locAddress) locAddress.textContent = cfg.location.publicLabel || "";
      if (locAccess) locAccess.textContent = "Acceso por camino de tierra, a 3 cuadras de la ruta E-53. La ubicación exacta se comparte al coordinar la visita.";
      if (locCta && cfg.contact && cfg.contact.mapsUrl) {
        locCta.href = cfg.contact.mapsUrl;
      } else if (locCta) {
        locCta.style.display = "none";
      }
    }

    /* Reveal animado para FAQ */
    var faqHeading = document.querySelector(".faq__heading");
    var faqList = document.querySelector(".faq__list");
    if ("IntersectionObserver" in window) {
      var faqObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            if (faqHeading) faqHeading.classList.add("is-revealed");
            if (faqList) faqList.classList.add("is-revealed");
            if (faqLocation) faqLocation.classList.add("is-revealed");
            faqObserver.disconnect();
          }
        });
      }, { threshold: 0.15 });
      if (faqList) faqObserver.observe(faqList);
    } else {
      if (faqHeading) faqHeading.classList.add("is-revealed");
      if (faqList) faqList.classList.add("is-revealed");
      if (faqLocation) faqLocation.classList.add("is-revealed");
    }

    /* -- Inquiry form -- */
    if (cfg.inquiry) {
      setText("[data-inquiry-title]", cfg.inquiry.title);
      setText("[data-inquiry-intro]", cfg.inquiry.intro);
      setText("[data-submit-label]", cfg.inquiry.submitLabel);
      setText("[data-preparing-label]", cfg.inquiry.preparingLabel);
      setText("[data-success-label]", cfg.inquiry.successLabel || "Tu consulta está en camino.");
      setText("[data-success-home-label]", cfg.inquiry.successHomeLabel || "Volver al inicio");
      setText("[data-success-again-label]", cfg.inquiry.successAgainLabel || "Hacer otra consulta");
      setText("[data-submit-note]", cfg.inquiry.submitNote);

      /* WhatsApp directo link */
      var waDirect = document.querySelector("[data-wa-direct]");
      var waDirectLabel = document.querySelector("[data-wa-direct-label]");
      if (waDirect && cfg.contact && cfg.contact.whatsapp) {
        var waText = "Hola, me gustaría consultar una fecha para un encuentro en El Club del Chañar.";
        waDirect.href = "https://wa.me/" + cfg.contact.whatsapp + "?text=" + encodeURIComponent(waText);
      }
      if (waDirectLabel) waDirectLabel.textContent = cfg.inquiry.waDirectLabel || "o escribinos directo por WhatsApp";

      /* Reveal animado para consult */
      var consultLead = document.querySelector(".consult__lead");
      var inquiryForm = document.querySelector(".inquiry");
      if ("IntersectionObserver" in window) {
        var consultObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              if (consultLead) consultLead.classList.add("is-revealed");
              if (inquiryForm) inquiryForm.classList.add("is-revealed");
              consultObserver.disconnect();
            }
          });
        }, { threshold: 0.15 });
        if (inquiryForm) consultObserver.observe(inquiryForm);
      } else {
        if (consultLead) consultLead.classList.add("is-revealed");
        if (inquiryForm) inquiryForm.classList.add("is-revealed");
      }

      /* Field labels, placeholders from config (flat fields array) */
      if (cfg.inquiry.fields) {
        cfg.inquiry.fields.forEach(function (field) {
          var labelEl = document.querySelector('[data-field-label="' + field.name + '"]');
          if (labelEl) labelEl.textContent = field.label;
          var placeholderEl = document.querySelector('[data-field-placeholder="' + field.name + '"]');
          if (placeholderEl && field.placeholder) placeholderEl.placeholder = field.placeholder;
        });
      }

      /* Event type select — populated from config */
      var eventTypeSelect = document.querySelector("[data-event-type-select]");
      var eventTypePlaceholder = document.querySelector("[data-event-type-placeholder]");
      if (eventTypePlaceholder && cfg.inquiry.eventTypePlaceholder) eventTypePlaceholder.textContent = cfg.inquiry.eventTypePlaceholder;
      var eventTypeField = cfg.inquiry.fields.find(function (f) { return f.name === "eventType"; });
      if (eventTypeSelect && eventTypeField && eventTypeField.options) {
        eventTypeField.options.forEach(function (opt) {
          var optEl = el("option", { value: opt.value, textContent: opt.label });
          eventTypeSelect.appendChild(optEl);
        });
      }

      /* Shift placeholder + options for step 2 */
      var shiftPlaceholder = document.querySelector("[data-shift-placeholder]");
      if (shiftPlaceholder) shiftPlaceholder.textContent = cfg.inquiry.shiftLockedPlaceholder || cfg.inquiry.shiftPlaceholder || "";
      if (cfg.shifts) {
        var shiftSelect = document.querySelector('select[name="shift"]');
        if (shiftSelect) {
          cfg.shifts.forEach(function (s) {
            var opt = el("option", {
              value: s.label,
              "data-for": s.for,
              textContent: s.label
            });
            shiftSelect.appendChild(opt);
          });
        }
      }
    }

    /* -- Footer -- */
    if (cfg.footer) {
      setText("[data-footer-notice]", cfg.footer.notice);
      var footerNav = document.querySelector("[data-footer-nav]");
      if (footerNav && cfg.footer.nav) {
        footerNav.innerHTML = "";
        cfg.footer.nav.forEach(function (n) {
          footerNav.appendChild(el("a", { href: n.href, textContent: n.label }));
        });
      }
    }
    if (cfg.contact) {
      var footerContact = document.querySelector("[data-footer-contact]");
      if (footerContact) {
        footerContact.innerHTML = "";
        var waLink = el("a", {
          href: "https://wa.me/" + cfg.contact.whatsapp,
          target: "_blank",
          rel: "noopener noreferrer",
          textContent: (cfg.footer && cfg.footer.whatsappLabel) ? cfg.footer.whatsappLabel : ""
        });
        var mailLink = el("a", {
          href: "mailto:" + cfg.contact.email,
          textContent: (cfg.footer && cfg.footer.emailLabel) ? cfg.footer.emailLabel : ""
        });
        footerContact.appendChild(waLink);
        footerContact.appendChild(mailLink);
      }
      /* Fallback WA link */
      var fbWa = document.querySelector("[data-fallback-wa]");
      if (fbWa) fbWa.href = "https://wa.me/" + cfg.contact.whatsapp;
    }
    if (cfg.location) {
      setText("[data-footer-location]", cfg.location.publicLabel);
    }

    /* -- Footer: back-to-top -- */
    var backToTop = document.querySelector("[data-back-to-top]");
    if (backToTop) {
      backToTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
      });
    }

    /* -- Mobile CTA text from config -- */
    if (cfg.hero && cfg.hero.ctaPrimary) {
      setText("[data-mobile-cta-text]", cfg.hero.ctaPrimary);
      setText("[data-mobile-menu-cta]", cfg.hero.ctaPrimary);
    }

    /* -- Fallback UI texts from config -- */
    if (cfg.ui) {
      setText("[data-fallback-notice]", cfg.ui.whatsappFallbackNotice);
      setText("[data-fallback-copy-label]", cfg.ui.whatsappFallbackCopyLabel);
      setText("[data-fallback-open-label]", cfg.ui.whatsappFallbackOpenLabel);
      setText("[data-scene-capacity-suffix]", cfg.ui.sceneCapacitySuffix);
    }

    /* ============================================================
       Interactions (now that content is populated)
       ============================================================ */

    /* -- Hero reveal + logo presentation + carrusel -- */
    var carouselTimer = 0;
    var carouselIndex = 0;
    var carouselSlides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var logoPresentation = document.querySelector("[data-hero-logo-presentation]");
    var watermark = document.querySelector("[data-hero-watermark]");

    function startCarousel() {
      if (carouselSlides.length <= 1) return;
      var interval = (cfg.hero && cfg.hero.carouselInterval) ? cfg.hero.carouselInterval : 7000;
      carouselTimer = setInterval(function () {
        var current = carouselSlides[carouselIndex];
        carouselIndex = (carouselIndex + 1) % carouselSlides.length;
        var next = carouselSlides[carouselIndex];
        if (current) current.classList.remove("is-active");
        if (next) next.classList.add("is-active");
      }, interval);
    }

    function revealHero() {
      if (reduceMotion.matches) {
        root.classList.add("is-ready");
        if (cfg.hero && cfg.hero.logoWatermark && watermark) watermark.hidden = false;
        startCarousel();
        return;
      }
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          root.classList.add("is-ready");

          /* Logo presentation: aparece después de que se abren las puertas */
          if (cfg.hero && cfg.hero.logoPresentation && logoPresentation) {
            setTimeout(function () {
              logoPresentation.hidden = false;
              /* Después de la animación (3200ms), mostrar marca de agua */
              setTimeout(function () {
                logoPresentation.hidden = true;
                if (cfg.hero && cfg.hero.logoWatermark && watermark) watermark.hidden = false;
                /* Iniciar carrusel después de la presentación del logo */
                startCarousel();
              }, 3200);
            }, 600);
          } else {
            /* Sin presentación de logo, iniciar carrusel directo */
            if (cfg.hero && cfg.hero.logoWatermark && watermark) watermark.hidden = false;
            startCarousel();
          }
        });
      });
    }
    if (document.readyState === "complete") revealHero();
    else window.addEventListener("load", revealHero, { once: true });

    /* -- Header scroll + scroll spy + mobile CTA -- */
    var masthead = document.querySelector("[data-masthead]");
    var mobileCta = document.querySelector("[data-mobile-cta]");
    var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav-link]"));
    var spySections = ["encuentros", "la-casa", "coordinacion", "experiencias", "preguntas", "consultar"];

    function updateActiveNav() {
      var scrollPos = window.scrollY + 120;
      var current = null;
      for (var i = 0; i < spySections.length; i++) {
        var sec = document.getElementById(spySections[i]);
        if (sec && sec.offsetTop <= scrollPos) current = spySections[i];
      }
      navLinks.forEach(function (link) {
        link.classList.toggle("is-active", link.getAttribute("data-nav-link") === current);
      });
    }

    if (masthead) {
      var consultSection = document.getElementById("consultar");
      var onScroll = function () {
        masthead.classList.toggle("is-scrolled", window.scrollY > 80);
        if (mobileCta) {
          var heroEl = document.querySelector(".hero");
          var pastHero = heroEl && window.scrollY > heroEl.offsetHeight - 120;
          var inConsult = false;
          if (consultSection && "IntersectionObserver" in window) {
            var rect = consultSection.getBoundingClientRect();
            inConsult = rect.top < window.innerHeight && rect.bottom > 0;
          }
          mobileCta.classList.toggle("is-visible", pastHero && !inConsult && window.innerWidth < 900);
        }
        updateActiveNav();
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    /* -- Mobile menu with focus trap + animación -- */
    var burger = document.querySelector("[data-burger]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (burger && mobileMenu) {
      var toggleMenu = function (open) {
        burger.setAttribute("aria-expanded", String(open));
        if (open) {
          mobileMenu.hidden = false;
          /* Trigger reflow para que la transición funcione */
          void mobileMenu.offsetHeight;
          mobileMenu.classList.add("is-open");
        } else {
          mobileMenu.classList.remove("is-open");
          /* Esperar fin de transición antes de hidden */
          setTimeout(function () { mobileMenu.hidden = true; }, 300);
        }
        document.body.style.overflow = open ? "hidden" : "";
        if (open) {
          var firstLink = mobileMenu.querySelector("a");
          if (firstLink) firstLink.focus();
        }
      };
      burger.addEventListener("click", function () { toggleMenu(mobileMenu.hidden && !mobileMenu.classList.contains("is-open")); });
      mobileMenu.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () { toggleMenu(false); });
      });
      document.addEventListener("keydown", function (e) {
        if (mobileMenu.hidden && !mobileMenu.classList.contains("is-open")) return;
        if (e.key === "Escape") { toggleMenu(false); burger.focus(); return; }
        if (e.key === "Tab") {
          var links = Array.prototype.slice.call(mobileMenu.querySelectorAll("a"));
          var first = links[0], last = links[links.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
    }

    /* -- Hero parallax (mouse + scroll) -- */
    var hero = document.querySelector(".hero");
    var heroPicture = document.querySelector("[data-hero-carousel]");
    var parallaxFrame = 0;
    var scrollFrame = 0;
    if (hero && window.matchMedia("(pointer: fine)").matches && !reduceMotion.matches) {
      hero.addEventListener("pointermove", function (e) {
        if (parallaxFrame) return;
        parallaxFrame = requestAnimationFrame(function () {
          var rect = hero.getBoundingClientRect();
          hero.style.setProperty("--hero-x", (((e.clientX - rect.left) / rect.width - 0.5) * -8).toFixed(2) + "px");
          hero.style.setProperty("--hero-y", (((e.clientY - rect.top) / rect.height - 0.5) * -6).toFixed(2) + "px");
          parallaxFrame = 0;
        });
      });
      hero.addEventListener("pointerleave", function () {
        hero.style.setProperty("--hero-x", "0px");
        hero.style.setProperty("--hero-y", "0px");
      });
    }
    /* Parallax de scroll suave — la imagen se mueve más lento que el scroll */
    if (heroPicture && !reduceMotion.matches) {
      window.addEventListener("scroll", function () {
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(function () {
          var heroRect = hero.getBoundingClientRect();
          if (heroRect.bottom > 0 && heroRect.top < window.innerHeight) {
            var progress = Math.max(0, Math.min(1, -heroRect.top / hero.offsetHeight));
            heroPicture.style.transform = "translateY(" + (progress * 12) + "vh)";
          }
          scrollFrame = 0;
        });
      }, { passive: true });
    }

    /* -- Hero CTA -- */
    var heroConsult = document.querySelector("[data-hero-cta-primary]");
    if (heroConsult) heroConsult.addEventListener("click", function () {});
    var heroOpenHouse = document.querySelector("[data-open-house]");
    if (heroOpenHouse) heroOpenHouse.addEventListener("click", function () {
      setScene(cfg.experiences[0].id);
    });

    /* -- Scene selector — crossfade de doble capa + Ken Burns + texto escalonado -- */
    var sceneButtons = Array.prototype.slice.call(document.querySelectorAll("[data-scene]"));
    var sceneStage = document.querySelector(".scene-stage");
    var sceneImageA = document.querySelector("[data-scene-image-a]");
    var sceneImageB = document.querySelector("[data-scene-image-b]");
    var sceneInfo = document.querySelector("[data-scene-info]");
    var sceneMessage = document.querySelector("[data-scene-message]");
    var sceneCapacity = document.querySelector("[data-scene-capacity]");
    var sceneCta = document.querySelector("[data-scene-cta]");
    var sceneTimer = 0;
    var sceneActiveLayer = "a";
    var sceneFirstLoad = true;

    function setScene(key) {
      var s = scenes[key];
      if (!s || !sceneStage) return;
      var activeTabId = "scene-tab-" + key;
      sceneButtons.forEach(function (btn) {
        var active = btn.getAttribute("data-scene") === key;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
        btn.setAttribute("tabindex", active ? "0" : "-1");
      });
      sceneStage.setAttribute("aria-labelledby", activeTabId);
      clearTimeout(sceneTimer);

      var instant = reduceMotion.matches || sceneFirstLoad;
      var swapDelay = instant ? 0 : 300;

      /* Texto sale primero (solo si no es primera carga) */
      if (sceneInfo && !instant) sceneInfo.classList.add("is-swapping");

      sceneTimer = setTimeout(function () {
        /* Crossfade: cargar en capa inactiva, luego swap */
        var inactiveLayer = sceneActiveLayer === "a" ? sceneImageB : sceneImageA;
        var activeLayer = sceneActiveLayer === "a" ? sceneImageA : sceneImageB;

        if (sceneFirstLoad) {
          /* Primera carga: imagen directa en capa A */
          if (sceneImageA) {
            sceneImageA.src = s.src;
            sceneImageA.alt = s.alt;
            void sceneImageA.offsetWidth;
            sceneImageA.classList.add("is-active");
          }
          sceneFirstLoad = false;
        } else {
          if (inactiveLayer) {
            inactiveLayer.src = s.src;
            inactiveLayer.alt = s.alt;
            void inactiveLayer.offsetWidth;
            inactiveLayer.classList.add("is-active");
          }
          /* Capa saliente: is-leaving en vez de quitar is-active
             — Ken Burns sigue, solo fade de opacity */
          if (activeLayer) {
            activeLayer.classList.add("is-leaving");
            /* Limpiar después del fade */
            (function (layer) {
              setTimeout(function () {
                layer.classList.remove("is-active");
                layer.classList.remove("is-leaving");
              }, 800);
            })(activeLayer);
          }
          sceneActiveLayer = sceneActiveLayer === "a" ? "b" : "a";
        }

        /* Texto entra con delay respecto a la imagen */
        setTimeout(function () {
          if (sceneMessage) sceneMessage.textContent = s.message;
          if (sceneCapacity) sceneCapacity.textContent = s.capacity;
          if (sceneCta) {
            sceneCta.querySelector("span").textContent = s.cta;
            sceneCta.setAttribute("data-scene-type", key);
          }
          if (sceneInfo) sceneInfo.classList.remove("is-swapping");
        }, instant ? 0 : 200);
      }, swapDelay);
    }

    sceneButtons.forEach(function (btn) {
      btn.addEventListener("click", function () { setScene(btn.getAttribute("data-scene")); });
    });

    /* Tabs keyboard nav */
    if (sceneButtons.length > 1) {
      sceneButtons.forEach(function (btn, idx) {
        btn.addEventListener("keydown", function (e) {
          var nextIdx = null;
          if (e.key === "ArrowRight") nextIdx = (idx + 1) % sceneButtons.length;
          else if (e.key === "ArrowLeft") nextIdx = (idx - 1 + sceneButtons.length) % sceneButtons.length;
          else if (e.key === "Home") nextIdx = 0;
          else if (e.key === "End") nextIdx = sceneButtons.length - 1;
          if (nextIdx !== null) {
            e.preventDefault();
            sceneButtons[nextIdx].focus();
            setScene(sceneButtons[nextIdx].getAttribute("data-scene"));
          }
        });
      });
    }

    /* Auto-rotación de escenas — pausa en hover/focus, respeta reduced-motion */
    var sceneAutoTimer = 0;
    var sceneAutoPaused = false;
    var sceneInterval = 3500;

    function startSceneAuto() {
      if (reduceMotion.matches || sceneAutoPaused || sceneButtons.length < 2) return;
      stopSceneAuto();
      sceneAutoTimer = setInterval(function () {
        var current = -1;
        for (var i = 0; i < sceneButtons.length; i++) {
          if (sceneButtons[i].classList.contains("is-active")) { current = i; break; }
        }
        if (current < 0) current = 0;
        var next = (current + 1) % sceneButtons.length;
        setScene(sceneButtons[next].getAttribute("data-scene"));
      }, sceneInterval);
    }

    function stopSceneAuto() {
      if (sceneAutoTimer) { clearInterval(sceneAutoTimer); sceneAutoTimer = 0; }
    }

    if (!reduceMotion.matches && sceneButtons.length > 1) {
      /* Pausa cuando el mouse está sobre los tabs o el scene-stage */
      var encountersSection = document.querySelector(".encounters");
      if (encountersSection) {
        encountersSection.addEventListener("mouseenter", function () {
          sceneAutoPaused = true;
          stopSceneAuto();
          /* Pausar Ken Burns en hover */
          var activeImg = encountersSection.querySelector(".scene-stage__image.is-active");
          if (activeImg) activeImg.classList.add("is-paused");
        });
        encountersSection.addEventListener("mouseleave", function () {
          sceneAutoPaused = false;
          startSceneAuto();
          var activeImg = encountersSection.querySelector(".scene-stage__image.is-active");
          if (activeImg) activeImg.classList.remove("is-paused");
        });
      }
      sceneButtons.forEach(function (btn) {
        btn.addEventListener("focusin", function () { sceneAutoPaused = true; stopSceneAuto(); });
        btn.addEventListener("focusout", function () { sceneAutoPaused = false; startSceneAuto(); });
      });
      /* Click manual reinicia el ciclo */
      sceneButtons.forEach(function (btn) {
        btn.addEventListener("click", function () { stopSceneAuto(); startSceneAuto(); });
      });
      /* Auto-play solo cuando la sección está visible */
      if ("IntersectionObserver" in window) {
        var sceneAutoObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) startSceneAuto();
            else stopSceneAuto();
          });
        }, { threshold: 0.4 });
        if (encountersSection) sceneAutoObserver.observe(encountersSection);
      } else {
        startSceneAuto();
      }
    }

    /* Hash activation */
    function checkHash() {
      var hash = window.location.hash;
      if (hash.indexOf("encuentros") >= 0 || hash.indexOf("scene=") >= 0) {
        var match = hash.match(/scene=(\w+)/);
        var key = match ? match[1] : (cfg.experiences[0] ? cfg.experiences[0].id : "celebrar");
        if (scenes[key]) setScene(key);
      }
    }
    window.addEventListener("hashchange", checkHash);

    /* -- FAQ accordion (grid-template-rows: anima nativamente en ambas direcciones) -- */
    var faqButtons = Array.prototype.slice.call(document.querySelectorAll(".faq__question"));
    faqButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        var answer = document.getElementById(btn.getAttribute("aria-controls"));
        faqButtons.forEach(function (other) {
          if (other !== btn) {
            other.setAttribute("aria-expanded", "false");
            var otherAnswer = document.getElementById(other.getAttribute("aria-controls"));
            if (otherAnswer) otherAnswer.classList.remove("is-open");
          }
        });
        btn.setAttribute("aria-expanded", String(!expanded));
        if (answer) answer.classList.toggle("is-open", !expanded);
      });
    });

    /* -- Lightbox with focus trap + swipe -- */
    var lightbox = document.querySelector("[data-lightbox-modal]");
    var lbImage = document.querySelector("[data-lightbox-image]");
    var lbCaption = document.querySelector("[data-lightbox-caption]");
    var lbCounter = document.querySelector("[data-lightbox-counter]");
    var lbIndex = 0;
    var lbTrigger = null;
    var lbFocusable = [];
    var lbData = galleryData;

    function updateLbFocusable() {
      lbFocusable = Array.prototype.slice.call(lightbox.querySelectorAll("button, [href], [tabindex]:not([tabindex='-1'])"));
    }

    function showLightboxImage() {
      var item = lbData[lbIndex];
      if (!item) return;
      lbImage.src = item.src;
      lbImage.alt = item.alt;
      lbCaption.textContent = item.caption;
      lbCounter.textContent = (lbIndex + 1) + (cfg.ui && cfg.ui.lightboxCounterSeparator ? cfg.ui.lightboxCounterSeparator : "") + lbData.length;
    }

    function openLightbox(index, trigger) {
      lbIndex = index;
      lbTrigger = trigger;
      showLightboxImage();
      lightbox.hidden = false;
      lightbox.setAttribute("aria-modal", "true");
      lightbox.setAttribute("role", "dialog");
      document.body.style.overflow = "hidden";
      updateLbFocusable();
      var closeBtn = lightbox.querySelector("[data-lightbox-close]");
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      lightbox.removeAttribute("aria-modal");
      document.body.style.overflow = "";
      if (lbTrigger) lbTrigger.focus();
    }

    function lightboxNext() { lbIndex = (lbIndex + 1) % lbData.length; showLightboxImage(); }
    function lightboxPrev() { lbIndex = (lbIndex - 1 + lbData.length) % lbData.length; showLightboxImage(); }

    /* Gallery click handlers now handled by carrusel + casa expand */

    if (lightbox) {
      lightbox.querySelectorAll("[data-lightbox-close]").forEach(function (e) { e.addEventListener("click", closeLightbox); });
      var lbNext = lightbox.querySelector("[data-lightbox-next]");
      var lbPrev = lightbox.querySelector("[data-lightbox-prev]");
      if (lbNext) lbNext.addEventListener("click", lightboxNext);
      if (lbPrev) lbPrev.addEventListener("click", lightboxPrev);

      document.addEventListener("keydown", function (e) {
        if (lightbox.hidden) return;
        if (e.key === "Escape") { closeLightbox(); return; }
        if (e.key === "ArrowRight") { lightboxNext(); return; }
        if (e.key === "ArrowLeft") { lightboxPrev(); return; }
        if (e.key === "Tab") {
          updateLbFocusable();
          var first = lbFocusable[0], last = lbFocusable[lbFocusable.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });

      var touchStartX = 0;
      lightbox.addEventListener("touchstart", function (e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
      lightbox.addEventListener("touchend", function (e) {
        var diff = e.changedTouches[0].screenX - touchStartX;
        if (Math.abs(diff) > 50) { diff > 0 ? lightboxPrev() : lightboxNext(); }
      }, { passive: true });
    }

    /* ============================================================
       Single-page inquiry form — all from config
       ============================================================ */
    var form = document.querySelector("[data-inquiry]");
    if (!form) return;

    var preparing = document.querySelector("[data-preparing]");
    var fallback = document.querySelector("[data-fallback]");
    var fallbackText = document.querySelector("[data-fallback-text]");
    var successEl = document.querySelector("[data-success]");
    var formError = form.querySelector("[data-form-error]");
    var fieldsEl = form.querySelector("[data-fields]");
    var formData = {};

    var shiftOptions = Array.prototype.slice.call(form.querySelectorAll('select[name="shift"] option[data-for]'));
    var peopleInput = form.elements.people;
    var dateInput = form.elements.date;
    var nameInput = form.elements.name;
    var whatsappInput = form.elements.whatsapp;
    var shiftInput = form.elements.shift;
    var detailInput = form.elements.detail;

    /* Min date from config — no hardcoded default (AC-1) */
    var advanceDays = cfg.advanceNoticeDays || 0;
    if (!advanceDays) console.warn("config.json: advanceNoticeDays missing");
    var minDate = new Date();
    minDate.setDate(minDate.getDate() + advanceDays);
    if (dateInput) dateInput.min = minDate.toISOString().slice(0, 10);

    /* WhatsApp number from config — no hardcoded fallback (AC-1) */
    var whatsappNumber = (cfg.contact && cfg.contact.whatsapp) ? cfg.contact.whatsapp : "";
    if (!whatsappNumber) console.warn("config.json: contact.whatsapp missing");

    /* Per-field error with aria-describedby (AC-3) — messages from config */
    var errCfg = (cfg.inquiry && cfg.inquiry.errors) ? cfg.inquiry.errors : {};
    function err(key, vars) {
      var msg = errCfg[key] || "";
      if (vars) {
        for (var k in vars) msg = msg.replace("{" + k + "}", vars[k]);
      }
      return msg;
    }
    function setFieldError(fieldName, msg) {
      var errEl = document.getElementById("err-" + fieldName);
      if (errEl) errEl.textContent = msg;
    }
    function clearFieldError(fieldName) {
      var errEl = document.getElementById("err-" + fieldName);
      if (errEl) errEl.textContent = "";
    }

    function getCapacity(type, cfg) {
      if (!cfg || !cfg.capacity) return 0;
      var keyMap = { social: "social", corporativo: "corporate", workshop: "workshop", otro: "otro" };
      return cfg.capacity[keyMap[type]] || cfg.capacity.social || 0;
    }

    var shiftPlaceholderOpt = form.querySelector("[data-shift-placeholder]");
    var peopleHint = form.querySelector("[data-people-hint]");

    function updateShiftOptions(type) {
      shiftOptions.forEach(function (opt) {
        var matches = opt.getAttribute("data-for") === type;
        opt.disabled = !matches;
        opt.hidden = !matches;
      });
      if (shiftInput) {
        shiftInput.disabled = false;
        if (shiftPlaceholderOpt) shiftPlaceholderOpt.textContent = cfg.inquiry.shiftPlaceholder || "";
        if (shiftInput.selectedOptions[0] && shiftInput.selectedOptions[0].disabled) shiftInput.value = "";
      }
    }

    function updateCapacity(type) {
      var max = getCapacity(type, cfg);
      if (peopleInput) {
        peopleInput.max = String(max);
        if (Number(peopleInput.value) > max) peopleInput.value = String(max);
      }
      if (peopleHint) peopleHint.textContent = (cfg.inquiry.peopleHint || "").replace("{max}", max);
    }

    /* Validate all fields at once */
    function validateForm() {
      var firstError = null;
      if (formError) formError.textContent = "";

      var eventTypeInput = form.elements.eventType;
      if (!eventTypeInput || !eventTypeInput.value) {
        var msg = err("eventType");
        setFieldError("eventType", msg);
        if (!firstError) firstError = eventTypeInput;
      } else {
        clearFieldError("eventType");
        formData.eventType = eventTypeInput.value;
      }

      if (!dateInput.value) {
        var msg = err("dateEmpty", { days: advanceDays });
        setFieldError("date", msg);
        if (!firstError) firstError = dateInput;
      } else if (dateInput.value < dateInput.min) {
        var msg = err("dateMin", { days: advanceDays });
        setFieldError("date", msg);
        if (!firstError) firstError = dateInput;
      } else {
        clearFieldError("date");
        formData.date = dateInput.value;
      }

      if (!shiftInput.value) {
        var msg = err("shift");
        setFieldError("shift", msg);
        if (!firstError) firstError = shiftInput;
      } else {
        clearFieldError("shift");
        formData.shift = shiftInput.value;
      }

      var people = Number(peopleInput.value);
      var max = getCapacity(formData.eventType || "social", cfg);
      if (!people || people < 1 || people > max) {
        var msg = err("people", { max: max });
        setFieldError("people", msg);
        if (!firstError) firstError = peopleInput;
      } else {
        clearFieldError("people");
        formData.people = people;
      }

      if (!nameInput.value.trim()) {
        var msg = err("name");
        setFieldError("name", msg);
        if (!firstError) firstError = nameInput;
      } else {
        clearFieldError("name");
        formData.name = nameInput.value.trim();
      }

      if (!whatsappInput.value.trim()) {
        var msg = err("whatsapp");
        setFieldError("whatsapp", msg);
        if (!firstError) firstError = whatsappInput;
      } else if (whatsappInput.value.trim().length < 6) {
        var msg = err("whatsappBlurShort");
        setFieldError("whatsapp", msg);
        if (!firstError) firstError = whatsappInput;
      } else {
        clearFieldError("whatsapp");
        formData.whatsapp = whatsappInput.value.trim();
      }

      if (detailInput) formData.detail = detailInput.value;

      if (firstError) {
        firstError.focus();
        if (formError) formError.textContent = errCfg.formError || "Revisá los campos marcados.";
        return false;
      }
      return true;
    }

    /* Validation on blur/change for ALL fields — including empty (AC-3) */
    if (dateInput) {
      dateInput.addEventListener("blur", function () {
        if (!dateInput.value) setFieldError("date", err("dateBlurEmpty"));
        else if (dateInput.value < dateInput.min) setFieldError("date", err("dateMin", { days: advanceDays }));
        else clearFieldError("date");
      });
    }
    if (shiftInput) {
      shiftInput.addEventListener("change", function () {
        if (!shiftInput.value) setFieldError("shift", err("shiftBlur"));
        else clearFieldError("shift");
      });
    }
    if (peopleInput) {
      peopleInput.addEventListener("blur", function () {
        var max = getCapacity(formData.eventType || "social", cfg);
        var val = Number(peopleInput.value);
        if (!peopleInput.value) setFieldError("people", err("peopleBlurEmpty"));
        else if (val < 1 || val > max) setFieldError("people", err("people", { max: max }));
        else clearFieldError("people");
      });
    }
    if (nameInput) {
      nameInput.addEventListener("blur", function () {
        if (!nameInput.value.trim()) setFieldError("name", err("name"));
        else clearFieldError("name");
      });
    }
    if (whatsappInput) {
      whatsappInput.addEventListener("blur", function () {
        if (!whatsappInput.value.trim()) setFieldError("whatsapp", err("whatsappBlurEmpty"));
        else if (whatsappInput.value.trim().length < 6) setFieldError("whatsapp", err("whatsappBlurShort"));
        else clearFieldError("whatsapp");
      });
    }
    /* Event type select change — updates dependent shift/capacity */
    var eventTypeInputEl = form.elements.eventType;
    if (eventTypeInputEl) {
      eventTypeInputEl.addEventListener("change", function () {
        if (eventTypeInputEl.value) {
          formData.eventType = eventTypeInputEl.value;
          updateShiftOptions(eventTypeInputEl.value);
          updateCapacity(eventTypeInputEl.value);
          clearFieldError("eventType");
        }
      });
    }

    /* Preseleccionar tipo desde CTA contextual (AC-3) */
    document.querySelectorAll("[data-scene-cta]").forEach(function (cta) {
      cta.addEventListener("click", function () {
        var sceneType = cta.getAttribute("data-scene-type");
        var typeMap = { celebrar: "social", pensar: "corporativo", crear: "workshop" };
        var typeValue = typeMap[sceneType] || "social";
        setTimeout(function () {
          if (eventTypeInputEl) {
            eventTypeInputEl.value = typeValue;
            eventTypeInputEl.dispatchEvent(new Event("change"));
          }
        }, 300);
      });
    });

    /* Submit → WhatsApp */
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateForm()) return;

      var wa = cfg.whatsappMessage || {};
      var typeLabels = wa.typeLabels || {};
      var message = [
        wa.greeting || "",
        (wa.typeLabel || "") + ": " + (typeLabels[formData.eventType] || formData.eventType),
        (wa.peopleLabel || "") + ": " + formData.people,
        (wa.dateLabel || "") + ": " + formData.date,
        (wa.shiftLabel || "") + ": " + formData.shift,
        (wa.nameLabel || "") + ": " + formData.name,
        (wa.whatsappLabel || "") + ": " + formData.whatsapp
      ];
      if (formData.detail) message.push((wa.detailLabel || "") + ": " + formData.detail);
      if (wa.closingLine) message.push(wa.closingLine);

      var text = message.join("\n");
      var url = "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(text);

      if (preparing) preparing.hidden = false;
      if (fieldsEl) fieldsEl.hidden = true;

      setTimeout(function () {
        var win = window.open(url, "_blank", "noopener,noreferrer");
        if (preparing) preparing.hidden = true;

        if (!win || win.closed || typeof win.closed === "undefined") {
          if (fallback) {
            fallback.hidden = false;
            if (fallbackText) fallbackText.value = text;
          }
        } else {
          if (successEl) successEl.hidden = false;
        }
      }, 800);
    });

    /* Hacer otra consulta — restaurar formulario */
    var againBtn = form.querySelector("[data-success-again]");
    if (againBtn) {
      againBtn.addEventListener("click", function () {
        form.reset();
        formData = {};
        if (shiftInput) shiftInput.disabled = true;
        if (shiftPlaceholderOpt) shiftPlaceholderOpt.textContent = cfg.inquiry.shiftLockedPlaceholder || cfg.inquiry.shiftPlaceholder || "";
        if (peopleHint) peopleHint.textContent = "";
        if (formError) formError.textContent = "";
        form.querySelectorAll(".field__error").forEach(function (p) { p.textContent = ""; });
        if (successEl) successEl.hidden = true;
        if (fallback) fallback.hidden = true;
        if (fieldsEl) fieldsEl.hidden = false;
        if (eventTypeInputEl) eventTypeInputEl.focus();
      });
    }

    /* Copy fallback — navigator.clipboard con fallback a execCommand */
    var copyBtn = form.querySelector("[data-copy-message]");
    if (copyBtn && fallbackText) {
      copyBtn.addEventListener("click", function () {
        var text = fallbackText.value;
        var span = copyBtn.querySelector("span");
        var showCopied = function () {
          if (span && cfg.ui && cfg.ui.copySuccessLabel) span.textContent = cfg.ui.copySuccessLabel;
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(showCopied).catch(function () {
            fallbackText.select();
            try { document.execCommand("copy"); showCopied(); } catch (e) {}
          });
        } else {
          fallbackText.select();
          try { document.execCommand("copy"); showCopied(); } catch (e) {}
        }
      });
    }

    /* Initialize first scene — respect hash entrante (AC-6) */
    var hashMatch = window.location.hash.match(/scene=(\w+)/);
    var initialScene = hashMatch && hashMatch[1] ? hashMatch[1] : (cfg.experiences && cfg.experiences[0] ? cfg.experiences[0].id : null);
    if (initialScene && scenes[initialScene]) setScene(initialScene);
  }

  /* -- Helper: set text content -- */
  function setText(selector, text) {
    var node = document.querySelector(selector);
    if (node && text != null) node.textContent = text;
  }

  /* -- Start -- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
