#!/usr/bin/env python3
"""Convert the approved original SVG provider artwork into left-trimmed Android drawables.
Windows SVG artwork is never modified.
"""
from pathlib import Path
import io
import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "windows" / "ui" / "provider-logos"
ASSETS = ROOT / "app" / "src" / "main" / "assets" / "provider-logos"
DRAWABLES = ROOT / "app" / "src" / "main" / "res" / "drawable-nodpi"
BRANDS = ("netflix", "hulu", "disney", "max", "apple", "paramount", "peacock", "youtube-tv")

def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    DRAWABLES.mkdir(parents=True, exist_ok=True)
    for brand in BRANDS:
        svg = SOURCE / (brand + ".svg")
        if not svg.is_file():
            raise FileNotFoundError(str(svg))
        data = svg.read_bytes()
        if b"<svg" not in data or b"</svg>" not in data:
            raise ValueError("Invalid SVG: " + str(svg))
        # Render at provider's native aspect ratio; do not put the title logo
        # in a 512x256 transparent canvas (which makes a left-aligned image look centred).
        raw = cairosvg.svg2png(bytestring=data, output_width=512)
        rgba = Image.open(io.BytesIO(raw)).convert("RGBA")
        bounds = rgba.getchannel("A").getbbox()
        if bounds is None:
            raise ValueError("Invisible streaming-provider artwork: " + brand)
        cropped = rgba.crop(bounds)
        if cropped.width < 16 or cropped.height < 8:
            raise ValueError("Unexpectedly small artwork for " + brand)
        drawable = DRAWABLES / ("zero_provider_" + brand.replace("-", "_") + ".png")
        asset = ASSETS / (brand + ".png")
        cropped.save(drawable, format="PNG")
        cropped.save(asset, format="PNG")
        print(f"Verified left-trimmed {brand} provider logo: {cropped.width}x{cropped.height}")

if __name__ == "__main__":
    main()
