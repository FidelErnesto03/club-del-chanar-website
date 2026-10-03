#!/usr/bin/env python3
"""Control de paridad editorial — El Club del Chañar.

Compara valores clave de `data/config.json` con el respaldo estático de
`index.html` (textos y metadatos). Sale con código 1 si hay divergencias.

Uso:
    python3 scripts/check-parity.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "data" / "config.json"
INDEX = ROOT / "index.html"


def inner_text(html, data_attr):
    m = re.search(r'data-' + re.escape(data_attr) + r'[^>]*>([^<]*)<', html)
    return m.group(1).strip() if m else None


def meta_content(html, attr, value):
    m = re.search(r'<meta[^>]*' + attr + r'="' + re.escape(value) + r'"[^>]*content="([^"]*)"', html)
    return m.group(1).strip() if m else None


def main():
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    html = INDEX.read_text(encoding="utf-8")
    checks = []

    def check(label, expected, found):
        checks.append((label, expected, found, expected == found))

    hero = cfg.get("hero", {})
    check("title", cfg["site"]["seo"]["title"], (re.search(r"<title>([^<]*)</title>", html) or [None, None])[1])
    check("meta description", cfg["site"]["seo"]["description"], meta_content(html, "name", "description"))
    check("og:title", cfg["site"]["seo"]["title"], meta_content(html, "property", "og:title"))
    check("og:description", cfg["site"]["seo"]["description"], meta_content(html, "property", "og:description"))
    check("hero title", hero.get("title"), inner_text(html, "hero-title"))
    check("hero subtitle", hero.get("subtitle"), inner_text(html, "hero-subtitle"))
    check("hero facts", hero.get("facts"), inner_text(html, "hero-facts"))
    check("hero cta 1", hero.get("ctaPrimary"), inner_text(html, "hero-cta-primary-text"))
    check("hero cta 2", hero.get("ctaSecondary"), inner_text(html, "hero-cta-secondary-text"))
    check("agenda title", cfg["agenda"].get("title"), inner_text(html, "agenda-title"))
    check("inquiry submit", cfg["inquiry"].get("submitLabel"), inner_text(html, "submit-label"))
    check("footer location", cfg["location"].get("publicLabel"), inner_text(html, "footer-location"))
    check("whatsapp link", "wa.me/" + cfg["contact"]["whatsapp"] in html, True)
    check("email link", "mailto:" + cfg["contact"]["email"] in html, True)

    fails = [c for c in checks if not c[3]]
    for label, exp, found, ok in checks:
        if not ok:
            print(f"  DIVERGE {label}: config={exp!r} html={found!r}")
    if fails:
        print(f"PARIDAD: {len(fails)} divergencia(s) de {len(checks)} controles.")
        return 1
    print(f"PARIDAD OK: {len(checks)} controles coinciden.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
