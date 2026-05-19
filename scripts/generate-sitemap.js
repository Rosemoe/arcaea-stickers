/**
 * Generates build/sitemap.xml at build time.
 *
 * The sitemap declares the homepage in every supported UI locale via
 * `xhtml:link rel="alternate" hreflang="..."` so international search engines
 * can serve the right language variant to their users.
 *
 * `lastmod` uses the date of the most recent git commit so that the value only
 * changes when the site actually changes. Falls back to the current date if
 * git metadata is unavailable (e.g. in some CI setups).
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SITE_URL = "https://arcst.yurisaki.top/";
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "build");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "sitemap.xml");

const LOCALES = ["en", "zh-CN", "zh-TW", "ja-JP", "ko-KR"];

function resolveLastmod() {
  try {
    const date = execSync("git log -1 --format=%cs", {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
  } catch (_) {
    /* fall through */
  }
  return new Date().toISOString().slice(0, 10);
}

const lastmod = resolveLastmod();

const alternateLinks = [
  `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}" />`,
  ...LOCALES.map(
    (locale) => `    <xhtml:link rel="alternate" hreflang="${locale}" href="${SITE_URL}" />`
  ),
].join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>${SITE_URL}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
${alternateLinks}
  </url>
</urlset>
`;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_FILE, xml, "utf8");

console.log(
  `[sitemap] wrote ${path.relative(PROJECT_ROOT, OUTPUT_FILE)} (lastmod=${lastmod}, locales=${LOCALES.length})`
);
