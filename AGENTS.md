# Reglas de diseño y construcción

Estas reglas gobiernan todo cambio visual en El Club del Chañar.

## Autoridad

1. La solicitud y las decisiones explícitas del usuario.
2. `PRODUCT.md` y `docs/DECISIONES-CANONICAS-WEB.md` para producto y operación.
3. El manifiesto y el manual de identidad para carácter, voz, materiales y marca.
4. `DESIGN.md`, cuando exista, para decisiones visuales aprobadas.
5. Las skills y sus catálogos como herramientas de análisis; ninguna salida automática puede reemplazar el brief.

## Stack de cinco skills

Usar las cinco en este orden para una nueva portada o un rediseño material:

1. `impeccable`: inicializar contexto, tratar la portada actual como anti-referencia, plantear el reemplazo visual y cerrar la revisión por evidencia.
2. `frontend-design`: derivar una dirección propia del lugar y revisar que no sea una plantilla intercambiable.
3. `ui-ux-pro-max`: consultar criterios concretos de tipografía, UX, responsive o accesibilidad. Nunca aceptar su dirección automática sin verificar el encaje con `PRODUCT.md`.
4. `web-animation-design`: definir una sola coreografía principal y las respuestas a interacción; animar únicamente `transform` y `opacity`, con variante de movimiento reducido.
5. `web-design-guidelines`: auditar HTML, CSS y JavaScript antes de pedir aprobación.

La construcción y el preview se realizan con Sites. No guardar ni desplegar una nueva versión antes de que el usuario apruebe el prototipo renderizado.

## Flujo obligatorio

1. Leer `PRODUCT.md`, las decisiones canónicas y las fotografías disponibles.
2. Producir primero una composición de alta fidelidad del primer viewport. El objetivo es fijar jerarquía, tipografía, tratamiento fotográfico, materia y profundidad antes de escribir la página completa.
3. Mostrar la composición renderizada en el chat. No ofrecer HTML sin CSS, wireframes de texto ni enlaces que dependan de rutas rotas.
4. Tras la aprobación, implementar la portada completa en una rama de trabajo.
5. Servir el sitio localmente y capturar, en una misma ronda, 1440 px y 390 px.
6. Comparar las capturas con el concepto aprobado; corregir los defectos materiales en un solo lote y confirmar con una segunda ronda como máximo.
7. Ejecutar auditoría de accesibilidad, interacción, imágenes, motion y rendimiento. Recién entonces actualizar `dist/` o publicar.

## Criterio visual vinculante

- “Casa Abierta” sigue siendo una idea conceptual, no una plantilla ni una diagramación aprobada.
- El diseño debe nacer de umbral, sombra, árbol, ladrillo, madera, arena, fuego y recorrido vertical.
- La primera pantalla debe contener una tesis visual memorable, no un hero estándar con etiqueta, titular serif, párrafo y dos botones.
- Gastar la expresividad en una sola idea dominante y mantener el resto disciplinado.
- Variar escala, densidad, imagen y silencio a lo largo del recorrido; evitar una sucesión de bloques equivalentes.
- Las fotografías reales son evidencia y materia, no relleno de tarjetas.

## Rechazos explícitos

- Portadas planas, simplistas, textuales o intercambiables con cualquier alojamiento o espacio para eventos.
- Fondos crema + serif editorial usados como atajo de “lujo orgánico”.
- Cejas en mayúsculas sobre cada título, palabras sueltas en cursiva, numeración decorativa y filas de tres tarjetas iguales.
- Bento grids, glassmorphism, gradientes decorativos, sombras genéricas y bordes redondeados repetidos sin función.
- Revelados idénticos en cada sección, parallax gratuito o animación que oculte contenido por defecto.
- Stock, testimonios, premios, cifras, servicios o disponibilidad inventados.

## Controles mínimos

- Anchos: 375, 390, 768, 1024 y 1440 px.
- Contenido legible con zoom y reflujo; sin desplazamiento horizontal.
- Áreas táctiles de al menos 44 × 44 px.
- Foco visible y orden semántico de encabezados.
- Imágenes con dimensiones explícitas, `alt` apropiado y carga diferida bajo el pliegue.
- No usar `transition: all`; desactivar motion no esencial con `prefers-reduced-motion`.
- CTA coherente: “Consultar fecha” o una variante que describa con precisión el paso a WhatsApp.
