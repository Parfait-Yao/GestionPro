const { chromium } = require("playwright");
const path = require("path");

const SCREENSHOT_DIR = __dirname;
const T = 10000;

const killer = setTimeout(() => {
  console.log("WATCHDOG: forcing exit after 60s");
  process.exit(1);
}, 60000);
killer.unref?.();

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1400, height: 1000 }, acceptDownloads: true });
  const page = await context.newPage();
  page.setDefaultTimeout(T);

  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });

  const popups = [];
  context.on("page", (p) => popups.push(p));
  const downloads = [];
  context.on("download", (d) => downloads.push(d.url()));

  try {
    await page.goto("http://localhost:3000/login", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=StockApp CI", { timeout: T });
    await page.waitForTimeout(1500); // let first-compile + hydration settle before typing
    await page.fill('input[type="text"]', process.env.TEST_GERANT_NOM);
    const pinBoxes = page.locator('input[inputmode="numeric"]');
    const code = process.env.TEST_GERANT_CODE;
    for (let i = 0; i < code.length; i++) {
      await pinBoxes.nth(i).click();
      await page.keyboard.type(code[i]);
    }
    await page.click('button:has-text("Se connecter")');
    await page.waitForURL(/dashboard/, { timeout: T });
    console.log("OK: logged in, url=", page.url());

    // --- Parametres: make sure numero WhatsApp is saved ---
    await page.goto("http://localhost:3000/parametres", { waitUntil: "domcontentloaded" });
    await page.waitForSelector('text=Notifications WhatsApp', { timeout: T });
    const numeroInput = page.locator('input[placeholder="+225 07 00 00 00 00"]');
    const current = await numeroInput.inputValue();
    console.log("DEBUG numero actuel dans Parametres:", JSON.stringify(current));
    if (!current) {
      await numeroInput.fill("+2250700000000");
      await page.click('button:has-text("Enregistrer les paramètres")');
      await page.waitForSelector("text=Paramètres enregistrés", { timeout: T });
      console.log("OK: numero WhatsApp enregistre");
    } else {
      console.log("OK: numero WhatsApp deja renseigne");
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "parametres.png"), fullPage: true });

    // --- Rapports: click envoyer sur whatsapp ---
    await page.goto("http://localhost:3000/rapports", { waitUntil: "domcontentloaded" });
    await page.waitForSelector('text=Envoyer sur WhatsApp', { timeout: T });
    await page.waitForTimeout(500); // let the /api/parametres/config fetch resolve into state
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "rapports-before.png"), fullPage: true });

    await page.click('button:has-text("Envoyer sur WhatsApp")');
    await page.waitForTimeout(1000);
    for (const p of popups) {
      await p.waitForLoadState("domcontentloaded", { timeout: 5000 }).catch(() => {});
    }
    await page.waitForTimeout(1000);

    console.log("Popup count:", popups.length);
    console.log("Popups opened:", popups.map((p) => p.url()));
    console.log("Downloads triggered:", downloads);

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "rapports-after.png"), fullPage: true });

    const waPopup = popups.find((p) => p.url().startsWith("https://wa.me/"));
    if (waPopup) {
      console.log("OK: wa.me popup url =", waPopup.url());
      await waPopup.screenshot({ path: path.join(SCREENSHOT_DIR, "wa-popup.png") }).catch((e) => console.log("popup screenshot failed:", e.message));
    } else {
      console.log("FAIL: no wa.me popup found among", popups.map((p) => p.url()));
    }

    const bodyText = await page.locator("body").innerText();
    console.log("Contains 'WHATSAPP_TOKEN' error text:", bodyText.includes("WHATSAPP_TOKEN"));
    console.log("Status message on page includes 'WhatsApp ouvert':", bodyText.includes("WhatsApp ouvert"));

    console.log("ERRORS:", JSON.stringify(errors));
  } catch (e) {
    console.log("SCRIPT ERROR:", e.message);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "ERROR.png"), fullPage: true }).catch(() => {});
  } finally {
    await browser.close();
    clearTimeout(killer);
  }
})();
