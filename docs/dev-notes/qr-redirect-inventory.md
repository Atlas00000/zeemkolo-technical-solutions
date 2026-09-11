# Dev note — QR / barcode redirect inventory

**Status:** Placeholder **301** map is live in `client/next.config.ts`. Replace sources with the real paths printed on hardware labels / legacy Canva pages once scanned.

## Current placeholder destinations

| Source (example) | Destination |
| --- | --- |
| `/qr/placeholder`, `/qr/home` | `/` |
| `/qr/consult`, `/qr/consultation` | `/consultation` |
| `/qr/zeemble`, `/qr/course`, `/qr/library` | `/zeemble` |
| `/qr/store`, `/qr/shop`, `/qr/kit` | `/store` |
| `/qr/forum` | `/forum` |
| `/canva`, `/canva/:path*`, `/home` | `/` |
| `/services`, `/book` | `/consultation` |
| `/academy` | `/zeemble` |
| `/shop` | `/store` |

## Before DNS cutover

1. Photograph / export every physical QR and Canva short path.
2. Update `qrRedirects` in `next.config.ts` (keep `permanent: true`).
3. Smoke-test each path returns **301** to the correct app route.
4. Remove unused placeholders so unknown legacy URLs do not silently land on `/`.

*— Phase 6 Day 23*
