#!/usr/bin/env python3
"""Builds StrikeLab's self-hosted Inter and JetBrains Mono files.

Google Fonts serves both without the OpenType features our CSS asks for
(slashed zero, I/l/1 disambiguation), and its latin files carry no Greek, no
arrows and no maths symbols, so σ, Δ, →, ✓ and √ fall back to whatever the
device has. This script pins the upstream releases, cuts each font to the
weights and characters StrikeLab renders, keeps the features we use, and drops
JetBrains Mono's coding ligatures: a beginner has to see `<=`, not `≤`.

Run it only when a font version or the character list changes:

    python3 -m pip install -r scripts/fonts/requirements.txt
    python3 scripts/fonts/build_fonts.py

Outputs (committed): src/app/fonts/inter-text.woff2,
src/app/fonts/jetbrains-mono-code.woff2 and the two OFL licence files.
"""

import hashlib
import io
import os
import pathlib
import shutil
import urllib.request
import zipfile

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = pathlib.Path(__file__).resolve().parents[2]
CACHE = ROOT / ".font-cache"
OUT = pathlib.Path(os.environ.get("FONT_OUT_DIR", ROOT / "src" / "app" / "fonts"))

SOURCES = {
    "inter": {
        "url": "https://github.com/rsms/inter/releases/download/v4.1/Inter-4.1.zip",
        "sha256": "9883fdd4a49d4fb66bd8177ba6625ef9a64aa45899767dde3d36aa425756b11e",
        "font": "InterVariable.ttf",
        "license": "LICENSE.txt",
    },
    "jetbrains-mono": {
        "url": "https://github.com/JetBrains/JetBrainsMono/releases/download/v2.304/JetBrainsMono-2.304.zip",
        "sha256": "6f6376c6ed2960ea8a963cd7387ec9d76e3f629125bc33d1fdcd7eb7012f7bbf",
        "font": "fonts/variable/JetBrainsMono[wght].ttf",
        "license": "OFL.txt",
    },
}

# Every character StrikeLab renders, from a scan of src/ and content/ on
# 2026-10-02: Latin-1, typographic punctuation, Greek (the Greeks, σ, μ, β),
# sub- and superscripts, arrows, maths operators and the UI symbols ▶ ▲ ▼ ✓ ✗ ⌘.
# Neither font has ✕ ◌ ✦ ◉ ∓ ≡ ᵀ; those few stay with the system.
UNICODES = (
    "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02B3,U+02C6,U+02DA,U+02DC,"
    "U+0391-03A9,U+03B1-03C9,U+1D62,U+2010-2027,U+2030-203A,U+2044,U+2070-209C,"
    "U+20AC,U+2122,U+2190-2199,U+21B5,U+21BB,U+2202,U+2206,U+2211-2212,U+2215,"
    "U+221A,U+221E,U+2248,U+2260,U+2264-2265,U+2295,U+2297,U+2318,U+25B2-25B3,"
    "U+25B6,U+25BC,U+25C6,U+25CB,U+25CF,U+2713,U+2717,U+2C7C"
)

BUILDS = [
    {
        "source": "inter",
        "output": "inter-text.woff2",
        # Text optical size; 400-700 are the weights the CSS gets today.
        "axes": {"opsz": 14, "wght": (400, 700)},
        "features": "kern,mark,mkmk,ccmp,locl,calt,liga,tnum,pnum,zero,ss02,case,frac,numr,dnom,sups,subs",
    },
    {
        "source": "jetbrains-mono",
        "output": "jetbrains-mono-code.woff2",
        "axes": {"wght": (400, 700)},
        # No calt: that feature holds every coding ligature.
        "features": "ccmp,locl,zero",
        # Box drawing, for the "# ── Helpers ──" dividers in starter code.
        "extra_unicodes": "U+2500-257F",
    },
]


def fetch(name: str) -> zipfile.ZipFile:
    spec = SOURCES[name]
    CACHE.mkdir(exist_ok=True)
    archive = CACHE / f"{name}.zip"
    if not archive.exists():
        with urllib.request.urlopen(spec["url"]) as response, open(archive, "wb") as fh:
            shutil.copyfileobj(response, fh)
    digest = hashlib.sha256(archive.read_bytes()).hexdigest()
    if digest != spec["sha256"]:
        archive.unlink()
        raise SystemExit(f"{name}: checksum mismatch ({digest}); refusing to build")
    return zipfile.ZipFile(archive)


def build(spec: dict) -> pathlib.Path:
    source = SOURCES[spec["source"]]
    with fetch(spec["source"]) as archive:
        font = TTFont(io.BytesIO(archive.read(source["font"])), lazy=False)
        licence = archive.read(source["license"])
    # Round-trip the instanced font so the subsetter sees fully compiled tables.
    # Timestamps stay as the source has them, so rebuilding unchanged inputs
    # gives byte-identical files (no noise in git).
    instanced_font = instancer.instantiateVariableFont(font, spec["axes"])
    instanced_font.recalcTimestamp = False
    instanced = io.BytesIO()
    instanced_font.save(instanced)
    instanced.seek(0)
    font = TTFont(instanced, lazy=False, recalcTimestamp=False)

    options = subset.Options()
    options.layout_features = spec["features"].split(",")
    subsetter = subset.Subsetter(options=options)
    unicodes = UNICODES + ("," + spec["extra_unicodes"] if "extra_unicodes" in spec else "")
    subsetter.populate(unicodes=subset.parse_unicodes(unicodes))
    subsetter.subset(font)

    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / spec["output"]
    font.flavor = "woff2"
    font.save(target)
    (OUT / f"LICENSE-{spec['source']}.txt").write_bytes(licence)
    return target


if __name__ == "__main__":
    for spec in BUILDS:
        path = build(spec)
        print(f"{path.relative_to(ROOT) if path.is_relative_to(ROOT) else path}: {path.stat().st_size} bytes")
