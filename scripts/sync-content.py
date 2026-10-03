#!/usr/bin/env python3
"""Sincronización editorial — El Club del Chañar.

Actualiza el respaldo estático de `index.html` y los metadatos a partir de
`data/config.json`: título, descripción, OpenGraph, teléfono del JSON-LD,
enlaces de WhatsApp y email, y los textos de respaldo gobernados.

Es determinista e idempotente. Uso:
    python3 scripts/sync-content.py
"""
import html as html_mod
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "data" / "config.json"
INDEX = ROOT / "index.html"


def esc(s):
    return html_mod.escape(str(s), quote=True)


def set_inner(text, data_attr, value):
    pattern = r"(data-" + re.escape(data_attr) + r"[^>]*>)[^<]*(<)"
    new, n = re.subn(pattern, lambda m: m.group(1) + esc(value) + m.group(2), text, count=1)
    return new, n


def set_meta(text, key, attr, value):
    pattern = r'(<meta[^>]*' + key + r'="' + re.escape(attr) + r'"[^>]*content=")[^"]*(")'
    new, n = re.subn(pattern, lambda m: m.group(1) + esc(value) + m.group(2), text, count=1)
    return new, n


def main():
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    text = INDEX.read_text(encoding="utf-8")
    changes = []

    def apply(label, new_text, n):
        if n:
            changes.append(label)
        return new_text

    # Metadatos
    text = apply("title", re.sub(r"(<title>)[^<]*(</title>)",
                                 lambda m: m.group(1) + esc(cfg["site"]["seo"]["title"]) + m.group(2), text, count=1), 1)
    text = apply("description", *set_meta(text, "name", "description", cfg["site"]["seo"]["description"]))
    text = apply("og:title", *set_meta(text, "property", "og:title", cfg["site"]["seo"]["title"]))
    text = apply("og:description", *set_meta(text, "property", "og:description", cfg["site"]["seo"]["description"]))

    # Contacto
    wa = re.sub(r"\D", "", str(cfg["contact"]["whatsapp"]))
    tel = "+" + wa
    text = apply("telephone", re.sub(r'("telephone"\s*:\s*")[^"]*(")',
                                     lambda m: m.group(1) + tel + m.group(2), text, count=1), 1)
    text = apply("wa.me", re.sub(r"wa\.me/\d+", "wa.me/" + wa, text), len(re.findall(r"wa\.me/\d+", text)))
    text = apply("mailto", re.sub(r"mailto:[^\"']+", "mailto:" + cfg["contact"]["email"], text), len(re.findall(r"mailto:[^\"']+", text)))

    # Textos de respaldo gobernados
    pairs = [
        ("hero-title", cfg["hero"].get("title")),
        ("hero-subtitle", cfg["hero"].get("subtitle")),
        ("hero-facts", cfg["hero"].get("facts")),
        ("hero-cta-primary-text", cfg["hero"].get("ctaPrimary")),
        ("hero-cta-secondary-text", cfg["hero"].get("ctaSecondary")),
        ("agenda-title", cfg["agenda"].get("title")),
        ("agenda-subtitle", cfg["agenda"].get("subtitle")),
        ("submit-label", cfg["inquiry"].get("submitLabel")),
        ("footer-location", cfg["location"].get("publicLabel")),
        ("footer-notice", cfg["footer"].get("notice")),
    ]
    for attr, value in pairs:
        if value is None:
            continue
        text, n = set_inner(text, attr, value)
        apply(attr, text, n)

    INDEX.write_text(text, encoding="utf-8")
    print("Sincronizado:", ", ".join(changes) if changes else "sin cambios")
    print("WhatsApp:", wa, "| teléfono:", tel, "| email:", cfg["contact"]["email"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
