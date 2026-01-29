import fs from 'fs';
import path from 'path';

function mustReplace(haystack, from, to, label) {
  const before = haystack;
  const after = before.split(from).join(to);
  if (before === after) {
    throw new Error(`Replace failed (${label}): did not find exact string`);
  }
  return after;
}

function replaceRegex(h, re, to, label) {
  const before = h;
  const after = h.replace(re, to);
  // Allow idempotency: if already updated, don't fail.
  if (before === after) return before;
  return after;
}

function htmlEscape(s) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function urlEncodeComponent(s) {
  return encodeURIComponent(s);
}

function updateArticle({
  file,
  canonicalPath,
  title,
  description,
  h1,
  twitterText,
  publishedIso,
  contentHtml,
}) {
  let html = fs.readFileSync(file, 'utf8');

  // Head basics
  html = replaceRegex(html, /<title>[\s\S]*?<\/title>/, `<title>${htmlEscape(title)} | AccountingTitan</title>`, 'title tag');
  html = replaceRegex(html, /<meta name="description" content="[\s\S]*?">/, `<meta name="description" content="${htmlEscape(description)}">`, 'meta description');

  html = replaceRegex(html, /<link rel="canonical" href="https:\/\/accountingtitan\.com[^"]*">/, `<link rel="canonical" href="https://accountingtitan.com${canonicalPath}">`, 'canonical');

  html = replaceRegex(html, /<meta property="og:title" content="[\s\S]*?">/, `<meta property="og:title" content="${htmlEscape(title)} | AccountingTitan">`, 'og:title');
  html = replaceRegex(html, /<meta property="og:description" content="[\s\S]*?">/, `<meta property="og:description" content="${htmlEscape(description)}">`, 'og:description');
  html = replaceRegex(html, /<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonicalPath}">`, 'og:url');

  html = replaceRegex(html, /<meta name="twitter:title" content="[\s\S]*?">/, `<meta name="twitter:title" content="${htmlEscape(title)} | AccountingTitan">`, 'twitter:title');
  html = replaceRegex(html, /<meta name="twitter:description" content="[\s\S]*?">/, `<meta name="twitter:description" content="${htmlEscape(description)}">`, 'twitter:description');

  // Published/modified times (RankMath meta)
  html = replaceRegex(html, /<meta property="og:updated_time" content="[^"]*">/, `<meta property="og:updated_time" content="${publishedIso}">`, 'og:updated_time');
  html = replaceRegex(html, /<meta property="article:published_time" content="[^"]*">/, `<meta property="article:published_time" content="${publishedIso}">`, 'article:published_time');
  html = replaceRegex(html, /<meta property="article:modified_time" content="[^"]*">/, `<meta property="article:modified_time" content="${publishedIso}">`, 'article:modified_time');

  // Schema: do minimal string swaps based on old export pattern.
  // Replace all occurrences of the old page path with the new one.
  html = replaceRegex(html, /\/mergers-acquisitions\/tax-due-diligence\//g, canonicalPath, 'schema/url swaps');
  // Replace the old title occurrences.
  html = html.replaceAll('What is Tax Due Diligence? | AccountingTitan', `${title} | AccountingTitan`);

  // Replace old description occurrences (there are several, truncated).
  // Be conservative: only update schema/article description by regex.
  html = replaceRegex(
    html,
    /"description":"[\s\S]*?",/,
    `"description":"${htmlEscape(description)}",`,
    'schema description'
  );
  // Schema headline/name can vary across exports; best-effort only.
  try {
    html = replaceRegex(
      html,
      /"headline":"[^\"]*"/,
      `"headline":"${htmlEscape(title)} | AccountingTitan"`,
      'schema headline'
    );
  } catch {}

  try {
    const idx = html.indexOf('"@type":"Article"');
    if (idx !== -1) {
      const head = html.slice(0, idx);
      let tail = html.slice(idx);
      tail = tail.replace(/"name":"[^\"]*"/, `"name":"${htmlEscape(title)} | AccountingTitan"`);
      html = head + tail;
    }
  } catch {}
  html = replaceRegex(
    html,
    /"datePublished":"[^"]*"/,
    `"datePublished":"${publishedIso}"`,
    'schema datePublished'
  );
  html = replaceRegex(
    html,
    /"dateModified":"[^"]*"/,
    `"dateModified":"${publishedIso}"`,
    'schema dateModified'
  );

  // H1
  html = replaceRegex(
    html,
    /<h1 class="post-title">[\s\S]*?<\/h1>/,
    `<h1 class="post-title">\n\t\t\t${htmlEscape(h1)}\t\t\t\n\t\t<\/h1>`,
    'H1'
  );

  // Body content
  html = replaceRegex(
    html,
    /<div class="post-content description cf entry-content content-normal">[\s\S]*?<\/div><!--\s*\.post-content\s*-->/,
    `<div class="post-content description cf entry-content content-normal">\n\n${contentHtml}\n\t\t\t\t\t\t\n\t\t<\/div><!-- .post-content -->`,
    'post-content section'
  );

  // Share URLs + tweet text
  const encodedPath = urlEncodeComponent(canonicalPath);
  html = html.replaceAll('%2Fmergers-acquisitions%2Ftax-due-diligence%2F', encodedPath);
  html = html.replaceAll('What%20is%20Tax%20Due%20Diligence%3F', encodeURIComponent(twitterText));

  fs.writeFileSync(file, html);
}

