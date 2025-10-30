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

    // Check if the key exists
    const existsRootIndex = await redis.exists("rootIndex");
    if (!existsRootIndex) {
      // Initialize 
      await redis.set("rootIndex", randomNumber);
    }

    const existsCurrentIndex = await redis.exists("currentIndex");
    if (!existsCurrentIndex) {
      // Initialize 
      await redis.set("currentIndex", randomNumber);
    }

    return res.status(200).json({rootIndex, urrentIndex});
  } catch (error) {
    console.error("Error using redis:", error);
    return res.status(500).json({ error: "Error using redis" });
  }
}

