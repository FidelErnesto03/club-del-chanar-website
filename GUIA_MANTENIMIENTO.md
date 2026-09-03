# Guía de mantenimiento del sitio

## Qué se puede actualizar sin tocar la lógica

La landing se organiza en `index.html`, `css/styles.css`, `js/app.js` y `assets/recorrido/`. Las siete estancias están en el HTML para que el relato se lea y edite de forma directa.

Para reemplazar una fotografía:

1. Elegir una imagen real del espacio, sin datos personales ni marcas de terceros.
2. Preparar una versión WebP de hasta 1800 px de ancho y mantener el peso razonable.
3. Sustituir el archivo correspondiente en `assets/recorrido/` (`porton`, `jardin`, `galeria`, `fuego`, `terraza`, `experiencias` o `contacto`).
4. Revisar el texto alternativo en `index.html`; debe describir la imagen sin prometer más de lo que muestra.
5. Ejecutar `npm run build` y verificar la copia resultante en `dist/`.

## Cambios de operación

Las capacidades, turnos, anticipación mínima, seña y cancelaciones están centralizadas en `docs/DECISIONES-CANONICAS-WEB.md`. Si cambia una regla, actualizar ese documento y luego revisar el texto visible y las validaciones de `js/app.js`.

## Cambios de contacto

El WhatsApp público aparece en tres lugares: el botón del asistente, el enlace del bloque de contacto y el mensaje prellenado de `js/app.js`. El correo y el enlace de Maps viven en el bloque de contacto de `index.html`.

## Prueba antes de publicar

- Ejecutar `npm run build`.
- Servir `dist/` con `python3 -m http.server 4173 --directory dist`.
- Probar navegación, menú móvil, formulario de cuatro pasos y enlace a WhatsApp.
- Probar con “Reducir movimiento” activo en el sistema operativo.
- Verificar que no aparezcan precios, formularios rotos ni límites contradictorios.
- Revisar que la página siga siendo usable con teclado y lector de pantalla básico.
