# ZeroPlay streaming-provider wordmarks

The **Streaming providers** homepage carousel displays only these eight services, in a fixed order:

1. Netflix
2. Hulu
3. Disney+
4. HBO Max
5. Apple TV
6. Paramount+
7. Peacock
8. YouTube TV

No other provider is shown in this section. The selection stays the same across regions and when switching Movies / TV series; the TMDB/JustWatch region feed only controls whether each tile can open that service's matching catalog. If a service is not listed in the selected region, its tile remains visible but reports that catalog availability is unknown rather than silently opening an unrelated service.

The original transparent wide SVG wordmarks for Netflix, Hulu, Disney+, HBO Max, Apple TV, Paramount+ and Peacock were sourced from the public assets of [ecklf/lg-luma](https://github.com/ecklf/lg-luma/tree/main/assets/logos). YouTube TV's red-and-white wide wordmark was sourced from [devmianharoon/zipiai](https://github.com/devmianharoon/zipiai/blob/main/public/assets/logos/youtube-tv-logo.svg).

Electron displays these local SVG assets directly. For Android Mobile/TV/Lite, `scripts/render-provider-wordmarks.py` rasterizes exactly the eight chosen wordmarks to transparent PNGs during CI packaging, so there is no need to download provider artwork from TMDB. The historical `prime.svg` source may remain in the repository but is **not displayed or included in Android's active provider-logo bundle**.

All service marks belong to their respective owners. Catalog listings are sourced from TMDB/JustWatch. Showing a logo does not imply a partnership, subscription or guaranteed local streaming availability.

Carousel behavior is consistent with TMDB Trending Today: the horizontal scrollbar is hidden but users can scroll with mouse wheel, mouse drag, trackpad, touch, keyboard focus or the left/right arrow controls.
