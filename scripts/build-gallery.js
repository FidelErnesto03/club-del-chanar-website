#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GALLERY_ROOT = path.join(ROOT, 'assets', 'gallery');
const JSON_OUTPUT = path.join(ROOT, 'gallery-manifest.json');
const JS_OUTPUT = path.join(ROOT, 'js', 'gallery-data.js');
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.m4v']);

(async function build() {
  try {
    const sections = [];
    const stats = { sections: 0, images: 0 };
    const entries = await fs.promises.readdir(GALLERY_ROOT, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
      const sectionPath = path.join(GALLERY_ROOT, entry.name);
      const files = await fs.promises.readdir(sectionPath);
      const mediaItems = files
        .filter((file) => isSupportedMedia(file))
        .map((file) => ({
          src: `assets/gallery/${entry.name}/${file}`,
          filename: file,
          type: getMediaType(file),
        }));

      if (!mediaItems.length) continue;

      sections.push({
        name: formatName(entry.name),
        slug: entry.name,
        images: mediaItems,
      });

      stats.sections += 1;
      stats.images += mediaItems.length;
    }

    const manifest = {
      generatedAt: new Date().toISOString(),
      sections,
    };

    await fs.promises.writeFile(JSON_OUTPUT, JSON.stringify(manifest, null, 2));
    await fs.promises.writeFile(JS_OUTPUT, `window.__GALLERY_MANIFEST__ = ${JSON.stringify(manifest)};\n`);
    console.log(`Galería compilada: ${stats.sections} secciones, ${stats.images} imágenes.`);
  } catch (error) {
    console.error('Error al generar la galería:', error);
    process.exitCode = 1;
  }
})();

function formatName(dirName) {
  return dirName
    .split(/[-_]/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function isSupportedMedia(filename) {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.has(ext) || VIDEO_EXTENSIONS.has(ext);
}

function getMediaType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  return 'image';
}
