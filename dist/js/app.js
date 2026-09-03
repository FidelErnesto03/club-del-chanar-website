(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.body.classList.add("js-ready");

  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.querySelector(".main-nav");

  const setHeaderState = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  menuToggle?.addEventListener("click", () => {
    const open = mainNav?.classList.toggle("is-open") ?? false;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  });

  mainNav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
      menuToggle?.setAttribute("aria-label", "Abrir menú");
    });
  });

  const revealItems = document.querySelectorAll("[data-reveal]");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8%" });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const parallaxTarget = document.querySelector("[data-parallax]");
  if (parallaxTarget && !reducedMotion) {
    let parallaxTicking = false;
    const updateParallax = () => {
      const rect = parallaxTarget.parentElement.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, -rect.top / Math.max(rect.height, 1)));
      parallaxTarget.style.transform = `translate3d(0, ${progress * 34}px, 0)`;
      parallaxTicking = false;
    };
    window.addEventListener("scroll", () => {
      if (parallaxTicking) return;
      parallaxTicking = true;
      window.requestAnimationFrame(updateParallax);
    }, { passive: true });
    updateParallax();
  }

  document.querySelector("[data-year]")?.replaceChildren(String(new Date().getFullYear()));

  const form = document.querySelector("#quote-form");
  if (!form) return;

  const steps = [...form.querySelectorAll("[data-step]")];
  const nextButton = form.querySelector("[data-next]");
  const prevButton = form.querySelector("[data-prev]");
  const submitButton = form.querySelector("[data-submit]");
  const progress = form.querySelector("[data-progress]");
  const status = form.querySelector(".form-status");
  const eventTypeInputs = [...form.querySelectorAll("input[name=eventType]")];
  const peopleInput = form.querySelector("#people");
  const capacityNote = form.querySelector("[data-capacity-note]");
  const shiftSelect = form.querySelector("#shift");
  const dateInput = form.querySelector("#date");
  let currentStep = 1;

  const baseShiftOptions = [...shiftSelect.options].map((option) => ({
    value: option.value,
    label: option.textContent,
  }));

  const getEventType = () => form.querySelector("input[name=eventType]:checked")?.value ?? "";

  const localDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const minimumReservationDate = () => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + 15);
    return localDate(date);
  };

  const refreshCapacity = () => {
    const type = getEventType();
    const isSocial = type === "social";
    const max = isSocial ? 45 : 25;
    peopleInput.max = String(max);
    capacityNote.textContent = isSocial
      ? "Hasta 45 personas para celebraciones sociales."
      : "Hasta 25 personas para corporativo, talleres y producciones.";

    const allowed = type === "corporativo"
      ? ["", "Diurno · 10:30 a 16:30", "Sunset · 16:30 a 22:30", "Jornada corporativa · 09:00 a 18:00"]
      : type === "taller"
        ? ["", "Taller · 14:00 a 19:30", "Diurno · 10:30 a 16:30"]
        : ["", "Diurno · 10:30 a 16:30", "Sunset · 16:30 a 22:30"];

    const selectedValue = shiftSelect.value;
    shiftSelect.replaceChildren(...baseShiftOptions
      .filter((option) => allowed.includes(option.value))
      .map((option) => {
        const element = document.createElement("option");
        element.value = option.value;
        element.textContent = option.label;
        return element;
      }));
    shiftSelect.value = allowed.includes(selectedValue) ? selectedValue : "";
  };

  const clearErrors = () => form.querySelectorAll(".field-error").forEach((item) => item.replaceChildren());

  const showError = (field, message) => {
    const target = form.querySelector(`[data-error-for="${field}"]`);
    if (target) target.textContent = message;
  };

  const validateStep = (step) => {
    clearErrors();
    if (step === 1 && !getEventType()) {
      showError("eventType", "Elegí una opción para continuar.");
      return false;
    }

    if (step === 2) {
      const value = Number(peopleInput.value);
      const max = Number(peopleInput.max);
      if (!peopleInput.value || !Number.isInteger(value) || value < 1 || value > max) {
        showError("people", `Ingresá una cantidad entre 1 y ${max} personas.`);
        return false;
      }
    }

    if (step === 3) {
      if (!dateInput.value) showError("date", "Elegí una fecha estimada.");
      if (dateInput.value && dateInput.value < dateInput.min) showError("date", "Las solicitudes se reciben con un mínimo de 15 días.");
      if (!shiftSelect.value) showError("shift", "Elegí un turno para continuar.");
      return Boolean(dateInput.value && dateInput.value >= dateInput.min && shiftSelect.value);
    }

    if (step === 4) {
      const name = form.querySelector("#name");
      const whatsapp = form.querySelector("#whatsapp");
      if (!name.value.trim() || !whatsapp.value.trim()) {
        showError("contact", "Necesitamos tu nombre y WhatsApp para responderte.");
        return false;
      }
      const email = form.querySelector("#email");
      if (email.value && !email.validity.valid) {
        showError("contact", "Revisá el formato del email o dejalo vacío.");
        return false;
      }
    }

    return true;
  };

  const showStep = (step) => {
    currentStep = step;
    steps.forEach((item) => {
      const isCurrent = Number(item.dataset.step) === step;
      item.hidden = !isCurrent;
      item.classList.toggle("is-active", isCurrent);
    });
    prevButton.hidden = step === 1;
    nextButton.hidden = step === steps.length;
    submitButton.hidden = step !== steps.length;
    progress.style.width = `${step / steps.length * 100}%`;
    status.replaceChildren();
    clearErrors();
  };

  dateInput.min = minimumReservationDate();
  refreshCapacity();
  eventTypeInputs.forEach((input) => input.addEventListener("change", refreshCapacity));

  nextButton.addEventListener("click", () => {
    if (!validateStep(currentStep)) return;
    showStep(Math.min(steps.length, currentStep + 1));
  });

  prevButton.addEventListener("click", () => showStep(Math.max(1, currentStep - 1)));

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateStep(4)) return;

    const values = new FormData(form);
    const typeLabels = {
      corporativo: "Off-site corporativo",
      social: "Celebración social",
      taller: "Taller o retiro",
      produccion: "Producción de foto o contenido",
    };
    const date = String(values.get("date"));
    const [year, month, day] = date.split("-");
    const message = [
      "Hola, El Club del Chañar. Quiero consultar disponibilidad.",
      "",
      `Tipo de encuentro: ${typeLabels[values.get("eventType")] ?? values.get("eventType")}`,
      `Personas estimadas: ${values.get("people")}`,
      `Fecha estimada: ${day}/${month}/${year}`,
      `Turno: ${values.get("shift")}`,
      `Nombre: ${values.get("name")}`,
      `WhatsApp: ${values.get("whatsapp")}`,
      values.get("email") ? `Email: ${values.get("email")}` : "",
      values.get("notes") ? `Idea / notas: ${values.get("notes")}` : "",
    ].filter(Boolean).join("\n");

    const whatsappUrl = `https://wa.me/5493515643361?text=${encodeURIComponent(message)}`;
    status.textContent = "Abriendo WhatsApp con tu consulta…";
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  });
})();
