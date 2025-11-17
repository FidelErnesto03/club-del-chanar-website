// Configuración cargada dinámicamente desde config.json
let gallerySectionsData = [];
let galleryModalState = { sectionIndex: 0, imageIndex: 0 };
let galleryInteractionsBound = false;

async function loadConfig() {
  try {
    const response = await fetch("./config.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No se pudo leer config.json");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error cargando configuración:", error);
    throw error;
  }
}

function hydrateUI(config) {
  console.log('Iniciando hydrateUI con config:', config);

  // Actualizar metadata del sitio
  if (config.site) {
    if (config.site.title) document.title = config.site.title;
    if (config.site.description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) metaDescription.content = config.site.description;
    }
  }

  // Actualizar Hero Section
  hydrateHeroSection(config.hero);

  // Actualizar Club Section
  hydrateClubSection(config.club);

  // Actualizar Spaces Section
  hydrateSpacesSection(config.spaces);

  // Actualizar Events Section
  hydrateEventsSection(config.events);

  // Actualizar Benefits Section
  hydrateBenefitsSection(config.benefits);

  // Actualizar Process Section
  hydrateProcessSection(config.process);

  // Actualizar Plans Section
  hydratePlansSection(config.plans);

  // Actualizar Gallery Section
  hydrateGallerySection(config.gallery);

  // Actualizar Contact Section
  hydrateContactSection(config.contact);

  // Actualizar Footer
  hydrateFooter(config.footer);

  // Actualizar URLs dinámicas
  hydrateDynamicURLs(config.urls);

  console.log('Todas las secciones hidratadas correctamente');
}

function hydrateHeroSection(hero) {
  if (!hero) return;

  const elements = {
    eyebrow: document.querySelector('.hero__text .eyebrow'),
    title: document.getElementById('hero-title'),
    subtitle: document.getElementById('hero-subtitle'),
    description: document.getElementById('hero-description'),
    cta: document.getElementById('hero-cta'),
    secondaryCta: document.querySelector('.hero__cta-group .btn--ghost'),
    note: document.querySelector('.hero__note')
  };

  if (elements.eyebrow && hero.eyebrow) elements.eyebrow.textContent = hero.eyebrow;
  if (elements.title && hero.title) elements.title.textContent = hero.title;
  if (elements.subtitle && hero.subtitle) elements.subtitle.textContent = hero.subtitle;
  if (elements.description && hero.description) elements.description.textContent = hero.description;

  if (elements.cta) {
    if (hero.cta) elements.cta.textContent = hero.cta;
    if (hero.cta_url) {
      elements.cta.href = hero.cta_url;
      elements.cta.target = hero.cta_url.startsWith('#') ? '_self' : '_blank';
    }
  }

  if (elements.secondaryCta) {
    if (hero.secondary_cta) elements.secondaryCta.textContent = hero.secondary_cta;
    if (hero.secondary_cta_url) {
      elements.secondaryCta.href = hero.secondary_cta_url;
      if (hero.secondary_cta_url.startsWith('#')) {
        elements.secondaryCta.dataset.scroll = hero.secondary_cta_url;
        elements.secondaryCta.target = '_self';
      } else {
        elements.secondaryCta.removeAttribute('data-scroll');
        elements.secondaryCta.target = '_blank';
      }
    }
  }

  if (elements.note && hero.note) elements.note.textContent = hero.note;
}

function hydrateClubSection(club) {
  if (!club) return;

  const elements = {
    eyebrow: document.querySelector('#urgencia .eyebrow'),
    title: document.querySelector('#urgencia h2'),
    description: document.querySelector('.club-description-card p'),
    titleCard: document.querySelector('.club-description-card h3'),
    croquisImg: document.querySelector('.croquis-figure img'),
    croquisCaption: document.querySelector('.croquis-figure figcaption'),
    cta: document.querySelector('#urgencia .btn--primary')
  };

  if (elements.eyebrow && club.eyebrow) elements.eyebrow.textContent = club.eyebrow;
  if (elements.title && club.title) elements.title.textContent = club.title;
  if (elements.titleCard && club.title) elements.titleCard.textContent = club.title;
  if (elements.description && club.description) elements.description.innerHTML = club.description;
  if (elements.croquisImg && club.croquis_image) {
    elements.croquisImg.src = club.croquis_image;
    if (club.croquis_alt) elements.croquisImg.alt = club.croquis_alt;
  }
  if (elements.croquisCaption && club.croquis_caption) elements.croquisCaption.textContent = club.croquis_caption;
  if (elements.cta) {
    if (club.cta) elements.cta.textContent = club.cta;
    if (club.cta_url) {
      elements.cta.href = club.cta_url;
      elements.cta.target = club.cta_url.startsWith('#') ? '_self' : '_blank';
    }
  }

  // Actualizar features
  const featureWrapper = document.querySelector('.activation__features');
  if (featureWrapper) {
    featureWrapper.innerHTML = '';
    if (Array.isArray(club.features)) {
      club.features.forEach((feature) => {
        const item = document.createElement('div');
        item.className = 'activation__feature';
        const icon = document.createElement('span');
        icon.className = 'activation__bullet';
        icon.textContent = feature.icon || '';
        const content = document.createElement('div');
        const title = document.createElement('h3');
        title.textContent = feature.title || '';
        const description = document.createElement('p');
        description.innerHTML = feature.description || '';
        content.append(title, description);
        item.append(icon, content);
        featureWrapper.appendChild(item);
      });
    }
  }
}

