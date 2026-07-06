import { NextRequest, NextResponse } from "next/server";

// Given a product page URL (Amazon, Flipkart, Myntra, anywhere), fetch the
// page server-side and extract a name, image and price so the user doesn't
// have to type them. Best-effort: sites sometimes block server fetches, in
// which case the client falls back to manual fields.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

function isSafeUrl(u: URL): boolean {
  if (u.protocol !== "https:" && u.protocol !== "http:") return false;
  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return false;
  // block IP literals entirely (private-range and otherwise) - product pages
  // live on domain names.
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(":")) return false;
  return true;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function match(html: string, re: RegExp): string | undefined {
  const m = html.match(re);
  return m?.[1] ? decodeEntities(m[1]) : undefined;
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL((body.url || "").trim());
  } catch {
    return NextResponse.json({ error: "Not a valid link" }, { status: 400 });
  }
  if (!isSafeUrl(url)) {
    return NextResponse.json({ error: "Not a valid link" }, { status: 400 });
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-IN,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(9000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    // read at most ~600KB - enough for <head> and Amazon's above-fold markup
    const reader = res.body?.getReader();
    let html = "";
    if (reader) {
      const decoder = new TextDecoder();
      while (html.length < 600_000) {
        const { done, value } = await reader.read();
        if (done) break;
        html += decoder.decode(value, { stream: true });
      }
      reader.cancel().catch(() => {});
    } else {
      html = await res.text();
    }

    const isAmazon = /(^|\.)amazon\./i.test(new URL(res.url || url.toString()).hostname);

    let name: string | undefined;
    let imageUrl: string | undefined;
    let price: string | undefined;

    if (isAmazon) {
      name = match(html, /id="productTitle"[^>]*>\s*([^<]+?)\s*</);
      imageUrl =
        match(html, /id="landingImage"[^>]*data-old-hires="([^"]+)"/) ||
        match(html, /"hiRes":"(https:[^"]+)"/) ||
        match(html, /id="landingImage"[^>]*\ssrc="([^"]+)"/);
      const rawPrice = match(html, /class="a-price[^"]*"[^>]*>.*?class="a-offscreen"[^>]*>\s*([^<]+)</);
      if (rawPrice) price = rawPrice.replace(/\.00$/, "");
    }

    // generic OpenGraph / meta fallbacks (Flipkart, Myntra, most shops)
    name =
      name ||
      match(html, /property="og:title"\s+content="([^"]+)"/) ||
      match(html, /content="([^"]+)"\s+property="og:title"/) ||
      match(html, /<title[^>]*>([^<]+)<\/title>/);
    imageUrl =
      imageUrl ||
      match(html, /property="og:image"\s+content="([^"]+)"/) ||
      match(html, /content="([^"]+)"\s+property="og:image"/) ||
      match(html, /name="twitter:image"\s+content="([^"]+)"/);

    if (name) name = name.replace(/\s+/g, " ").slice(0, 120);
    if (imageUrl && !/^https?:\/\//.test(imageUrl)) imageUrl = undefined;

    if (!name && !imageUrl) {
      return NextResponse.json(
        { error: "Couldn't read that page - fill the details manually." },
        { status: 422 }
      );
    }
    return NextResponse.json({ name, imageUrl, price });
  } catch {
    return NextResponse.json(
      { error: "Couldn't read that page - fill the details manually." },
      { status: 422 }
    );
  }
}
