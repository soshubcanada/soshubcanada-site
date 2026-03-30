import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/api-auth";

// ── Cache en mémoire pour éviter de re-scraper à chaque requête ──
let cache: { data: NewsItem[]; fetchedAt: number } | null = null;
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  url: string;
  source: "IRCC" | "Quebec" | "MIFI" | "Federal";
  tag: string;
  tagColor: string;
}

// ── Mots-clés pour filtrer les news Québec (MIFI) ──
const MIFI_KEYWORDS = [
  "immigration", "immigrant", "travailleur", "étranger", "francisation",
  "francophone", "Arrima", "PSTQ", "PEQ", "résidence permanente",
  "permis de travail", "sélection", "regroupement familial", "réfugié",
  "demandeur d'asile", "MIFI", "intégration", "immigration",
];

function matchesMIFI(text: string): boolean {
  const lower = text.toLowerCase();
  return MIFI_KEYWORDS.some(kw => lower.includes(kw.toLowerCase()));
}

// ── Tag couleurs par source ──
function getTagInfo(source: string): { tag: string; tagColor: string } {
  switch (source) {
    case "IRCC": return { tag: "IRCC", tagColor: "bg-red-100 text-red-700" };
    case "Quebec":
    case "MIFI": return { tag: "Québec", tagColor: "bg-blue-100 text-blue-700" };
    default: return { tag: "Fédéral", tagColor: "bg-green-100 text-green-700" };
  }
}

// ── Parser Atom XML (IRCC) ──
function parseAtomFeed(xml: string, source: "IRCC" | "Federal"): NewsItem[] {
  const items: NewsItem[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/gi;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entry = match[1];
    const title = entry.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim() || "";
    const summary = entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1]?.trim() || "";
    const link = entry.match(/<link[^>]*href="([^"]*)"[^>]*\/>/)?.[1] ||
                 entry.match(/<link[^>]*href="([^"]*)"[^>]*>/)?.[1] || "";
    const updated = entry.match(/<updated>([\s\S]*?)<\/updated>/)?.[1]?.trim() || "";
    const id = entry.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim() || link;

    if (title) {
      const tagInfo = getTagInfo(source);
      items.push({
        id: id || `${source}-${items.length}`,
        title: decodeHtmlEntities(title),
        summary: decodeHtmlEntities(summary).replace(/<[^>]*>/g, "").slice(0, 200),
        date: updated ? new Date(updated).toISOString().split("T")[0] : "",
        url: link,
        source,
        ...tagInfo,
      });
    }
  }
  return items;
}

// ── Parser RSS 2.0 (Québec) ──
function parseRSSFeed(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const item = match[1];
    const title = item.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.trim() || "";
    const desc = item.match(/<description[^>]*>([\s\S]*?)<\/description>/)?.[1]?.trim() || "";
    const link = item.match(/<link[^>]*>([\s\S]*?)<\/link>/)?.[1]?.trim() || "";
    const pubDate = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() || "";

    // Filtrer uniquement les nouvelles immigration/MIFI
    const fullText = `${title} ${desc}`;
    if (matchesMIFI(fullText)) {
      const tagInfo = getTagInfo("Quebec");
      items.push({
        id: link || `qc-${items.length}`,
        title: decodeHtmlEntities(title.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")),
        summary: decodeHtmlEntities(desc.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")).replace(/<[^>]*>/g, "").slice(0, 200),
        date: pubDate ? new Date(pubDate).toISOString().split("T")[0] : "",
        url: link,
        source: "MIFI",
        ...tagInfo,
      });
    }
  }
  return items;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

// ── Fetch avec timeout ──
async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "SOS-Hub-CRM-News/1.0" },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ── Fallback statique si les feeds sont inaccessibles ──
const FALLBACK_NEWS: NewsItem[] = [
  {
    id: "fb-1", title: "Consultez les dernières nouvelles IRCC",
    summary: "Les flux RSS IRCC sont temporairement indisponibles. Visitez le site officiel pour les mises à jour.",
    date: new Date().toISOString().split("T")[0], url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/nouvelles.html",
    source: "IRCC", tag: "IRCC", tagColor: "bg-red-100 text-red-700"
  },
  {
    id: "fb-2", title: "Nouvelles du MIFI — Québec",
    summary: "Consultez le fil de presse du gouvernement du Québec pour les annonces en immigration.",
    date: new Date().toISOString().split("T")[0], url: "https://www.quebec.ca/immigration",
    source: "MIFI", tag: "Québec", tagColor: "bg-blue-100 text-blue-700"
  },
];

export async function GET(req: NextRequest) {
  // Rate limit: 10 requests/min (external scraping)
  const rl = checkRateLimit(req, 10, 60000, 'news');
  if (!rl.allowed) return rl.error!;

  // Retourner le cache s'il est encore valide
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return NextResponse.json({ news: cache.data, cached: true, fetchedAt: new Date(cache.fetchedAt).toISOString() });
  }

  const allNews: NewsItem[] = [];

  // Fetch en parallèle : IRCC FR + Québec RSS
  const [irccXml, qcXml] = await Promise.all([
    fetchWithTimeout(
      "https://api.io.canada.ca/io-server/gc/news/fr/v2?dept=departmentofcitizenshipandimmigration&sort=publishedDate&orderBy=desc&publishedDate%3E=2024-01-01&pick=20&format=atom&atomtitle=IRCC"
    ),
    fetchWithTimeout("https://www.quebec.ca/fil-de-presse.rss"),
  ]);

  if (irccXml) {
    allNews.push(...parseAtomFeed(irccXml, "IRCC"));
  }

  if (qcXml) {
    allNews.push(...parseRSSFeed(qcXml));
  }

  // Trier par date décroissante
  allNews.sort((a, b) => b.date.localeCompare(a.date));

  // Limiter à 12 items
  const result = allNews.length > 0 ? allNews.slice(0, 12) : FALLBACK_NEWS;

  // Mettre en cache
  cache = { data: result, fetchedAt: Date.now() };

  return NextResponse.json({
    news: result,
    cached: false,
    fetchedAt: new Date().toISOString(),
    sources: {
      ircc: !!irccXml,
      quebec: !!qcXml,
      totalRaw: allNews.length,
    },
  });
}
