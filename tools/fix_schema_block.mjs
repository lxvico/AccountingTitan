import fs from 'fs';

function replaceBetween(html, startMarker, endMarker, replacement) {
  const start = html.indexOf(startMarker);
  if (start === -1) throw new Error('startMarker not found');
  const end = html.indexOf(endMarker, start + startMarker.length);
  if (end === -1) throw new Error('endMarker not found');
  return html.slice(0, start + startMarker.length) + replacement + html.slice(end);
}

const file = process.argv[2];
if (!file) throw new Error('usage: node fix_schema_block.mjs <file>');

const canonicalPath = '/mergers-acquisitions/earn-outs-in-ma/';
const title = 'Earn-outs in M&A: Structuring, Accounting, and Tax | AccountingTitan';
const desc = 'An earn-out is contingent consideration paid after closing if performance targets are met. Learn common structures, drafting pitfalls, accounting treatment, and tax issues.';
const published = '2026-01-29T08:00:00-05:00';

const schemaObj = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "/#organization",
      "name": "AccountingTitan",
      "url": "",
      "logo": {
        "@type": "ImageObject",
        "@id": "/#logo",
        "url": "/wp-content/uploads/2022/05/Logo-Normal.png",
        "contentUrl": "/wp-content/uploads/2022/05/Logo-Normal.png",
        "caption": "AccountingTitan",
        "inLanguage": "en-US",
        "width": "327",
        "height": "40"
      }
    },
    {
      "@type": "WebSite",
      "@id": "/#website",
      "url": "",
      "name": "AccountingTitan",
      "publisher": { "@id": "/#organization" },
      "inLanguage": "en-US"
    },
    {
      "@type": "WebPage",
      "@id": `${canonicalPath}#webpage`,
      "url": canonicalPath,
      "name": title,
      "datePublished": published,
      "dateModified": published,
      "isPartOf": { "@id": "/#website" },
      "inLanguage": "en-US"
    },
    {
      "@type": "Person",
      "@id": "/author/amy-richards/",
      "name": "Amy Richards",
      "url": "/author/amy-richards/",
      "image": {
        "@type": "ImageObject",
        "@id": "/wp-content/uploads/2022/05/amy-richards_avatar-96x96.jpg",
        "url": "/wp-content/uploads/2022/05/amy-richards_avatar-96x96.jpg",
        "caption": "Amy Richards",
        "inLanguage": "en-US"
      },
      "worksFor": { "@id": "/#organization" }
    },
    {
      "@type": "Article",
      "headline": title,
      "datePublished": published,
      "dateModified": published,
      "articleSection": "M&A",
      "author": { "@id": "/author/amy-richards/", "name": "Amy Richards" },
      "publisher": { "@id": "/#organization" },
      "description": desc,
      "name": title,
      "@id": `${canonicalPath}#richSnippet`,
      "isPartOf": { "@id": `${canonicalPath}#webpage` },
      "inLanguage": "en-US",
      "mainEntityOfPage": { "@id": `${canonicalPath}#webpage` }
    }
  ]
};

let html = fs.readFileSync(file, 'utf8');
const startMarker = '<script type="application/ld+json" class="rank-math-schema">';
const endMarker = '</script>';

const start = html.indexOf(startMarker);
if (start === -1) throw new Error('schema start tag not found');
const end = html.indexOf(endMarker, start + startMarker.length);
if (end === -1) throw new Error('schema end tag not found');

const before = html.slice(0, start + startMarker.length);
const after = html.slice(end);
const replacement = JSON.stringify(schemaObj);
html = before + replacement + after;

fs.writeFileSync(file, html);
console.log('fixed schema:', file);
