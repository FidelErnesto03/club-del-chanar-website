# Guía de Operación · El Club del Chañar

Este documento resume tareas habituales para mantener vivo el sitio sin tocar código.

## 1. Actualizar textos

1. Abre `config.json` en cualquier editor plano.
2. Modifica los campos necesarios (`hero_title`, `hero_subtitle`, `space_description`, etc.).
3. Guarda y sube el archivo al hosting.
4. Refresca el sitio; los cambios aparecen de inmediato sin redeploy completo.

> Tip: Mantén el tono del manifiesto; usa frases breves y verbos en presente.

## 2. Actualizar normas o pilares

- En `config.json`, edita la lista `"norms"`. Puedes agregar o quitar ítems sin cambiar HTML.
- Para nuevos pilares de membresías, duplica uno de los `<article>` del bloque `#membresias` en `index.html` y ajusta el título/texto.

## 3. Sección “El lugar” y servicios

- `story`: cambia título, descripción, viñetas o la ilustración (`image`) desde `config.json`. Puedes apuntar a cualquier archivo dentro de `assets/`.
- `spaces_overview`: cada objeto representa una tarjeta de servicios/espacios. Actualiza `name`, `description`, `services` o `image` para reflejar nuevos ambientes.
- `shared_use`: ajusta `intro`, `cta` y las modalidades (`modes`). Cada modo acepta `title`, `description` y una lista `guides` con orientaciones prácticas para futuros miembros.

> Sugerencia: reutiliza el mismo tono del Manifiesto. Usa verbos en infinitivo o presente para los bullet points.

## 4. Principios, infraestructura y operación

- `principles`: responde a los principios rectores del Manifiesto. Mantén frases cortas con énfasis en verbos o valores (ej. “Uso consciente”).
- `infrastructure`: detalla los sistemas de soporte (conectividad, seguridad, clima, higiene). Úsalo para comunicar mejoras sin tocar HTML.
- `operations`: define horario, capacidad, canales de comunicación y tarjetas de membresía. Ajusta los aportes sugeridos o agrega/quita `memberships`. Los `commitments` se muestran como checklist en el sitio.

## 5. Galería local

1. Guarda imágenes (PNG/JPG/WEBP/SVG) o videos (MP4/WebM/MOV/M4V) en `assets/gallery/<nombre-seccion>/` (dentro de la carpeta `website/`).
2. Desde `website/`, ejecuta `npm run build:gallery` para regenerar `gallery-manifest.json` y `js/gallery-data.js`.
3. Sube las carpetas + ambos archivos; el sitio mostrará las secciones y el visor modal reproducirá imágenes y videos.

## 6. Formulario y Google Sheets

- La URL `sheet_webhook_url` debe apuntar al despliegue activo de Apps Script.
- Cuando actualices el script o la hoja, vuelve a desplegar y reemplaza la URL.
- Revisa la hoja antes de cada evento para asegurarte de que no haya filas duplicadas.

## 7. Revisión de identidad visual

Antes de publicar cambios:

- Verifica que el logo mantenga proporción y haya suficiente espacio libre alrededor.
- Confirma que los colores usados correspondan a la paleta oficial (ver `css/styles.css`).
- Usa las tipografías definidas (Montserrat, Libre Baskerville, Raleway/Open Sans).

## 8. Checklist operativa mensual

- [ ] Probar el formulario con una dirección real (borra la fila de test luego).
- [ ] Revisar que la galería muestre la foto de portada correcta.
- [ ] Actualizar actividades o próximos eventos en el bloque de Membresías si aplica.
- [ ] Validar Lighthouse (Performance y Accessibility ≥ 90).
- [ ] Confirmar que el enlace al Manifiesto funcione.

Cualquier cambio mayor debe alinearse con el Manual de Identidad Visual y el Manifiesto Fundacional.
