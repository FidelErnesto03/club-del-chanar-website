# Línea base de diseño del portal

**Estado:** propuesta v0.1 · aprobada para prototipado

## Decisión de producto

El Club del Chañar no debe presentarse como un marketplace ni como un salón de eventos convencional. Debe funcionar como un **portal editorial de conversión serena**: una persona entiende el lugar, reconoce si su encuentro encaja, conoce las condiciones básicas y puede consultar una fecha sin fricción.

La paleta actual se conserva. La revisión se concentra en jerarquía, diagramación, tipografía, fotografía, densidad y recorrido.

## Referencias comparadas

- Los portales de espacios como Peerspace y Venue Marketplace ponen primero actividad, ubicación, capacidad, servicios, disponibilidad y consulta.
- Los portales corporativos como RetreatsAndVenues ayudan a filtrar por tamaño, presupuesto, actividades y equipamiento.
- Los espacios boutique como Urban Farmhouse Room, Gallery DeFi y The James Museum combinan atmósfera con capacidad, inventario espacial, tipos de evento y una consulta claramente visible.
- En espacios regionales de naturaleza como La Vieja Cigarra, Laureles Holístico y La Abundancia aparecen usos concretos, ambientes nombrados, agenda cuando corresponde y contacto directo.

La conclusión no es copiar ninguna referencia: es ordenar la experiencia alrededor de la decisión del visitante.

## Arquitectura base

1. **Inicio:** qué es, ubicación, uso exclusivo, capacidad y CTA `Consultar fecha`.
2. **Encuentros:** social, corporativo y talleres; cada uno con capacidad y encaje.
3. **El espacio:** galería, jardín, terraza, fuego, conectividad y otros recursos confirmados.
4. **Cómo funciona:** consulta, revisión, propuesta y confirmación humana.
5. **Registro real:** selección breve de fotografías honestas y contextualizadas.
6. **Ubicación y preguntas frecuentes:** acceso, horarios, capacidad, política y contacto.

## Reglas de diagramación

- Retícula de 12 columnas en escritorio y una columna legible en móvil.
- Contenedor máximo aproximado de 1.200 px.
- Tres modos de sección: hero informativo, tarjetas comparables y bloque partido texto/imagen.
- No repetir una imagen a pantalla completa en cada sección.
- No usar capítulos numerados como estructura principal de navegación.
- La capacidad y el siguiente paso deben aparecer en el primer viewport.
- Un CTA principal persistente y un CTA secundario; evitar múltiples acciones equivalentes.
- Reducir parallax y animaciones de entrada a transiciones discretas, respetando `prefers-reduced-motion`.

## Reglas tipográficas

- Dos familias como máximo: serif de identidad para títulos y sans para lectura, navegación, datos y formularios.
- Texto principal de 16 px o más; etiquetas de uso frecuente de 14 px o más.
- H1 aproximado: 52–64 px en escritorio y 40–46 px en móvil.
- Párrafos de 60–70 caracteres por línea como máximo orientativo.
- Cursiva solo para énfasis excepcional, no en todos los titulares.
- Probar fuentes con acentos, números y lectura móvil antes de decidir.

## Pruebas a comparar

1. **Fraunces + DM Sans:** distintiva, orgánica y con mayor personalidad.
2. **Newsreader + Manrope:** editorial, calmada y menos ornamental.
3. **Source Serif 4 + IBM Plex Sans:** sobria, estable y muy legible.

## Fotografía

El hero debe mostrar una lectura representativa del lugar, no una imagen de obra o de detalle aislado. La primera selección debe cubrir llegada, galería, jardín, terraza, disposición de encuentro, atardecer y un detalle material. Las personas solo deben aparecer con autorización.

Mientras el registro fotográfico sea parcial, se debe declarar como tal y evitar construir una experiencia cinematográfica que prometa más de lo que las imágenes prueban.

## Conversión y confianza

- CTA principal: `Consultar fecha`.
- CTA secundario: `Ver fotos del lugar`.
- No publicar tarifas si la política comercial aún no está cerrada.
- La solicitud no confirma automáticamente una reserva.
- El primer contacto debe pedir pocos datos: tipo de encuentro, fecha, cantidad, nombre y WhatsApp.
- No inventar testimonios, servicios, equipamiento o casos de uso.

## Accesibilidad mínima

Validar contraste de 4,5:1 para texto normal y 3:1 para texto grande, reflujo sin desplazamiento horizontal a 320 px, espaciado de texto modificable y foco visible en controles. La referencia normativa es WCAG 2.2.

## Criterio de aceptación del rediseño

Una persona nueva debe poder responder, sin recorrer toda la página:

1. ¿Qué es El Club?
2. ¿Mi encuentro encaja?
3. ¿Cuántas personas admite?
4. ¿Qué incluye el espacio?
5. ¿Cómo consulto una fecha?

Si el diseño mejora la atmósfera pero empeora alguna de esas respuestas, no está aprobado.
