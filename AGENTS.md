# AccountingTitan – Agent Notes

This repository represents a **static site deployment pipeline** for the AccountingTitan marketing/content site. It is **not a live WordPress site**.

## Source of truth

- The content in `site/` is treated as **prebuilt static HTML/CSS/JS**.
- The site is deployed as **static assets via Cloudflare** using `wrangler.jsonc` and the `./site` directory.
- The `exports/` directory is just where a ZIP of the prebuilt static site is dropped before being extracted into `site/`.

## Relationship to WordPress

Historically, the content originated from a WordPress export, so you will still see:

- WordPress-like directory names under `site/wp-*`.
- Block-library JS and CSS that reference `@wordpress/*` or `wp-*` class names.

These are legacy implementation details of the static bundle and **do not mean this repository is a WordPress application**:

- There is **no PHP**, **no database**, and **no WordPress runtime** here.
- The repo only contains static assets and tooling around them.

## How the pipeline works (high level)

1. A static site bundle (ZIP) is produced upstream (currently from WordPress, but conceptually any generator could be used).
2. That ZIP is copied into `exports/` and extracted into `site/`.
3. `tools/content_inventory.py` can be run to generate `content_inventory.csv` from the HTML in `site/`.
4. `wrangler deploy` publishes `site/` to Cloudflare as a static site.

## What agents should assume

- Treat this as a **generic static site** hosted on Cloudflare, not as a WordPress project.
- It is safe to:
  - Manipulate files under `site/` as opaque static assets (HTML/CSS/JS),
  - Extend or modify the deployment/config via `wrangler.jsonc`,
  - Work with `tools/content_inventory.py` and `content_inventory.csv`.
- It is **not** appropriate to:
  - Add WordPress plugins, themes, or PHP,
  - Assume there is a dynamic CMS or admin UI in this repo.