function hydrateSpacesSection(spaces) {
  if (!spaces) return;

  const elements = {
    eyebrow: document.querySelector('#servicios .eyebrow'),
    title: document.querySelector('#servicios h2'),
    lead: document.querySelector('#servicios .section__lead')
  };

  if (elements.eyebrow && spaces.eyebrow) elements.eyebrow.textContent = spaces.eyebrow;
  if (elements.title && spaces.title) elements.title.textContent = spaces.title;
  if (elements.lead && spaces.lead) elements.lead.textContent = spaces.lead;

  const grid = document.getElementById('spaces-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (Array.isArray(spaces.items)) {
    spaces.items.forEach((space) => {
      const card = document.createElement('div');
      card.className = 'space-item';
      const icon = document.createElement('div');
      icon.className = 'space-icon';
      icon.textContent = space.icon || '';
      const title = document.createElement('h3');
      title.className = 'space-title';
      title.textContent = space.title || '';
      const description = document.createElement('p');
      description.className = 'space-description';
      description.textContent = space.description || '';
      card.append(icon, title, description);
      grid.appendChild(card);
    });
  }
}

function hydrateEventsSection(events) {
  if (!events) return;

  const elements = {
    eyebrow: document.querySelector('#eventos .eyebrow'),
    title: document.querySelector('#eventos h2'),
    lead: document.querySelector('#eventos .section__lead')
  };

  if (elements.eyebrow && events.eyebrow) elements.eyebrow.textContent = events.eyebrow;
  if (elements.title && events.title) elements.title.textContent = events.title;
  if (elements.lead && events.lead) elements.lead.textContent = events.lead;

  // Actualizar items de eventos
  const grid = document.getElementById('events-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (Array.isArray(events.items)) {
    events.items.forEach((event) => {
      const card = document.createElement('article');
      card.className = 'events__card';
      const icon = document.createElement('div');
      icon.className = 'events__icon';
      icon.textContent = event.icon || '';
      const title = document.createElement('h3');
      title.className = 'events__card__title';
      title.textContent = event.title || '';
      const description = document.createElement('p');
      description.className = 'events__card__description';
      description.textContent = event.description || '';
      const detailsContainer = document.createElement('div');
      detailsContainer.className = 'events__details';
      if (Array.isArray(event.details)) {
        event.details.forEach(detail => {
          const span = document.createElement('span');
          span.className = 'events__detail';
          span.textContent = detail;
          detailsContainer.appendChild(span);
        });
      }
      card.append(icon, title, description, detailsContainer);
      grid.appendChild(card);
    });
  }
}

function hydrateBenefitsSection(benefits) {
  if (!benefits) return;

  const elements = {
    eyebrow: document.querySelector('#incluye .eyebrow'),
    title: document.querySelector('#incluye h2')
  };

  if (elements.eyebrow && benefits.eyebrow) elements.eyebrow.textContent = benefits.eyebrow;
  if (elements.title && benefits.title) elements.title.textContent = benefits.title;

  const grid = document.getElementById('benefits-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (Array.isArray(benefits.items)) {
    benefits.items.forEach((benefit) => {
      const card = document.createElement('div');
      card.className = 'benefit';
      const icon = document.createElement('div');
      icon.className = 'benefit__icon';
      icon.textContent = benefit.icon || '';
      const title = document.createElement('h3');
      title.className = 'benefit__title';
      title.textContent = benefit.title || '';
      const description = document.createElement('p');
      description.className = 'benefit__description';
      description.textContent = benefit.description || '';
      card.append(icon, title, description);
      grid.appendChild(card);
    });
  }
}

