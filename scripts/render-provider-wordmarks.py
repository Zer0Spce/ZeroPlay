#!/usr/bin/env python3
"""Render ZeroPlay's bundled streaming-provider SVG wordmarks for native Android.

Windows Electron loads the same original vector files directly. Android's ImageView
needs transparent PNGs; this conversion runs before signing the four test APKs.
"""
from pathlib import Path
import struct
import cairosvg

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "windows" / "ui" / "provider-logos"
DEST = ROOT / "app" / "src" / "main" / "assets" / "provider-logos"
BRANDS = ("netflix", "hulu", "disney", "max", "apple", "paramount", "peacock", "youtube-tv")

def main():
    DEST.mkdir(parents=True, exist_ok=True)
    for brand in BRANDS:
        source = SOURCE / (brand + ".svg")
        dest = DEST / (brand + ".png")
        if not source.is_file():
            raise FileNotFoundError(str(source))
        data = source.read_bytes()
        if b"<svg" not in data or b"</svg>" not in data:
            raise ValueError("Missing/invalid SVG: " + str(source))
        cairosvg.svg2png(bytestring=data, write_to=str(dest),
                         output_width=512, output_height=256)
        encoded = dest.read_bytes()
        if encoded[:8] != b"\x89PNG\r\n\x1a\n" or len(encoded) < 250:
            raise ValueError("Invalid/empty PNG: " + str(dest))
        width, height = struct.unpack(">II", encoded[16:24])
        if (width, height) != (512, 256):
            raise ValueError("Wrong logo dimensions: " + str(dest))
        print(f"Generated transparent Android wordmark: {brand} ({len(encoded)} bytes)")

if __name__ == "__main__":
    main()
