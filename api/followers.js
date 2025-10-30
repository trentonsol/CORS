import Redis from 'ioredis';

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

    // Check if the key exists
    const exists = await redis.exists("count");
    if (!exists) {
      // Initialize key with 0
      await redis.set("count", 0);
      console.log("Initialized count key to 0");
    }

    const count = await redis.get("count");
    const count2 = await redis.get("count2");
    return res.status(200).json({count2});
  } catch (error) {
    console.error("Error using redis:", error);
    return res.status(500).json({ error: "Error using redis" });
  }
}

