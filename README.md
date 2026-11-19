# Late Shift — adult industry trade news site

A static, multi-page English trade publication for the adult industry: talent and agencies,
platform economics, novelty retail, legal and policy, webmaster technology, adult games and
EU regulation. 38 stories across seven sections, 57 pages, no build tooling required at runtime.

The layout follows the structure of a conventional adult-industry trade site: a dark utility
bar, a white masthead with a red block wordmark, a **dark navigation bar with an INDUSTRY NEWS
dropdown** listing the seven sections, a red square kicker over each section, a large lead story
with a right-hand rail (SPONSOR unit, Popular News, Industry Events), a dark newsletter band and
a multi-column footer.

## What is in this folder

```
site/                     the built static site — this is what you deploy (zip root)
content/
  site.json               brand, tagline, sections, authors, events
  wire.json               PR wire items
  articles/*.json         the 38 stories, one file per section
tools/
  build.py                generator, stdlib only: python tools/build.py
  check.py                link / anchor / asset / meta checker
  process_images.py       rebuilds 720px and 1440px derivatives from _ref/raw
  shots.py                Playwright screenshot pass (needs a local server)
README.md
```

## Build

```bash
python tools/build.py     # regenerates every page, sitemap.xml, search index
python tools/check.py     # expect: "checked 57 pages" + "no broken links or missing metadata"
```

Python 3.10+ with no third-party packages for the generator. Screenshots need Playwright and a
Chromium-based browser, but the site itself needs neither.

Preview locally:

```bash
cd site
python -m http.server 8801 --bind 127.0.0.1
```

## Deploy to GitHub + Cloudflare Pages

1. Unzip `Late-Shift-Website.zip`. Push the **contents** of the folder (not the folder itself) to
   a new GitHub repository, so `index.html` sits at the repo root.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git, pick the repo.
   Framework preset **None**, build command **empty**, build output directory **/**.
   (Or use Upload assets and drag the folder for an instant `*.pages.dev` URL.)
3. Custom domain: Pages → Custom domains. HTTPS is issued automatically; `_headers` and
   `404.html` take effect with no configuration.

## Before going live

1. Change `domain` (`https://lateshift.example`) and `email` (`augustgrant33@outlook.com`) in
   `content/site.json`, then rebuild. Canonical URLs, Open Graph tags, JSON-LD, the sitemap and
   the footer all read from there.
2. `Late Shift` is a working title — check the trademark and the domain before commercial use.
3. Every company, fund, agency and person in the 38 stories is fictional. The figures exist to
   illustrate a mechanism, not to report events. Replace them with real reporting or label the
   site as a demonstration before publishing.
4. The newsletter and contact forms validate in the browser and show a demo notice; nothing is
   submitted. Point them at Buttondown / Mailchimp / Formspree in `assets/js/site.js`
   (`data-signup` and `data-demo-form` blocks).
5. The SPONSOR unit in the hero rail is a house promotion linking to `advertise.html`. No ad
   tags, trackers or third-party scripts are included anywhere in the build.

## What was deliberately removed

* No original site name, logo, publisher name, postal address or contact address.
* No images carrying watermarks or site identifiers — every photograph is generated in-house and
  intentionally non-explicit: studios, racks, shelves, documents, venues, screens.
* Every page carries its own `<title>`, meta description and meta keywords plus canonical,
  Open Graph and NewsArticle JSON-LD.
* No analytics, no advertising code, no CDN fonts, no external requests at all — the only
  `http://` strings in the HTML are the placeholder domain and the `schema.org` vocabulary.

## Content scope

Trade-facing coverage only: platform economics, payments and underwriting, assortment and
packaging, age assurance and state filings, delivery and moderation engineering, game retention
and localisation, EU policy. No performer-private material, no escort or dating-service content.

## Maintenance

The date in the utility bar is written at build time — rerun `python tools/build.py` to refresh
it. New stories are added as JSON objects in `content/articles/<section>.json`; the generator
handles category pages, the home grid, the wire, the search index and the sitemap.
