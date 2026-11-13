# Streaming-provider wordmarks

These transparent SVG assets are used as **wide service wordmarks** in the ZeroPlay streaming-provider carousel, replacing the square TMDB / JustWatch app icons previously shown in the provider row.

Source: publicly available vector wordmarks from [`ecklf/lg-luma` assets/logos](https://github.com/ecklf/lg-luma/tree/main/assets/logos), curated there from public provider and Wikimedia logo artwork. Some fills were adjusted for contrast on dark tiles (Apple TV, Paramount+, Max, Prime Video, Disney+, Peacock). All logos and trademarks remain the property of their respective owners. The app's provider tiles are independent TMDB/JustWatch listings and do not imply a commercial partnership.

Mapping: `netflix.svg`, `prime.svg`, `hulu.svg`, `disney.svg`, `paramount.svg`, `peacock.svg`, `max.svg`, `apple.svg`.

Electron displays SVGs directly. Native Android `ImageView` cannot reliably load SVGs; `scripts/render-provider-wordmarks.py` converts these sources to transparent 512×256 PNGs during GitHub Actions Android packaging. The PNGs are embedded under `app/src/main/assets/provider-logos` and no network requests are made for the bundled logos. If a service is unrecognized, the UI displays its name instead of a square app icon.
