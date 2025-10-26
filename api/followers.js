export default async function handler(req, res) {
  const username = req.query.user || "Twitter";
  const target = `https://nitter.poast.org/trentonsolana`;
  const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`;

  try {
    const response = await fetch(url);
    const html = await response.text();

    // Extract the followers count
    const match = html.match(/(\d[\d,.]*) Followers/);
    const followers = match ? match[1] : "Unknown";

    // Set CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).json({ username, followers });
  } catch (err) {
    console.error("Detailed error:", err.message);
    res.status(500).json({ error: err.message });
  }
}

