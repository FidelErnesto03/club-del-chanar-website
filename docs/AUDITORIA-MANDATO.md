# Auditoría de cumplimiento · Mandato web

**Versión auditada:** reconstrucción del recorrido · 3 de septiembre de 2026  
**Rama:** `codex/reconstruccion-recorrido`  
**Alcance:** fuente estática, build de publicación y documentación operativa.

## Resultado

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| Identidad canónica | ✓ | Variables CSS con las cinco tintas aprobadas; Lora + Plus Jakarta Sans; logo oficial derivado sin deformar. |
| Vocabulario de movimiento | ✓ | Revelado por `IntersectionObserver` y parallax único de hero usando `transform`; `prefers-reduced-motion` desactiva ambos. |
| Sistema fotográfico | ✓ | Siete derivados WebP en `assets/recorrido/`; cada estancia tiene alt text y la interfaz declara “Registro real del espacio”. |
| Recorrido inmersivo | ✓ | Portón, Jardín, Galería, Fuego, Terraza, Experiencias y Contacto/Reserva en una sola página. |
| Tono premium-rústico | ✓ | Composición editorial, materialidad, serif de títulos, paleta tierra/oliva/ámbar y uso de aire. |
| Capacidad pública | ✓ | 45 social; 25 corporativo, talleres y retiros; el asistente ajusta el máximo según tipo. |
| Política de reserva | ✓ | Mínimo de 15 días, turnos, un grupo por turno, buffer y confirmación humana documentados y validados. |
| Conversión WhatsApp | ✓ | CTA y formulario de cuatro pasos; el mensaje se estructura y abre `wa.me/5493515643361`. |
| Sin tarifas fijas | ✓ | No hay precios en la interfaz ni en el `config.json` activo. |
| Especificación CRM | ✓ | `docs/CRM-LEADS.md` contiene campos, etapas y respuesta inicial. |
| Rendimiento | ✓ | `dist/` publica solo la landing y ocho WebP optimizados; peso medido: aproximadamente 2,4 MB. |
| Accesibilidad básica | ✓ | HTML semántico, labels, fieldset/legend, foco visible, skip link, estado aria-live y menú móvil etiquetado. |
| Compatibilidad de hosting | ✓ | `CNAME`, `dist/`, `.nojekyll` y `.openai/hosting.json` presentes; build reproducible. |
| Secretos / basura | ✓ | No se agregaron credenciales, endpoints privados ni contenido de campaña; originales históricos no se eliminan. |

## Pruebas ejecutadas

```text
node --check js/app.js                         PASS
python3 JSON parse de config y hosting         PASS
python3 referencias HTML → archivos locales    PASS
bash scripts/build-site.sh                     PASS
npm --offline run build                        PASS
HTTP estático de index y galeria.webp          PASS
```

## Limitaciones conocidas

- Los dos documentos canónicos anunciados por el usuario no estuvieron disponibles en el checkout. La política se dejó en `docs/DECISIONES-CANONICAS-WEB.md` como consolidación provisional, con trazabilidad para sustituirla.
- Las fotografías disponibles son registros reales en distintas etapas del espacio; el sitio lo comunica y no las presenta como un catálogo final.
- La reserva es una orientación sin backend: no bloquea fechas, no cobra y no almacena datos. La confirmación queda en la gestión.
- No se verificaron claims inestables de la documentación de promoción (velocidades, calificaciones, presupuestos o proveedores); no se publicaron.
