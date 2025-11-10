# Guía de Integración con Google Fotos

## Configuración de Álbumes Embebidos

### Para el Álbum Principal
1. **Crear álbum en Google Fotos:**
   - Ve a [photos.google.com](https://photos.google.com)
   - Crea un álbum o selecciona uno existente
   - Haz clic en "Compartir" y luego en "Crear enlace"

2. **Obtener código de inserción:**
   - Ve a [https://embedgooglephotos.com](https://embedgooglephotos.com)
   - Pega el enlace compartido de tu álbum
   - Copia el código del `<iframe>` generado

3. **Configurar en el sitio:**
   - En `config.json`, actualiza `gallery_album_url` con el valor del atributo `src` del iframe
   - Ejemplo: `"gallery_album_url": "https://photos.google.com/share/..."`

### Para Álbumes Alternativos
1. **Repite el proceso** para cada álbum adicional
2. **En `config.json`**, agrega cada álbum al array `gallery_alt_albums`:
   ```json
   "gallery_alt_albums": [
     {
       "title": "Recorridos botánicos",
       "url": "https://photos.google.com/share/..."
     },
     {
       "title": "Laboratorio de oficios", 
       "url": "https://photos.google.com/share/..."
     }
   ]
   ```

## Características de la Integración

### ✅ Ventajas
- **Visualización embebida** - Los álbumes se muestran directamente en la página
- **Sin redirecciones** - Los usuarios no salen del sitio web
- **Responsive** - Se adapta a todos los dispositivos
- **Carga lazy** - Optimizado para rendimiento

### ⚠️ Consideraciones
- **Permisos de álbum** - Asegúrate de que los álbumes estén configurados como "Cualquiera con el enlace"
- **Calidad de imágenes** - Google Fotos puede comprimir las imágenes en la vista embebida
- **Actualizaciones** - Los cambios en los álbumes se reflejan automáticamente

### 🎨 Personalización
- **Tamaños:** Los iframes se adaptan automáticamente al contenedor
- **Estilos:** Se aplican bordes redondeados y sombras para integración visual
- **Grid responsive:** Los álbumes alternativos se organizan en grid adaptable

## Solución de Problemas

### Si los álbumes no se cargan:
1. Verifica que los enlaces sean de álbumes compartidos públicamente
2. Asegúrate de usar el enlace de inserción (iframe) no el enlace de visualización
3. Revisa la consola del navegador para errores de CORS

### Para mejor calidad:
- Considera usar Google Photos API para mayor control (requiere desarrollo adicional)
- Alternativamente, puedes usar servicios como [PhotoStack](https://photostack.app) para galerías más avanzadas