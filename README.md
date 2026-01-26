# AccountingTitan

AccountingTitan is a static site deployment pipeline for the AccountingTitan content. It takes a ZIP archive of prebuilt static HTML assets, extracts it into `site/`, can generate a content inventory, and serves the site as static assets via Cloudflare Workers.

## Overview

**Key components**

- `exports/` – where you place the ZIP archive containing your static site assets.
- `site/` – extracted static site files (HTML, CSS, JS, images) that are actually served.
- `tools/content_inventory.py` – Python script that crawls the static site in `site/` and generates a CSV content inventory.
- `content_inventory.csv` – generated report describing pages, URLs, pillars, metadata, etc.
- `wrangler.jsonc` – Cloudflare Workers configuration for deploying `site/` as static assets.

**High-level flow**

1. Obtain or build a ZIP archive of the AccountingTitan static site.
2. Drop the ZIP file into `exports/` and extract it to `site/`.
3. (Optional) Run `tools/content_inventory.py` to generate `content_inventory.csv`.
4. Preview the site locally from `site/`.
5. Deploy the static site to Cloudflare using `wrangler`.

## Prerequisites

- **Python**
  - Python 3.8+ installed and available as `python3`.
- **Cloudflare account**
  - A Cloudflare account and the **Wrangler CLI** installed and authenticated.
- **Basic CLI tools**
  - `unzip` or another archive tool for extracting the static site ZIP.

## Project Structure

- `README.md` – project documentation.
- `exports/` – input directory for the static site ZIP archive.
- `site/` – static site root; this is what gets served and deployed.
- `tools/`
  - `content_inventory.py` – generates `content_inventory.csv` from the HTML in `site/`.
- `content_inventory.csv` – generated content inventory (created/overwritten by the Python script).
- `wrangler.jsonc` – Cloudflare Workers configuration; serves `./site` as static assets.

## Getting Started

### 1. Prepare a static site archive

Use your preferred tooling or CMS to build the AccountingTitan site as static HTML, CSS, JS, and assets, then package it as a ZIP file (for example, `accounting-titan-export.zip`).

### 2. Add the archive to the repository

Place the ZIP in `exports/`:

```bash
cd /path/to/AccountingTitan
cp /path/to/accounting-titan-export.zip exports/
```

You now have, for example:

- `exports/accounting-titan-export.zip`

### 3. Extract into `site/`

Extract the ZIP into the `site/` directory. One typical pattern:

```bash
cd /path/to/AccountingTitan

# Ensure site/ exists and is empty (optional but recommended)
rm -rf site
mkdir site

# Extract the static site archive into site/
unzip exports/accounting-titan-export.zip -d site
```

After this step:

- `site/` contains the static HTML/CSS/JS/images.
- Top-level HTML files (e.g. `index.html`, `about/index.html`, etc.) are what will actually be served.

## Local Preview

To preview the static site locally, run a simple HTTP server from `site/`. For example, using Python:

```bash
cd /path/to/AccountingTitan
python3 -m http.server 8000 --directory site
```

Then open:

- `http://localhost:8000/` in your browser.

You should see the AccountingTitan site served as static content.

## Generating the Content Inventory

The `tools/content_inventory.py` script walks the `site/` directory, parses each HTML file, extracts key metadata, and writes it to `content_inventory.csv` at the repo root.

### Running the script

From the repository root:

```bash
cd /path/to/AccountingTitan
python3 tools/content_inventory.py
```

Output:

- A `content_inventory.csv` file in the project root.
- A log line similar to:
  - `Wrote N records to /path/to/AccountingTitan/content_inventory.csv`

### What the script does

The script:

- Recursively walks `site/`.
- Processes files ending in `.html`.
- Skips common CMS system paths such as:
  - `wp-includes/...`
  - `wp-content/...`
- Extracts metadata from `<meta>` tags and `<title>` elements.
- Infers a **pillar** from the top-level URL path segment.
- Classifies each HTML file as `article`, `page`, or `home`.

### CSV Columns

The generated CSV has these columns:

- `file_path` – path to the HTML file relative to `site/`, e.g. `financial-reporting/some-article/index.html`.
- `url` – normalized URL path, inferred from the file path:
  - `index.html` is treated as the directory root, e.g. `financial-reporting/some-article/index.html` → `/financial-reporting/some-article/`.
  - Non-directory paths gain a trailing `/` only when appropriate.
- `pillar` – high-level content pillar inferred from the first segment of the URL:
  - For example, the script currently maps:
    - `financial-reporting` → `Financial Reporting`
    - `taxation` → `Taxation`
    - `audit` → `Audit & Assurance`
    - `mergers-acquisitions` → `M&A`
    - `finance` → `Corporate Finance`
  - If the top-level segment isn’t in the map, it is capitalized (e.g. `careers` → `Careers`).
  - The site root `/` is labeled as `Home`.
- `kind` – classified page type:
  - `article` – if `og:type` is `article` or `article:published_time` is present.
  - `home` – if `og:type` is `website`.
  - `page` – fallback for all others.
- `article_section` – value of `<meta property="article:section">` if present (otherwise empty).
- `title` – cleaned `<title>` text.
- `published` – value of `<meta property="article:published_time">` if present.
- `modified` – value of `<meta property="article:modified_time">` if present.
- `description` – value of `<meta name="description">` if present.

### Typical Use Cases

- **Auditing content coverage** by pillar (Financial Reporting, Taxation, etc.).
- **Finding stale content** by comparing `published`/`modified` timestamps.
- **Reviewing metadata quality** (`description` presence, meaningful `title`s, etc.).

You can open `content_inventory.csv` in Excel, Numbers, Google Sheets, or any BI tool for further analysis.

## Deployment

This project is configured to serve the `site/` directory via Cloudflare using `wrangler.jsonc`.

### Wrangler configuration

`wrangler.jsonc` (simplified):

- `name` – the Cloudflare Worker name (e.g. `accounting-titan-site`).
- `compatibility_date` – the Cloudflare Workers compatibility date.
- `assets.directory` – where static assets live, set to `./site`.

### 1. Install and log in with Wrangler

If you don’t have Wrangler installed:

```bash
# Via npm (common)
npm install -g wrangler
```

Log in:

```bash
wrangler login
```

Follow the browser-based authentication flow.

### 2. Deploy the static site

From the repo root:

```bash
cd /path/to/AccountingTitan
wrangler deploy
```

Wrangler will:

- Read `wrangler.jsonc`.
- Upload the contents of `./site` as static assets.
- Create/update the Cloudflare Worker and bind it to the configured route (depending on your Cloudflare configuration).

After deployment, Wrangler will print the deployed URL and/or your associated domain where the static site is accessible.

## Updating Content

To update content after making changes to the AccountingTitan site:

1. **Rebuild the static site archive** using your chosen build or export process.
2. **Replace the ZIP** in `exports/` with the new archive.
3. **Re-extract** into `site/`:
   - Clear `site/` or overwrite its contents.
   - Extract the new ZIP into `site/`.
4. **Redeploy**:
   - Run `wrangler deploy` to publish the updated static content.
5. **(Optional) Regenerate the content inventory**:
   - Run `python3 tools/content_inventory.py` to refresh `content_inventory.csv`.

## Troubleshooting

### The site doesn’t load correctly locally

- Ensure you’re serving from `site/` and not from the repo root.
  - Use the `--directory site` flag with `python3 -m http.server`.
- Check that the static site archive was fully extracted into `site/` (HTML/CSS/JS files should be present).

### `content_inventory.py` finds 0 records

- Confirm `site/` contains `.html` files.
- Ensure you’re running the script from the project root:
  - `python3 tools/content_inventory.py`.
- Verify there are no permission issues reading files in `site/`.

### Deployment issues with Wrangler

- Make sure you ran `wrangler login` successfully.
- Check that your Cloudflare account and zone/domain are configured for the Worker.
- Run with more verbose output if needed:
  - `wrangler deploy --log-level debug`.