function hydrateProcessSection(process) {
  if (!process) return;

  const elements = {
    eyebrow: document.querySelector('#funciona .eyebrow'),
    title: document.querySelector('#funciona h2')
  };

  if (elements.eyebrow && process.eyebrow) elements.eyebrow.textContent = process.eyebrow;
  if (elements.title && process.title) elements.title.textContent = process.title;

  // Actualizar steps del proceso
  const list = document.getElementById('process-steps');
  if (!list) return;
  list.innerHTML = '';

  if (Array.isArray(process.steps)) {
    process.steps.forEach((step) => {
      const item = document.createElement('li');
      item.className = 'process-step';
      const icon = document.createElement('span');
      icon.className = 'process-step__icon';
      icon.textContent = step.icon || step.number || '';
      const content = document.createElement('div');
      const title = document.createElement('h3');
      title.className = 'process-step__title';
      title.textContent = step.title || '';
      const description = document.createElement('p');
      description.className = 'process-step__description';
      description.textContent = step.description || '';
      content.append(title, description);
      item.append(icon, content);
      list.appendChild(item);
    });
  }
}

function hydratePlansSection(plans) {
  if (!plans) return;

  const elements = {
    eyebrow: document.querySelector('#planes .eyebrow'),
    title: document.querySelector('#planes h2'),
    lead: document.querySelector('#planes .section__lead')
  };

  if (elements.eyebrow && plans.eyebrow) elements.eyebrow.textContent = plans.eyebrow;
  if (elements.title && plans.title) elements.title.textContent = plans.title;
  if (elements.lead && plans.lead) elements.lead.textContent = plans.lead;

  // Actualizar items de planes
  const grid = document.getElementById('plans-grid');
  if (grid) {
    grid.innerHTML = '';
    if (Array.isArray(plans.items)) {
      plans.items.forEach((plan) => {
        const card = document.createElement('article');
        card.className = 'plan-card';
        if (plan.featured) card.classList.add('plan-card--featured');

        const header = document.createElement('div');
        header.className = 'plan-card__header';
        const eyebrow = document.createElement('p');
        eyebrow.className = 'eyebrow';
        eyebrow.textContent = plan.eyebrow || '';
        const title = document.createElement('h3');
        title.textContent = plan.title || '';
        const badge = document.createElement('div');
        badge.className = 'plan-card__badge';
        if (plan.badge) {
          badge.textContent = plan.badge;
        } else {
          badge.style.display = 'none';
        }
        header.append(eyebrow, title, badge);

        const priceBlock = document.createElement('div');
        priceBlock.className = 'plan-card__price';
        const compare = document.createElement('span');
        compare.className = 'plan-card__compare';
        if (plan.compare_price) {
          compare.innerHTML = `<s>${plan.compare_price}</s>`;
        } else {
          compare.style.display = 'none';
        }
        const price = document.createElement('span');
        price.className = 'plan-card__daily';
        price.textContent = plan.price || '';
        const period = document.createElement('span');
        period.className = 'plan-card__period';
        period.textContent = plan.period || '';
        priceBlock.append(compare, price, period);

        const featureList = document.createElement('ul');
        if (Array.isArray(plan.features)) {
          plan.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            featureList.appendChild(li);
          });
        }

        const cta = document.createElement('a');
        cta.className = plan.featured ? 'btn' : 'btn btn--ghost';
        cta.textContent = plan.cta || '';
        if (plan.cta_url) {
          cta.href = plan.cta_url;
          cta.target = plan.cta_url.startsWith('#') ? '_self' : '_blank';
        }

        card.append(header, priceBlock, featureList, cta);
        grid.appendChild(card);
      });
    }
  }

  // Actualizar oferta especial
  const specialOffer = document.getElementById('special-offer');
  if (specialOffer) {
    specialOffer.innerHTML = '';
    if (plans.special_offer && plans.special_offer.active) {
      const title = document.createElement('h3');
      title.className = 'special-offer__title';
      title.textContent = plans.special_offer.title || '';
      const description = document.createElement('p');
      description.className = 'special-offer__description';
      description.innerHTML = plans.special_offer.description || '';
      specialOffer.append(title, description);
    }
  }
}

