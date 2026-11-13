import AppError from "../utils/AppError.js";

const FEED_URL = "https://remotive.com/api/remote-jobs?limit=1000";
const CACHE_TTL_MS = 8 * 60 * 60 * 1000;
let cachedListings = null;
let cacheExpiresAt = 0;
let refreshInFlight = null;

function plainText(html = "") {
    return String(html)
        .replace(/<\/(p|div|li|h[1-6])\s*>/gi, " ")
        .replace(/<br\s*\/?\s*>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/\s+/g, " ")
        .trim();
}

function validListing(item) {
    try {
        const url = new URL(item.url);
        return url.protocol === "https:" && url.hostname === "remotive.com";
    } catch { return false; }
}

function normalizeListing(item) {
    return {
        id: String(item.id),
        title: plainText(item.title).slice(0, 180),
        company: plainText(item.company_name).slice(0, 100),
        location: plainText(item.candidate_required_location || "Remote").slice(0, 150),
        category: plainText(item.category).slice(0, 100),
        job_type: plainText(item.job_type).slice(0, 40),
        salary: plainText(item.salary).slice(0, 120),
        published_at: item.publication_date,
        url: item.url,
        summary: plainText(item.description).slice(0, 420),
        source: "Remotive"
    };
}

async function refreshListings(fetcher, now) {
    if (refreshInFlight) return refreshInFlight;
    refreshInFlight = (async () => {
        const response = await fetcher(FEED_URL, { signal: AbortSignal.timeout(12_000), headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error(`Listings provider returned ${response.status}`);
        const payload = await response.json();
        if (!Array.isArray(payload.jobs)) throw new Error("Listings provider returned an invalid response");
        cachedListings = payload.jobs.filter(item => validListing(item) && item.title && item.company_name).map(normalizeListing);
        cacheExpiresAt = now() + CACHE_TTL_MS;
        return cachedListings;
    })().finally(() => { refreshInFlight = null; });
    return refreshInFlight;
}

export async function searchListings(query = "", { fetcher = fetch, now = Date.now } = {}) {
    let listings = cachedListings;
    if (!listings || now() >= cacheExpiresAt) {
        try { listings = await refreshListings(fetcher, now); }
        catch (error) {
            if (cachedListings?.length) listings = cachedListings;
            else throw new AppError("Opportunity search is temporarily unavailable. Please try again shortly.", 502);
        }
    }
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const matches = listings.filter(item => {
        const haystack = `${item.title} ${item.company} ${item.location} ${item.category} ${item.job_type} ${item.summary}`.toLowerCase();
        return terms.every(term => haystack.includes(term));
    });
    return matches.slice(0, 80);
}

export function resetDiscoveryCache() {
    cachedListings = null;
    cacheExpiresAt = 0;
    refreshInFlight = null;
}