const publishedIso = '2026-01-29T08:00:00-05:00';

const earnoutsContent = `
<p><strong>Earn-outs</strong> are a common way to bridge a valuation gap in M&amp;A: the buyer pays part of the purchase price today, and the rest later if the business hits agreed performance targets.</p>

<div class="key-takeaways">
<h2 class="wp-block-heading">Key takeaways</h2>
<ul class="wp-block-list">
<li>An earn-out is pricing + risk allocation. Treat it like a mini contract-within-a-contract: define metrics, measurement rules, and control rights.</li>
<li>Most disputes come from vague definitions (EBITDA adjustments, revenue recognition, working capital, intercompany charges) and unclear post-close operating covenants.</li>
<li>Accounting: earn-outs are usually <em>contingent consideration</em> measured at fair value on Day 1 with subsequent remeasurement (often through earnings) depending on the framework and classification.</li>
<li>Tax: treatment depends on facts and jurisdiction. Structure and drafting can materially change outcomes (capital vs income, withholding, allocation). Always coordinate tax early.</li>
</ul>
</div>

<h2 class="wp-block-heading">What is an earn-out?</h2>
<p>An earn-out is a contractual mechanism where the seller receives additional consideration after closing if the target achieves specified milestones over an earn-out period (often 12–36 months). Milestones are typically based on revenue, EBITDA, gross profit, customer retention, or product/operational milestones.</p>

<h2 class="wp-block-heading">Why buyers and sellers use earn-outs</h2>
<ul class="wp-block-list">
<li><strong>Valuation gap:</strong> Seller believes growth will continue; buyer wants proof.</li>
<li><strong>Information risk:</strong> Short history, customer concentration, churn, or product roadmap uncertainty.</li>
<li><strong>Retention + transition:</strong> Keeps key sellers/operators incentivized post-close.</li>
<li><strong>Downside protection:</strong> Buyer avoids overpaying if performance under-delivers.</li>
</ul>

<h2 class="wp-block-heading">Common earn-out structures</h2>
<ul class="wp-block-list">
<li><strong>Single metric (simple):</strong> e.g., revenue &ge; $X over 12 months.</li>
<li><strong>Tiered / sliding scale:</strong> payouts at multiple thresholds.</li>
<li><strong>Multiple-year earn-out:</strong> yearly tranches or cumulative measurement.</li>
<li><strong>Milestone-based:</strong> product launch, regulatory approval, signed customers.</li>
<li><strong>Cap + floor:</strong> limits payout volatility.</li>
</ul>

<h2 class="wp-block-heading">Drafting checklist: how to avoid disputes</h2>
<p>If you only do one thing: write the metric like an accountant would. Assume an adversarial reader.</p>

<h3 class="wp-block-heading">1) Define the metric precisely</h3>
<ul class="wp-block-list">
<li><strong>Revenue:</strong> recognize on invoice? cash? GAAP/IFRS? net of refunds? treatment of multi-element arrangements?</li>
<li><strong>EBITDA:</strong> list add-backs and exclusions; specify accounting policies; define “one-time” and “non-recurring”.</li>
<li><strong>Gross profit:</strong> define COGS and allocations (hosting, support, shared services).</li>
</ul>

<h3 class="wp-block-heading">2) Specify measurement rules</h3>
<ul class="wp-block-list">
<li>Measurement period, cut-off dates, and how partial months are handled.</li>
<li>Whether the buyer can change accounting policies post-close (and if so, how that affects the metric).</li>
<li>How acquisitions, divestitures, and new business lines are treated.</li>
</ul>

<h3 class="wp-block-heading">3) Control and operating covenants</h3>
<ul class="wp-block-list">
<li>Is the buyer required to operate the business “consistent with past practice”?</li>
<li>What decisions need seller consent (pricing changes, cost allocations, layoffs, major customer terms)?</li>
<li>What happens if the buyer integrates the target (shared services, cross-selling, bundling)?</li>
</ul>

<h3 class="wp-block-heading">4) Reporting, audit, and dispute resolution</h3>
<ul class="wp-block-list">
<li>Timeline for buyer calculation and seller review.</li>
<li>Seller access to supporting schedules, GL detail, and customer-level reports.</li>
<li>Independent accountant/arbitrator mechanism and scope (technical accounting vs legal interpretation).</li>
</ul>

<h2 class="wp-block-heading">Accounting overview: contingent consideration</h2>
<p>In purchase accounting, earn-outs are commonly treated as <strong>contingent consideration</strong> and recorded at <strong>fair value</strong> at the acquisition date. Subsequent changes in fair value are often recognized in earnings (subject to the applicable standard and whether the earn-out is classified as a liability or equity).</p>

<p>Practical implication: even if the earn-out is “future pricing,” it can create volatility in post-close earnings through fair value remeasurement. This is a reason finance teams care about earn-out design, not just lawyers.</p>

<h2 class="wp-block-heading">Tax considerations (high-level)</h2>
<p>Earn-outs can be treated differently for tax depending on the structure and jurisdiction: part of purchase price, compensation for services, interest-like amounts, or something else. Key practical issues include:</p>
<ul class="wp-block-list">
<li><strong>Character:</strong> capital vs income (and whether payments look like employment/bonus).</li>
<li><strong>Withholding:</strong> cross-border payments can trigger withholding requirements.</li>
<li><strong>Allocation:</strong> earn-out may need to be allocated among asset classes in an asset deal.</li>
<li><strong>Timing:</strong> recognition timing can differ between buyer and seller.</li>
</ul>

<h2 class="wp-block-heading">A simple example</h2>
<p>Assume a buyer pays $10M at closing plus a $5M earn-out if 12-month revenue &ge; $15M. If revenue ends at $16M, the seller receives $5M (subject to the agreement’s calculation and any caps/floors). The buyer’s finance team will also track (and often remeasure) the fair value of the expected earn-out over the period.</p>

<h2 class="wp-block-heading">Related reading</h2>
<ul class="wp-block-list">
<li><a href="/mergers-acquisitions/pre-closing-transactions/">Pre-closing transactions (what they are + common examples)</a></li>
<li><a href="/mergers-acquisitions/indemnity-clauses/">Indemnity clauses in M&amp;A (risk allocation basics)</a></li>
<li><a href="/mergers-acquisitions/tax-due-diligence/">Tax due diligence (what to look for)</a></li>
<li><a href="/finance/">Corporate finance</a> and <a href="/taxation/">taxation</a> (related categories)</li>
</ul>
`;

