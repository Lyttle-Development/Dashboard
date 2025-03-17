import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const browser = await playwrightChromium.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
  });

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const previewData = await page.evaluate(() => {
      const getMeta = (name: string) => {
        const metaTag = document.querySelector(
          `meta[property='${name}'], meta[name='${name}']`,
        ) as HTMLMetaElement;
        return metaTag ? metaTag.content : null;
      };

      return {
        title: getMeta("og:title") || document.title || null,
        description: getMeta("og:description") || null,
        image: getMeta("og:image") || getMeta("twitter:image") || null,
        url: window.location.href || url || null,
      };
    });

    await browser.close();
    res.status(200).json(previewData);
  } catch (error) {
    await browser.close();
    res.status(500).json({ error: "Failed to fetch metadata" });
  }
}
