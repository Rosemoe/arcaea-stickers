/**
 * Generates build/sitemap.xml at build time.
 *
 * `lastmod` uses the date of the most recent git commit so that the
 * value only changes when the site actually changes. Falls back to the
 * current date if git metadata is unavailable (e.g. in some CI setups).
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SITE_URL = "https://arcst.yurisaki.top/";
const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "build");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "sitemap.xml");

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

const urls = [
  { loc: SITE_URL, changefreq: "weekly", priority: "1.0" },
];

const body = urls
  .map(
    (u) =>
      `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.writeFileSync(OUTPUT_FILE, xml, "utf8");

console.log(`[sitemap] wrote ${path.relative(PROJECT_ROOT, OUTPUT_FILE)} (lastmod=${lastmod})`);