const wcContent = `
<p>A <strong>working capital peg</strong> is a negotiated “target” level of net working capital that the business is expected to deliver at closing. If actual closing working capital is above or below the peg, the purchase price is adjusted up or down.</p>

<div class="key-takeaways">
<h2 class="wp-block-heading">Key takeaways</h2>
<ul class="wp-block-list">
<li>Working capital adjustments are about delivering a “normal” level of cash tied up in operations—so the buyer doesn’t fund a working capital shortfall on Day 1.</li>
<li>Most fights are definition fights: which accounts are included, what accounting policies apply, and how estimates/accruals are treated.</li>
<li>Decide early: <strong>locked-box</strong> vs <strong>closing accounts</strong>. The peg/adjustment mechanics are very different.</li>
</ul>
</div>

<h2 class="wp-block-heading">Step 1: Define net working capital (NWC)</h2>
<p>At a basic level:</p>
<ul class="wp-block-list">
<li><strong>NWC = Current assets (operating) − Current liabilities (operating)</strong></li>
<li>Typically <em>exclude</em> cash, debt, and debt-like items (depending on the deal’s “cash-free, debt-free” concept).</li>
</ul>

<p>Common included accounts: A/R, inventory, prepaid expenses, A/P, accrued liabilities, deferred revenue (sometimes), operating tax balances (sometimes).</p>

<h2 class="wp-block-heading">Step 2: Set the peg (the target)</h2>
<p>The peg is usually based on a historical average (e.g., trailing 12 months) adjusted for seasonality, growth, and known changes. The goal is to match what the business needs to operate “normally” post-close.</p>

<h2 class="wp-block-heading">Step 3: Prepare the closing statement (closing accounts)</h2>
<p>On (or shortly after) closing, one side prepares a closing balance sheet that calculates actual NWC using the agreement’s definitions. The other side reviews and can dispute.</p>

<h3 class="wp-block-heading">Critical drafting points</h3>
<ul class="wp-block-list">
<li><strong>Accounting basis:</strong> GAAP/IFRS? consistent with past practice? specific policies override?</li>
<li><strong>Estimates:</strong> inventory obsolescence, bonus accruals, warranty reserves, bad debt reserves.</li>
<li><strong>Cut-off:</strong> what is included as of 11:59pm on closing date? treatment of in-transit inventory/shipping terms.</li>
<li><strong>Deferred revenue:</strong> is it debt-like, working capital, or excluded? (Huge driver in SaaS.)</li>
<li><strong>Transaction expenses:</strong> excluded vs accrued (and whether they’re debt-like).</li>
</ul>

<h2 class="wp-block-heading">Step 4: Calculate the purchase price adjustment</h2>
<p>Typical formula:</p>
<ul class="wp-block-list">
<li>If <strong>Actual NWC &gt; Peg</strong> → buyer pays extra (increase purchase price).</li>
<li>If <strong>Actual NWC &lt; Peg</strong> → buyer pays less / seller refunds (decrease purchase price).</li>
</ul>

<h2 class="wp-block-heading">Worked example (simple)</h2>
<p>Assume the deal is cash-free, debt-free with a working capital peg of <strong>$2.0M</strong>.</p>
<ul class="wp-block-list">
<li>Actual closing NWC = $1.6M</li>
<li>Shortfall vs peg = $0.4M</li>
<li><strong>Purchase price decreases by $0.4M</strong> (subject to the agreement’s mechanics)</li>
</ul>

<h2 class="wp-block-heading">Locked-box vs closing accounts (why it matters)</h2>
<ul class="wp-block-list">
<li><strong>Locked-box:</strong> price is set using a historical balance sheet date; buyer gets economic benefit from that date; leakage protections matter.</li>
<li><strong>Closing accounts:</strong> price is adjusted after closing based on actual closing balance sheet; the peg and definitions are central.</li>
</ul>

<h2 class="wp-block-heading">Dispute patterns (what usually goes wrong)</h2>
<ul class="wp-block-list">
<li>Revenue cut-off / unbilled revenue / returns reserves.</li>
<li>Inventory valuation and write-downs.</li>
<li>Accrued payroll/bonuses and vacation liabilities.</li>
<li>Classification (operating vs debt-like).</li>
<li>Changes in accounting policies post-close.</li>
</ul>

<h2 class="wp-block-heading">Related reading</h2>
<ul class="wp-block-list">
<li><a href="/mergers-acquisitions/pre-closing-transactions/">Pre-closing transactions</a></li>
<li><a href="/mergers-acquisitions/indemnity-clauses/">Indemnity clauses in M&amp;A</a></li>
<li><a href="/mergers-acquisitions/tax-due-diligence/">Tax due diligence</a></li>
</ul>
`;

