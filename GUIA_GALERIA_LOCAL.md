# Guía de fotografía del recorrido

La web pública carga siete derivados livianos desde `assets/recorrido/`. Los originales de trabajo se conservan en `assets/gallery/` para no perder el archivo histórico.

## Reemplazar una imagen

1. Seleccionar una foto real del lugar, sin personas identificables sin autorización ni marcas de terceros.
2. Exportar a WebP con hasta 1800 px de ancho; para imágenes verticales usar hasta 1200 × 1500 px.
3. Reemplazar el archivo correspondiente: `porton`, `jardin`, `galeria`, `fuego`, `terraza`, `experiencias` o `contacto`.
4. Actualizar el texto alternativo de la imagen en `index.html`.
5. Ejecutar `bash scripts/build-site.sh` y revisar `dist/`.

La imagen debe documentar con honestidad el espacio actual. Si una escena todavía está en proceso, no agregar copy que la presente como terminada.