function hydrateGallerySection(gallery) {
  if (!gallery) return;

  const elements = {
    eyebrow: document.querySelector('#galeria .eyebrow'),
    title: document.querySelector('#galeria h2'),
    lead: document.querySelector('#galeria .section__lead')
  };

  if (elements.eyebrow && gallery.eyebrow) elements.eyebrow.textContent = gallery.eyebrow;
  if (elements.title && gallery.title) elements.title.textContent = gallery.title;
  if (elements.lead && gallery.lead) elements.lead.textContent = gallery.lead;

  // La galería se maneja por separado con gallerySectionsData
  if (gallery.sections && Array.isArray(gallery.sections)) {
    gallerySectionsData = gallery.sections;
  }
}

function hydrateSubscriptionSection(subscription) {
  if (!subscription) return;

  const elements = {
    eyebrow: document.querySelector('#suscripcion .eyebrow'),
    title: document.querySelector('#suscripcion h2'),
    description: document.querySelector('#suscripcion .subscription__description'),
    cta: document.querySelector('#suscripcion .btn')
  };

  if (elements.eyebrow && subscription.eyebrow) elements.eyebrow.textContent = subscription.eyebrow;
  if (elements.title && subscription.title) elements.title.textContent = subscription.title;
  if (elements.description && subscription.description) elements.description.textContent = subscription.description;
  if (elements.cta) {
    if (subscription.cta) elements.cta.textContent = subscription.cta;
    if (subscription.cta_url) elements.cta.href = subscription.cta_url;
  }

  // Actualizar features
  if (subscription.features && Array.isArray(subscription.features)) {
    const featuresList = document.querySelector('.subscription__features');
    if (featuresList) {
      featuresList.innerHTML = '';
      subscription.features.forEach(feature => {
        const li = document.createElement('li');
        li.textContent = feature;
        featuresList.appendChild(li);
      });
    }
  }
}

function hydrateContactSection(contact) {
  if (!contact) return;

  const elements = {
    eyebrow: document.querySelector('#contacto .eyebrow'),
    title: document.querySelector('#contacto h2'),
    description: document.querySelector('#contacto .contact__description'),
    hours: document.querySelector('.contact__hours'),
    responseTime: document.querySelector('.contact__response-time'),
    whatsappLabel: document.querySelector('.contact__whatsapp span'),
    formLink: document.querySelector('.contact__form')
  };

  if (elements.eyebrow && contact.eyebrow) elements.eyebrow.textContent = contact.eyebrow;
  if (elements.title && contact.title) elements.title.textContent = contact.title;
  if (elements.description && contact.description) elements.description.textContent = contact.description;
  if (elements.hours && contact.hours) elements.hours.textContent = contact.hours;
  if (elements.responseTime && contact.response_time) elements.responseTime.textContent = contact.response_time;
  if (elements.whatsappLabel && contact.whatsapp_label) elements.whatsappLabel.textContent = contact.whatsapp_label;
  if (elements.formLink) {
    if (contact.form_url) elements.formLink.href = contact.form_url;
    elements.formLink.textContent = contact.form_label || 'Formulario de contacto';
  }

  // Actualizar WhatsApp
  if (contact.whatsapp) {
    const whatsappLink = document.querySelector('.contact__whatsapp');
    if (whatsappLink && contact.whatsapp.number) {
      const number = contact.whatsapp.number.replace(/\D/g, '');
      whatsappLink.href = `https://wa.me/${number}`;
      if (contact.whatsapp.message) {
        whatsappLink.href += `?text=${encodeURIComponent(contact.whatsapp.message)}`;
      }
    }
  }
}

function hydrateFooter(footer) {
  if (!footer) return;

  const elements = {
    copyright: document.querySelector('.footer__copyright'),
    location: document.querySelector('.footer__location'),
    email: document.querySelector('.footer__email')
  };

  if (elements.copyright && footer.copyright) elements.copyright.textContent = footer.copyright;
  if (elements.location && footer.location) elements.location.textContent = footer.location;
  if (elements.email && footer.email) {
    elements.email.textContent = footer.email;
    elements.email.href = `mailto:${footer.email}`;
  }
}

function hydrateDynamicURLs(urls) {
  if (!urls) return;

  // Actualizar URLs de formularios
  if (urls.subscription_form) {
    const formLinks = document.querySelectorAll('a[href*="forms.gle"]');
    formLinks.forEach(link => {
      link.href = urls.subscription_form;
    });
  }

  // Actualizar URLs de WhatsApp
  if (urls.whatsapp) {
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
    whatsappLinks.forEach(link => {
      link.href = urls.whatsapp;
    });
  }
}