updateArticle({
  file: path.resolve('site/mergers-acquisitions/earn-outs-in-ma/index.html'),
  canonicalPath: '/mergers-acquisitions/earn-outs-in-ma/',
  title: 'Earn-outs in M&A: Structuring, Accounting, and Tax',
  description: 'An earn-out is contingent consideration paid after closing if performance targets are met. Learn common structures, drafting pitfalls, accounting treatment, and tax issues.',
  h1: 'Earn-outs in M&A: Structuring, Accounting, and Tax',
  twitterText: 'Earn-outs in M&A',
  publishedIso,
  contentHtml: earnoutsContent,
});

updateArticle({
  file: path.resolve('site/mergers-acquisitions/working-capital-peg-and-closing-adjustments/index.html'),
  canonicalPath: '/mergers-acquisitions/working-capital-peg-and-closing-adjustments/',
  title: 'Working Capital Peg and Closing Adjustments (Step-by-Step)',
  description: 'A step-by-step guide to working capital pegs and purchase price adjustments: definitions, calculation mechanics, example, and common dispute points.',
  h1: 'Working Capital Peg and Closing Adjustments (Step-by-Step)',
  twitterText: 'Working capital peg and closing adjustments',
  publishedIso,
  contentHtml: wcContent,
});

console.log('Updated:', 'earn-outs-in-ma', 'working-capital-peg-and-closing-adjustments');
