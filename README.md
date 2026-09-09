# Gammon’s Market

The Gammon’s Market neighborhood-market design, ported to the existing Astro and CloudCannon project. Eight pages cover the market, café, CSA, story, visit details, contact, and gift baskets. Photos, the supplied round logo, and fonts are served locally.

## Development

Use Node 22.12 or later within Node 22 (matching CloudCannon), or another version supported by Astro.

```sh
npm ci
npm run dev
```

Production validation:

```sh
npm run build
npm test
npm run preview
```

The tests inspect generated HTML, internal links, images, metadata, content bindings, schemas, redirects, and draft exclusion. They do not replace a browser or CloudCannon Visual Editor smoke test.

## Content editing

| What to change | Source |
| --- | --- |
| Page headings, copy, photos, cards, and FAQs | `src/content/pages/*.md` → `market` |
| Store hours, address, phone, email, Square URL, and shared visit section | `data/business.json` |
| Header/footer navigation and logo | `data/navigation.json` |
| Default SEO metadata | `data/site.json` |
| Per-page SEO metadata | Page front matter → `seo` |
| Uploaded photos | `public/images/` |
| Layout and styling | `src/components/market/`, `src/styles/market.css` |

CloudCannon offers Visual and Data editors for pages. Text, image, and array regions are bound to their content sources; shared navigation and store details use file-backed component props. See [the editing and release checklist](docs/cloudcannon-editing.md).

Buttons with an `action` use the shared business links. An explicit `link` overrides the action. Ordering goes to the existing Square storefront. CSA and gift-basket enquiries open a prefilled email; they are not a checkout or a submitted web form.

## CloudCannon hosting

Keep the existing GitHub repository connected to CloudCannon. Preview the redesign branch before merging into the branch CloudCannon publishes.

- Install: `npm ci`
- Build: `npm run build`
- Output: `dist`
- Node: `22` (22.12+)
- Site origin: `https://www.gammonsmarket.com/`; optionally override with the `SITE_URL` build environment variable.

Initial settings are in `.cloudcannon/initial-site-settings.json`. Existing CloudCannon sites may require their saved build settings to be checked separately. Redirects in `.cloudcannon/routing.json` preserve the old location and gift-basket URLs when hosted on CloudCannon.

This repository has no dependency on the ChatGPT-hosted preview. The migration does not change DNS, connect a custom domain, or publish to production by itself.

## Preserved starter features

Blog, pagination, tags, feed, and generic page components remain available. The eight demonstration posts are marked `draft: true` and excluded from public routes, the feed, and sitemap. The unlinked blog index has an empty state until real posts are published. Archived source-editable About examples are retained under `.cloudcannon/examples/` outside active routes.

## Validation notes

The production build and 10 automated checks pass. A local Chrome smoke test covered all eight pages at 1440px and 390px, loaded images, horizontal overflow, mobile menu open/close/Escape/navigation, FAQ toggling, and page JavaScript errors. Desktop and mobile homepage screenshots were visually reviewed. A signed-in CloudCannon editor session still needs to be tested before release, especially image replacement and shared-data edits; confirm the Square checkout handoff separately.

The inherited dependency tree reported 27 npm audit advisories at migration time (2 low, 8 moderate, 16 high, 1 critical). Runtime dependency versions were not upgraded as part of this design transfer; review and remediate them separately before production release. The existing editor bundle also emits a non-fatal `punycode` browser-compatibility warning via `markdown-it`.

Font and icon licenses are in `public/licenses/`.
