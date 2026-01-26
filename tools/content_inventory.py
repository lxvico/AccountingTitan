#!/usr/bin/env python3
import os
import csv
import re
from datetime import datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE_DIR = os.path.join(ROOT, "site")
OUTPUT_PATH = os.path.join(ROOT, "content_inventory.csv")

PILLAR_MAP = {
    "financial-reporting": "Financial Reporting",
    "taxation": "Taxation",
    "audit": "Audit & Assurance",
    "mergers-acquisitions": "M&A",
    "finance": "Corporate Finance",
}

META_SECTION_RE = re.compile(r'<meta property="article:section" content="([^"]+)"', re.IGNORECASE)
META_PUBLISHED_RE = re.compile(r'<meta property="article:published_time" content="([^"]+)"', re.IGNORECASE)
META_MODIFIED_RE = re.compile(r'<meta property="article:modified_time" content="([^"]+)"', re.IGNORECASE)
META_DESC_RE = re.compile(r'<meta name="description" content="([^"]+)"', re.IGNORECASE)
META_OGTYPE_RE = re.compile(r'<meta property="og:type" content="([^"]+)"', re.IGNORECASE)
TITLE_RE = re.compile(r'<title>(.*?)</title>', re.IGNORECASE | re.DOTALL)


def rel_url(path: str) -> str:
    rel = os.path.relpath(path, SITE_DIR)
    rel = rel.replace(os.sep, "/")
    if rel.endswith("index.html"):
        rel = rel[: -len("index.html")]
    if not rel.startswith("/"):
        rel = "/" + rel
    # Ensure single trailing slash for directories
    if not rel or not rel.endswith("/"):
        if "." not in os.path.basename(path):
            if not rel.endswith("/"):
                rel += "/"
    return rel


def infer_pillar(url_path: str) -> str:
    # url_path like /financial-reporting/.../
    parts = [p for p in url_path.split("/") if p]
    if not parts:
        return "Home"
    top = parts[0]
    return PILLAR_MAP.get(top, top.capitalize())


def classify_kind(html: str) -> str:
    m = META_OGTYPE_RE.search(html)
    if m:
        og_type = m.group(1).lower()
        if og_type == "article":
            return "article"
        if og_type == "website":
            return "home"
    # Fallback heuristics
    if "article:published_time" in html:
        return "article"
    return "page"


def parse_meta(html: str):
    title = None
    m = TITLE_RE.search(html)
    if m:
        # Clean up whitespace and site suffix if present
        title = re.sub(r"\s+", " ", m.group(1)).strip()

    section = None
    m = META_SECTION_RE.search(html)
    if m:
        section = m.group(1).strip()

    published = None
    m = META_PUBLISHED_RE.search(html)
    if m:
        published = m.group(1).strip()

    modified = None
    m = META_MODIFIED_RE.search(html)
    if m:
        modified = m.group(1).strip()

    desc = None
    m = META_DESC_RE.search(html)
    if m:
        desc = m.group(1).strip()

    kind = classify_kind(html)

    return title, section, published, modified, desc, kind


def main():
    rows = []
    for root, _dirs, files in os.walk(SITE_DIR):
        for name in files:
            if not name.endswith(".html"):
                continue
            path = os.path.join(root, name)
            # Skip obvious system or sitemap-like HTML if any appear
            rel = os.path.relpath(path, SITE_DIR)
            if rel.startswith(("wp-includes", "wp-content")):
                continue
            try:
                with open(path, "r", encoding="utf-8", errors="ignore") as f:
                    html = f.read()
            except OSError:
                continue

            url = rel_url(path)
            pillar = infer_pillar(url)
            title, section, published, modified, desc, kind = parse_meta(html)

            rows.append({
                "file_path": rel,
                "url": url,
                "pillar": pillar,
                "kind": kind,
                "article_section": section or "",
                "title": title or "",
                "published": published or "",
                "modified": modified or "",
                "description": desc or "",
            })

    fieldnames = [
        "file_path",
        "url",
        "pillar",
        "kind",
        "article_section",
        "title",
        "published",
        "modified",
        "description",
    ]

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in rows:
            writer.writerow(row)

    print(f"Wrote {len(rows)} records to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
