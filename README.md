# El Club del Chañar · Website

Sitio estático one-page que representa la identidad del Club del Chañar, con estructura ligera (HTML + CSS + JS) y una sección de suscripción que redirige a un Google Form para recopilar datos.

## Estructura

```
website/
├─ index.html        # Maquetado principal
├─ config.json       # Contenidos editables por no técnicos
├─ css/styles.css    # Estilos y sistema visual
├─ js/app.js         # Comportamiento (config, galería, formulario)
├─ assets/logo.png   # Identidad visual
├─ README.md         # Esta guía de despliegue
└─ GUIA_OPERACION.md # Cambios cotidianos (textos, álbum, contactos)
```

## Requisitos

- Cualquier servidor de archivos estático (Netlify, Vercel, GitHub Pages, nginx, etc.).
- Fuente `config.json` actualizada con los textos, la galería local y la URL del Google Form.

## Cómo probar localmente

1. Instala un servidor estático simple (`npm install -g serve` o usa `python3 -m http.server`).
2. Desde la carpeta `website`, ejecuta por ejemplo:
   ```bash
   npx serve .
   ```
3. Abre `http://localhost:3000` (o el puerto indicado) para validar contenido.

## Despliegue

1. Sube la carpeta `website/` completa al hosting elegido.
2. Configura cache busting básico (Netlify/Vercel lo hacen automáticamente).
3. Habilita HTTPS.
4. Verifica que `config.json` esté accesible públicamente y que el enlace al Google Form sea el definitivo compartible.

## Configuración dinámica

Toda la personalización base ocurre en `config.json`:

- `hero_*`: textos y CTA del bloque inicial.
- `hero_location` y `hero_description`: ubicación y bajada breve del hero.
- `story`: título, descripción, lista de hechos y `image` para la sección “El lugar”.
- `principles`: objetos con `title` + `description` para la sección de principios rectores.
- `spaces_overview`: tarjetas de servicios/espacios (`name`, `description`, `image`, `services`).
- `infrastructure`: lista de highlights operativos (`title`, `details`).
- `shared_use`: `intro`, `modes` (cada uno con `title`, `description`, `guides`) y `cta`.
- `operations`: `schedule`, `capacity`, `access`, `channels`, `memberships` (nombre/detalles/aporte) y `commitments`.
- `subscription_form_url`, `contact_email`, `norms`, `space_description`: contenidos reutilizados en múltiples secciones.

Puedes incorporar nuevas ilustraciones colocando archivos en `assets/` y haciendo referencia al path en el JSON.

## Integraciones

### Galería local

1. Guarda tus imágenes o videos optimizados (<200 KB recomendado para imágenes; videos MP4/WebM/MOV) dentro de `website/assets/gallery/<nombre-de-seccion>/`.
2. Sitúate en la carpeta `website/` y ejecuta `npm run build:gallery`. El script actualiza `gallery-manifest.json` y `js/gallery-data.js` con el tipo de cada archivo.
3. Publica las carpetas junto con ambos archivos; el sitio mostrará tarjetas por sección y abrirá un visor modal que soporta imágenes y videos.

### Google Forms

1. Crea el formulario en Google Forms con los campos deseados.
2. (Opcional) Conecta el formulario a una hoja de cálculo desde el propio Forms para mantener un registro automático.
3. Usa `Enviar > Link` para copiar la URL pública.
4. Pega esa URL en `config.json` dentro de `subscription_form_url`. El botón de la sección “Suscripción” abrirá ese enlace en una pestaña nueva.

## Checklist de publicación

- [ ] Imágenes optimizadas (<400 KB total la página).
- [ ] Verificar contraste (WCAG AA) con Lighthouse o Stark.
- [ ] Abrir el enlace externo del formulario para asegurarse de que es el definitivo.
- [ ] Confirmar que la galería local muestre las imágenes esperadas.
- [ ] Actualizar año en footer (automático vía JS, validar en la previsualización).

## Mantenimiento

- Toda la personalización base ocurre en `config.json`.
- Cambios estructurales en `index.html` deben seguir la paleta y tipografías del Manual de Identidad.
- Documenta en `GUIA_OPERACION.md` cualquier actualización relevante para que el equipo no técnico tenga trazabilidad.