function setupNav() {
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");
  const nav = document.querySelector(".nav");
  const brand = document.querySelector(".nav__brand");
  if (!toggle || !links || !nav) return;

  // Toggle del menú móvil
  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Función de scroll suave para enlaces internos
  function smoothScrollToTarget(href) {
    const target = document.querySelector(href);
    if (target) {
      const headerHeight = 90; // Offset que coincide con scroll-margin-top
      const extraOffset = 20; // Espacio adicional para detenerse antes

      const targetRect = target.getBoundingClientRect();
      const targetPosition = targetRect.top + window.pageYOffset - headerHeight - extraOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    }
  }

  // Scroll suave para el logo del header
  if (brand) {
    brand.addEventListener("click", (event) => {
      event.preventDefault();
      smoothScrollToTarget("#inicio");
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  }

  // Cerrar menú al hacer clic en enlaces y aplicar scroll suave
  links.querySelectorAll("a").forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href");

      // Solo procesar enlaces internos (que empiezan con #)
      if (href && href.startsWith("#")) {
        event.preventDefault();
        smoothScrollToTarget(href);
      }

      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });

  // Efecto de scroll en la navegación
  function handleScroll() {
    const scrollY = window.scrollY;
    
    // Activar navegación compacta inmediatamente
    if (scrollY > 10) {
      nav.classList.add("nav--scrolled");
    } else {
      nav.classList.remove("nav--scrolled");
    }

    // Actualizar enlace activo
    updateActiveNavLink();
  }

  // Actualizar enlace activo en navegación
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__links a');
    
    let current = '';
    const baseOffset = 120; // Offset base para mejor precisión
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      const sectionId = section.getAttribute('id');
      
      // Offset adicional para la sección de Manifiesto
      const isManifesto = sectionId === 'manifesto';
      const sectionOffset = isManifesto ? 40 : 0;
      const scrollY = window.scrollY + baseOffset + sectionOffset;

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = sectionId;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Ejecutar al cargar
}

function renderServices(container, spaces = []) {
  if (!container) return;
  container.innerHTML = "";
  if (!Array.isArray(spaces) || !spaces.length) {
    const placeholder = document.createElement("p");
    placeholder.textContent = "Pronto detallaremos los espacios disponibles.";
    container.appendChild(placeholder);
    return;
  }

  spaces.forEach((space, index) => {
    const card = document.createElement("article");
    card.className = "service-card";
    card.style.animationDelay = `${index * 0.1}s`;

    const media = document.createElement("figure");
    media.className = "service-card__media";
    media.style.backgroundImage = `url('${space.image || "assets/space-taller.svg"}')`;
    media.setAttribute("role", "presentation");

    const body = document.createElement("div");
    body.className = "service-card__body";

    const title = document.createElement("h3");
    title.textContent = space.name;

    const description = document.createElement("p");
    description.textContent = space.description;

    body.append(title, description);

    if (Array.isArray(space.services) && space.services.length) {
      const list = document.createElement("ul");
      space.services.forEach((service) => {
        const li = document.createElement("li");
        li.textContent = service;
        list.appendChild(li);
      });
      body.appendChild(list);
    }

    card.append(media, body);
    container.appendChild(card);
  });
}

function renderSharedUse(introEl, grid, ctaEl, shared = {}) {
  if (introEl && shared.intro) {
    introEl.textContent = shared.intro;
  }

  if (ctaEl && shared.cta) {
    ctaEl.textContent = shared.cta;
  }

  if (!grid) return;
  grid.innerHTML = "";
  if (!Array.isArray(shared.modes) || !shared.modes.length) {
    const placeholder = document.createElement("p");
    placeholder.textContent = "Definiremos nuevas modalidades pronto.";
    grid.appendChild(placeholder);
    return;
  }

  shared.modes.forEach((mode) => {
    const card = document.createElement("article");
    card.className = "shared-card";

    const title = document.createElement("h3");
    title.textContent = mode.title;

    const description = document.createElement("p");
    description.textContent = mode.description;

    card.append(title, description);

    if (Array.isArray(mode.guides) && mode.guides.length) {
      const list = document.createElement("ul");
      mode.guides.forEach((guide) => {
        const li = document.createElement("li");
        li.textContent = guide;
        list.appendChild(li);
      });
      card.appendChild(list);
    }

    grid.appendChild(card);
  });
}

