# Guía de Galería Local - Gestión Manual

## ⚠️ Sistema de Gestión Manual

**Importante:** Esta galería NO gestiona automáticamente las imágenes. Requiere intervención manual para agregar contenido.

## Estructura de Carpetas

La galería local usa la siguiente estructura de carpetas:

```
assets/gallery/
├── principal/           # Álbum destacado (imágenes principales)
├── recorridos-botanicos/ # Recorridos botánicos
└── laboratorio-oficios/ # Laboratorio de oficios
```

## Cómo Agregar Imágenes

### 1. Acceso al Servidor
Debes tener acceso directo al servidor donde está alojado el sitio web.

### 2. Subir imágenes manualmente
Coloca las imágenes directamente en las carpetas del servidor:

```bash
# Ejemplo para álbum principal
scp tus_imagenes.jpg usuario@servidor:/ruta/al/sitio/assets/gallery/principal/

# O usando FTP/SFTP
# Subir archivos directamente a la carpeta correspondiente
```

### 3. Organización
- **Formatos soportados:** JPG, PNG, WebP
- **Tamaño recomendado:** 800-1200px de ancho
- **Nombres descriptivos:** Usa nombres como `jardin-comunitario.jpg`, `taller-ceramica.jpg`
- **Optimización:** Comprime las imágenes para mejor rendimiento

## Características de la Galería

### ✅ Ventajas
- **Total control** - Tú gestionas todas las imágenes
- **Sin dependencias externas** - No requiere Google Fotos
- **Rápida carga** - Imágenes locales se cargan instantáneamente
- **SEO mejorado** - Las imágenes están en tu propio dominio
- **Privacidad** - No hay tracking de terceros

### ⚠️ Limitaciones
- **Gestión manual** - No hay interfaz de subida automática
- **Acceso requerido** - Necesitas acceso al servidor
- **Sin previsualización** - No hay vista previa antes de subir

## Proceso de Actualización

1. **Preparar imágenes** en tu computadora local
2. **Acceder al servidor** via SSH, FTP o SFTP
3. **Subir archivos** a la carpeta correspondiente
4. **Verificar permisos** de lectura
5. **Recargar la página** para ver los cambios

## Solución de Problemas

### Si las imágenes no aparecen:
1. Verifica que los archivos estén en la carpeta correcta del servidor
2. Confirma que los nombres de archivo no tengan espacios o caracteres especiales
3. Asegúrate de que los archivos tengan permisos de lectura (644)
4. Verifica que las rutas en el código HTML sean correctas

### Para mejor rendimiento:
- Usa herramientas como [Squoosh](https://squoosh.app) para optimizar imágenes
- Mantén las imágenes por debajo de 500KB cada una
- Usa formato WebP cuando sea posible para mejor compresión

## Alternativas Consideradas

Si la gestión manual es complicada, considera:
- **Google Fotos embebido** (requiere cuenta de Google)
- **Servicio de hosting de imágenes** como Cloudinary
- **Plugin de galería** con interfaz de administración