#!/usr/bin/env python3
"""Genera derivados responsive WebP + manifest para el website.

- Conserva los originales intactos.
- Escribe assets/img/_derived/<ruta>-<w>.webp
- Escribe js/img-manifest.js (window.ClubImgManifest)
"""
import json
from pathlib import Path

from PIL import Image

ROOT = Path("/home/vatrox/workspace/mi_club/website")
IMG = ROOT / "assets" / "img"
DERIVED = IMG / "_derived"
DERIVED.mkdir(exist_ok=True)

# Activos usados con srcset en hero, selector, agenda, experiencias y Cada Rincón
TARGETS = [
    "carousel/casa-entre-arboles.webp",
    "carousel/galeria-arbol.webp",
    "carousel/terraza.webp",
    "carousel/galeria-panoramica.webp",
    "casa/jardin/01.webp",
    "casa/terraza/01.webp",
    "casa/galeria/01.webp",
    "casa/galeria/05.webp",
    "casa/fuego/01.webp",
    "casa/servicios/01.webp",
    "experiencias/01.webp",
    "experiencias/02.webp",
    "experiencias/03.webp",
    "experiencias/04.webp",
    "experiencias/05.webp",
    "experiencias/06.webp",
    "experiencias/07.webp",
    "events/excursion-chanar-001.webp",
    "events/lab-ia-001.webp",
    "events/clasicos-80-90-001.webp",
]
WIDTHS = (480, 768, 1200)

manifest = {}
for rel in TARGETS:
    src = IMG / rel
    if not src.exists():
        print("falta", rel)
        continue
    im = Image.open(src).convert("RGB")
    ow, oh = im.size
    widths = [w for w in WIDTHS if w < ow]
    if not widths:
        continue
    entry = []
    for w in widths:
        h = round(oh * w / ow)
        out = DERIVED / rel.replace(".webp", f"-{w}.webp")
        out.parent.mkdir(parents=True, exist_ok=True)
        im.resize((w, h), Image.LANCZOS).save(out, "WEBP", quality=78, method=6)
        entry.append(w)
    manifest[rel] = entry

# Manifest JS
lines = ["/* Generado por generate-derived.py — no editar a mano. */",
         "window.ClubImgManifest = " + json.dumps(manifest, ensure_ascii=False, indent=2) + ";", ""]
(ROOT / "js" / "img-manifest.js").write_text("\n".join(lines), encoding="utf-8")

total = sum(f.stat().st_size for f in DERIVED.rglob("*.webp"))
print("derivados:", len(list(DERIVED.rglob('*.webp'))), "archivos,", round(total / 1024), "KB")
print("manifest entradas:", len(manifest))