function renderPrinciples(container, principles = []) {
  if (!container) return;
  container.innerHTML = "";
  if (!Array.isArray(principles) || !principles.length) {
    container.textContent = "Pronto publicaremos nuestros principios.";
    return;
  }

  principles.forEach((principle, index) => {
    const card = document.createElement("article");
    card.className = "principle-card";
    card.style.animationDelay = `${index * 0.1}s`;
    const badge = document.createElement("span");
    badge.className = "principle-card__badge";
    badge.textContent = `0${index + 1}`;
    const title = document.createElement("h3");
    title.textContent = principle.title;
    const description = document.createElement("p");
    description.textContent = principle.description;
    card.append(badge, title, description);
    container.appendChild(card);
  });
}

function renderInfrastructure(container, items = []) {
  if (!container) return;
  container.innerHTML = "";
  if (!Array.isArray(items) || !items.length) {
    container.textContent = "Infraestructura en actualización.";
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "infrastructure-card";
    const title = document.createElement("h3");
    title.textContent = item.title;
    const details = document.createElement("p");
    details.textContent = item.details;
    card.append(title, details);
    container.appendChild(card);
  });
}

function renderGallery(container, sections = []) {
  if (!container) return;
  container.innerHTML = "";

  if (!Array.isArray(sections) || !sections.length) {
    const placeholder = document.createElement("p");
    placeholder.innerHTML = "Aún no hay imágenes disponibles. Agrega archivos en <code>assets/gallery/</code> y ejecuta <code>npm run build:gallery</code> antes de publicar.";
    container.appendChild(placeholder);
    return;
  }

  sections.forEach((section, sectionIndex) => {
    const card = document.createElement("article");
    card.className = "gallery__section";
    card.dataset.gallerySection = sectionIndex;

    const header = document.createElement("header");
    const title = document.createElement("h3");
    title.textContent = section.name;
    const count = document.createElement("span");
    count.className = "gallery__count";
    const images = Array.isArray(section.images) ? section.images : [];
    count.textContent = `${images.length} imagen${images.length === 1 ? "" : "es"}`;
    header.append(title, count);
    card.appendChild(header);

    if (section.description) {
      const description = document.createElement("p");
      description.textContent = section.description;
      card.appendChild(description);
    }

    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "gallery__toggle";
    toggle.dataset.galleryToggle = sectionIndex;
    toggle.textContent = "Ver álbum";

    // Hacer que el botón "Ver álbum" abra directamente el modal con la primera imagen
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      if (images.length > 0) {
        openGalleryModal(sectionIndex, 0);
      }
    });

    card.appendChild(toggle);

    if (images.length) {
      const grid = document.createElement("div");
      grid.className = "gallery__grid";
      grid.dataset.galleryId = section.slug || `gallery-${sectionIndex}`;
      images.forEach((image, index) => {
        const fig = document.createElement("figure");
        fig.className = "gallery__item";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "gallery__media-trigger";
        button.dataset.galleryTrigger = "true";
        button.dataset.sectionIndex = String(sectionIndex);
        button.dataset.imageIndex = String(index);
        button.dataset.mediaType = image.type || "image";

        if ((image.type || "image") === "video") {
          const video = document.createElement("video");
          video.src = image.src;
          video.muted = true;
          video.loop = true;
          video.preload = "metadata";
          video.setAttribute("playsinline", "");
          video.setAttribute("aria-hidden", "true");
          button.appendChild(video);
        } else {
          const img = document.createElement("img");
          img.src = image.src;
          img.alt = image.alt || `${section.name} · ${image.label || image.filename || `Imagen ${index + 1}`}`;
          img.loading = "lazy";
          button.appendChild(img);
        }

        fig.appendChild(button);

        const caption = document.createElement("span");
        caption.textContent = image.label || image.filename || `Imagen ${index + 1}`;
        fig.appendChild(caption);
        grid.appendChild(fig);
      });
      card.appendChild(grid);
    }

    container.appendChild(card);
  });
}

async function loadGalleryManifest() {
  if (window.__GALLERY_MANIFEST__ && Array.isArray(window.__GALLERY_MANIFEST__.sections)) {
    return window.__GALLERY_MANIFEST__.sections;
  }
  try {
    const response = await fetch("./gallery-manifest.json", { cache: "no-store" });
    if (!response.ok) throw new Error("No se encontró gallery-manifest.json");
    const data = await response.json();
    return Array.isArray(data.sections) ? data.sections : [];
  } catch (error) {
    console.warn("No pudimos cargar el manifiesto de galería", error);
    return [];
  }
}

