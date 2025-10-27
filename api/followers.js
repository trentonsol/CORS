// api/twitter-followers.js
// Works on Vercel — no Twitter API, no CORS.
// Scrapes from multiple Nitter mirrors for resilience.

const NITTER_INSTANCES = [
  'https://nitter.net',
  'https://nitter.poast.org',
  'https://nitter.privacydev.net',
  'https://nitter.1d4.us',
  'https://nitter.salastil.com',
];

export default async function handler(req, res) {
  const username = 'trentonsolana';

  // Simple cache header: keep CDN copy for 1 hour
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  // CORS: allow your frontend to fetch safely
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  for (const base of NITTER_INSTANCES) {
    const url = `${base}/${encodeURIComponent(username)}`;
    try {
      const html = await fetch(url, {
        headers: { 'User-Agent': 'vercel-nitter-scraper' },
      }).then(r => r.text());

      // Try to extract follower count (format: "12.3K Followers" or "123 Followers")
      const match = html.match(/([\d,.]+)\s*Followers/i);
      if (match) {
        const text = match[1];
        const followers = parseFollowerNumber(text);

        return res.status(200).json({
          username,
          followers,
          source: base,
          fetched_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      // silently continue to next mirror
      console.warn(`Failed on ${base}: ${err.message}`);
    }
  }

  // All failed — report politely
  return res.status(502).json({
    error: 'All Nitter instances failed to return follower count',
    username,
  });
}

function parseFollowerNumber(text) {
  // Handles "1,234", "12.3K", "4.5M"
  const num = text.toUpperCase().replace(/,/g, '').trim();
  if (num.endsWith('K')) return Math.round(parseFloat(num) * 1_000);
  if (num.endsWith('M')) return Math.round(parseFloat(num) * 1_000_000);
  return parseInt(num, 10);
}
