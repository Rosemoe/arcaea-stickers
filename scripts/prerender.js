/**
 * Prerenders build/index.html into a fully hydrated static HTML snapshot.
 *
 * Strategy:
 *   1. Serve `build/` over a localhost HTTP server.
 *   2. Boot the React app in headless Chromium via puppeteer.
 *   3. Wait until the React tree has mounted and the canvas has rendered.
 *   4. Capture the rendered DOM and rewrite the prerender marker so the
 *      browser will hydrate (instead of re-rendering) on the next load.
 *   5. Persist the snapshot back to build/index.html.
 *
 * This keeps the SPA fully client-rendered at dev time while giving
 * crawlers (Googlebot, Bingbot, Baiduspider, etc.) a complete first
 * paint without needing to run JavaScript.
 */
const fs = require("fs");
const http = require("http");
const path = require("path");
const handler = require("serve-handler");
const puppeteer = require("puppeteer");

const PROJECT_ROOT = path.resolve(__dirname, "..");
const BUILD_DIR = path.join(PROJECT_ROOT, "build");
const TARGET_HTML = path.join(BUILD_DIR, "index.html");
const HOST = "127.0.0.1";
const PORT = Number(process.env.PRERENDER_PORT) || 0;
const READY_TIMEOUT_MS = Number(process.env.PRERENDER_TIMEOUT) || 30000;

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) =>
      handler(req, res, {
        public: BUILD_DIR,
        cleanUrls: false,
        rewrites: [{ source: "**", destination: "/index.html" }],
      })
    );
    server.once("error", reject);
    server.listen(PORT, HOST, () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : PORT;
      resolve({ server, port });
    });
  });
}

function stopServer(server) {
  return new Promise((resolve) => server.close(() => resolve()));
}

async function renderTo(html, port) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--lang=en-US,en",
    ],
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1 });
    await page.setUserAgent(
      "Mozilla/5.0 (Arcaea-Stickers-Prerender) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
    );
    await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    // The SPA reads navigator.language to decide its initial UI locale. Force it
    // to en-US so the prerendered snapshot is a neutral English baseline; the
    // client takes over after hydration and switches to the user's real locale.
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "language", { get: () => "en-US" });
      Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
    });

    const url = `http://${HOST}:${port}/`;
    await page.goto(url, { waitUntil: "networkidle0", timeout: READY_TIMEOUT_MS });

    await page.waitForFunction(
      () => {
        const root = document.getElementById("root");
        if (!root) return false;
        if (!root.querySelector(".App")) return false;
        const canvas = root.querySelector("canvas");
        if (!canvas) return false;
        return canvas.width > 0 && canvas.height > 0;
      },
      { timeout: READY_TIMEOUT_MS }
    );

    await page.evaluate(() => {
      if (document.fonts && document.fonts.ready) {
        return document.fonts.ready;
      }
      return null;
    });

    await page.evaluate(() => {
      const root = document.getElementById("root");
      if (root) root.setAttribute("data-prerendered", "true");
      // Reset <html lang> to the neutral default so the prerendered snapshot
      // does not lock the page into a single locale before hydration runs.
      document.documentElement.setAttribute("lang", "en");
    });

    const rendered = await page.content();
    return rendered;
  } finally {
    await browser.close();
  }
}

function injectPrerenderFlag(html) {
  const FLAG_RE = /window\.__PRERENDERED__\s*=\s*false\s*;?/;
  if (FLAG_RE.test(html)) {
    return html.replace(FLAG_RE, "window.__PRERENDERED__=true;");
  }
  return html.replace(
    /<head([^>]*)>/i,
    (match) => `${match}\n    <script>window.__PRERENDERED__=true;</script>`
  );
}

async function main() {
  if (!fs.existsSync(TARGET_HTML)) {
    console.error(`[prerender] missing ${TARGET_HTML}. Run \`bun run build\` first.`);
    process.exit(1);
  }

  const { server, port } = await startStaticServer();
  console.log(`[prerender] serving ${path.relative(PROJECT_ROOT, BUILD_DIR)} on http://${HOST}:${port}`);

  try {
    const rendered = await renderTo(TARGET_HTML, port);
    const finalHtml = injectPrerenderFlag(rendered);
    fs.writeFileSync(TARGET_HTML, finalHtml, "utf8");
    const bytes = Buffer.byteLength(finalHtml, "utf8");
    console.log(`[prerender] wrote ${path.relative(PROJECT_ROOT, TARGET_HTML)} (${bytes} bytes)`);
  } catch (err) {
    console.error(`[prerender] failed:`, err);
    process.exitCode = 1;
  } finally {
    await stopServer(server);
  }
}

main().catch((err) => {
  console.error("[prerender] unexpected error:", err);
  process.exit(1);
});