function setupGalleryModalInteractions() {
  if (galleryInteractionsBound) return;
  galleryInteractionsBound = true;

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest("[data-gallery-toggle]");
    if (toggle) {
      event.preventDefault();
      const sectionIndex = Number(toggle.dataset.galleryToggle || 0);
      toggleGallerySection(sectionIndex);
      return;
    }

    const closeTrigger = event.target.closest("[data-gallery-close]");
    if (closeTrigger) {
      event.preventDefault();
      closeGalleryModal();
      return;
    }

    const prevTrigger = event.target.closest("[data-gallery-prev]");
    if (prevTrigger) {
      event.preventDefault();
      navigateGallery(-1);
      return;
    }

    const nextTrigger = event.target.closest("[data-gallery-next]");
    if (nextTrigger) {
      event.preventDefault();
      navigateGallery(1);
      return;
    }

    const imageTrigger = event.target.closest("[data-gallery-trigger]");
    if (imageTrigger) {
      event.preventDefault();
      const sectionIndex = Number(imageTrigger.dataset.sectionIndex || 0);
      const imageIndex = Number(imageTrigger.dataset.imageIndex || 0);
      openGalleryModal(sectionIndex, imageIndex);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (isGalleryModalOpen()) {
      if (event.key === "Escape") {
        closeGalleryModal();
      } else if (event.key === "ArrowRight") {
        navigateGallery(1);
      } else if (event.key === "ArrowLeft") {
        navigateGallery(-1);
      }
    }
  });
}

function openGalleryModal(sectionIndex, imageIndex) {
  const modal = document.getElementById("gallery-modal");
  if (!modal || !gallerySectionsData.length) return;
  galleryModalState = {
    sectionIndex: clampGalleryIndex(sectionIndex),
    imageIndex: clampImageIndex(sectionIndex, imageIndex),
  };
  updateGalleryModalMedia();
  modal.classList.add("is-open");
  modal.removeAttribute("hidden");
  document.body.style.overflow = "hidden";
}

function closeGalleryModal() {
  const modal = document.getElementById("gallery-modal");
  if (!modal) return;
  const videoEl = document.getElementById("gallery-modal-video");
  if (videoEl) {
    videoEl.pause();
    videoEl.removeAttribute("src");
    videoEl.load();
  }
  const imgEl = document.getElementById("gallery-modal-image");
  if (imgEl) {
    imgEl.removeAttribute("src");
  }
  modal.classList.remove("is-open");
  modal.setAttribute("hidden", "hidden");
  document.body.style.overflow = "";
}

function navigateGallery(step) {
  if (!gallerySectionsData.length) return;
  const section = gallerySectionsData[galleryModalState.sectionIndex];
  if (!section || !Array.isArray(section.images) || !section.images.length) return;

  let newIndex = galleryModalState.imageIndex + step;
  if (newIndex < 0) {
    newIndex = section.images.length - 1;
  } else if (newIndex >= section.images.length) {
    newIndex = 0;
  }
  galleryModalState.imageIndex = newIndex;
  updateGalleryModalMedia();
}

function clampGalleryIndex(index) {
  if (!gallerySectionsData.length) return 0;
  if (index < 0) return 0;
  if (index >= gallerySectionsData.length) return gallerySectionsData.length - 1;
  return index;
}

function clampImageIndex(sectionIndex, imageIndex) {
  const section = gallerySectionsData[sectionIndex];
  if (!section || !section.images || !section.images.length) return 0;
  if (imageIndex < 0) return 0;
  if (imageIndex >= section.images.length) return section.images.length - 1;
  return imageIndex;
}

function updateGalleryModalMedia() {
  const modal = document.getElementById("gallery-modal");
  const imgEl = document.getElementById("gallery-modal-image");
  const videoEl = document.getElementById("gallery-modal-video");
  const captionEl = document.getElementById("gallery-modal-caption");
  const section = gallerySectionsData[galleryModalState.sectionIndex];
  if (!modal || !imgEl || !videoEl || !captionEl || !section) return;
  const item = section.images[galleryModalState.imageIndex];
  if (!item) return;

  const isVideo = item.type === "video";
  if (isVideo) {
    imgEl.hidden = true;
    imgEl.removeAttribute("src");
    videoEl.hidden = false;
    videoEl.src = item.src;
    videoEl.setAttribute("aria-label", item.label || item.filename || "Video de galería");
    videoEl.load();
    videoEl.play().catch(() => {});
  } else {
    videoEl.pause();
    videoEl.hidden = true;
    videoEl.removeAttribute("src");
    videoEl.load();
    imgEl.hidden = false;
    imgEl.src = item.src;
    imgEl.alt = item.alt || `${section.name} · ${item.label || item.filename || "Imagen"}`;
  }

  captionEl.textContent = `${section.name} · ${item.label || item.filename || ""}`;
}

