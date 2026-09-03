# El Club del Chañar · Website

Landing estática de una página para El Club del Chañar. La experiencia se recorre como una caminata por siete estancias: Portón, Jardín, Galería, Fuego, Terraza, Experiencias y Contacto/Reserva.

## Stack

- HTML semántico, CSS y JavaScript vanilla.
- Diseño mobile-first, sin backend ni almacenamiento de datos.
- Fotografías reales optimizadas en `assets/recorrido/`.
- Compatible con GitHub Pages mediante `CNAME` y con Sites mediante `.openai/hosting.json`.

## Desarrollo

```bash
bash scripts/build-site.sh
python3 -m http.server 4173 --directory dist
```

Abrir `http://localhost:4173`.

El comando de build publica en `dist/` solo los archivos necesarios para la versión estática. El formulario es una demo de cotización: valida tipo, capacidad, fecha mínima, turno y contacto; luego abre WhatsApp con una consulta estructurada. No guarda datos ni confirma reservas automáticamente.

## Contenidos y reglas

- `docs/DECISIONES-CANONICAS-WEB.md`: política unificada provisional, capacidades, turnos, anticipación y cancelaciones.
- `docs/CRM-LEADS.md`: operación mínima para registrar y seguir oportunidades.
- `GUIA_MANTENIMIENTO.md`: reemplazo de fotos, cambios de contacto y checklist.
- `spec-*.md` y documentos fundacionales: insumos de proyecto fuera de la web; revisar antes de modificar la política.

No publicar precios fijos, testimonios, métricas o servicios no confirmados. Cuando lleguen los dos documentos canónicos faltantes, revisar primero `docs/DECISIONES-CANONICAS-WEB.md` y después la interfaz.

## Publicación

La rama de trabajo de esta reconstrucción es `codex/reconstruccion-recorrido`. Antes de guardar una versión en Sites:

1. Ejecutar `bash scripts/build-site.sh`.
2. Verificar navegación, menú móvil, cuatro pasos del asistente y enlace a WhatsApp.
3. Revisar con movimiento reducido y teclado.
4. Confirmar que las capacidades visibles sean 45 social / 25 corporativo y talleres.
5. Crear el commit y usar exactamente ese SHA para la versión de Sites.
