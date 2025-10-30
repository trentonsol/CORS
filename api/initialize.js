import Redis from 'ioredis';
import audioData from '../data/audioData.json' with { type: 'json' };

const redis = new Redis(process.env.REDIS_URL)

export default async function handler(req, res) {

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    const randomNumber = Math.floor(Math.random() * audioData.length);

    await redis.set("rootIndex", randomNumber);
    await redis.set("currentIndex", randomNumber);

    const rootIndex = await redis.get("rootIndex");
    const currentIndex = await redis.get("currentIndex");

    return res.status(200).json({rootIndex, currentIndex});
  } catch (error) {
    console.error("Error using redis:", error);
    return res.status(500).json({ error: "Error using redis" });
  }
}