function isGalleryModalOpen() {
  const modal = document.getElementById("gallery-modal");
  return modal && modal.classList.contains("is-open");
}

function toggleGallerySection(sectionIndex) {
  const sectionCard = document.querySelector(`[data-gallery-section="${sectionIndex}"]`);
  if (!sectionCard) return;
  const toggleButton = sectionCard.querySelector("[data-gallery-toggle]");
  const isExpanded = sectionCard.classList.toggle("is-expanded");
  if (toggleButton) {
    toggleButton.textContent = isExpanded ? "Ocultar álbum" : "Ver álbum";
  }
}

function renderOperations(elements, operations = {}) {
  if (!operations) return;

  if (elements.access && operations.access) {
    elements.access.textContent = operations.access;
  }
  if (elements.schedule && operations.schedule) {
    elements.schedule.textContent = operations.schedule;
  }
  if (elements.capacity && operations.capacity) {
    elements.capacity.textContent = operations.capacity;
  }
  if (elements.channels) {
    elements.channels.innerHTML = "";
    if (Array.isArray(operations.channels) && operations.channels.length) {
      operations.channels.forEach((channel) => {
        const li = document.createElement("li");
        li.textContent = channel;
        elements.channels.appendChild(li);
      });
    }
  }
  if (elements.memberships) {
    elements.memberships.innerHTML = "";
    if (Array.isArray(operations.memberships) && operations.memberships.length) {
      operations.memberships.forEach((membership) => {
        const card = document.createElement("article");
        card.className = "membership-card";
        const title = document.createElement("h3");
        title.textContent = membership.name;
        const details = document.createElement("p");
        details.textContent = membership.details;
        const fee = document.createElement("small");
        fee.textContent = membership.fee;
        card.append(title, details, fee);
        elements.memberships.appendChild(card);
      });
    }
  }
  if (elements.commitments) {
    elements.commitments.innerHTML = "";
    if (Array.isArray(operations.commitments) && operations.commitments.length) {
      operations.commitments.forEach((commitment) => {
        const li = document.createElement("li");
        li.textContent = commitment;
        elements.commitments.appendChild(li);
      });
    }
  }
}

function setupSmoothScroll() {
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-scroll]");
    if (!trigger) return;
    const target = document.querySelector(trigger.dataset.scroll);
    if (!target) return;
    event.preventDefault();
    
    // Calcular offset usando getBoundingClientRect para mayor precisión
    const headerHeight = 90; // Offset que coincide con scroll-margin-top
    const extraOffset = 20; // Espacio adicional para detenerse antes
    
    // Offset adicional específico para la sección de Manifiesto
    const isManifesto = target.id === 'manifesto';
    const manifestoExtraOffset = isManifesto ? 40 : 0;
    
    const targetRect = target.getBoundingClientRect();
    const targetPosition = targetRect.top + window.pageYOffset - headerHeight - extraOffset - manifestoExtraOffset;
    
    window.scrollTo({
      top: targetPosition,
      behavior: "smooth"
    });
  });
}

function setupSubscriptionLink(config) {
  const link = document.querySelector("[data-subscribe-link]");
  if (!link) return;

  const currentHref = link.getAttribute("href") || "";

  if (config.urls?.subscription_form) {
    link.href = config.urls.subscription_form;
    return;
  }

  if (!currentHref || currentHref.startsWith("#")) {
    link.removeAttribute("href");
    link.setAttribute("aria-disabled", "true");
    link.textContent = "Formulario no disponible";
  }
}

function setYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  try {
    console.log('Iniciando aplicación...');
    setYear();
    setupNav();
    setupSmoothScroll();
    console.log('Cargando configuración...');
    const config = await loadConfig();
    console.log('Configuración cargada:', config.hero?.title);
    hydrateUI(config);
    setupSubscriptionLink(config);
    const sections = await loadGalleryManifest();
    gallerySectionsData = sections;
    const galleryContainer = document.getElementById("gallery-sections");
    renderGallery(galleryContainer, sections);
    setupGalleryModalInteractions();
    setupGalleryModalInteractions();
    setupScrollAnimations();
    console.log('Aplicación inicializada correctamente');
  } catch (error) {
    console.error("Error inicializando la página", error);
  }
});

// Animaciones de scroll
function setupScrollAnimations() {
  const sections = document.querySelectorAll('.section');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  sections.forEach(section => {
    observer.observe(section);
  });
}
