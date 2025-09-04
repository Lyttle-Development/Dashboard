import { NextRequest, NextResponse } from 'next/server';
import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  
  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

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
        url: window.location.href || null,
      };
    });

    await browser.close();
    return NextResponse.json(previewData, { status: 200 });
  } catch (error) {
    await browser.close();
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 });
  }
}