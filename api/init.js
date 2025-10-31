import Redis from 'ioredis';
import audioData from '../data/audioData.json' with { type: 'json' };

const redis = new Redis(process.env.REDIS_URL)

function modulo(dividend, divisor) {
  return ((dividend % divisor) + divisor) % divisor;
}

export default async function handler(req, res) {

  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {

    let result = {};
    const audioDataLength = audioData.length;
    const randomNumber = Math.floor(Math.random() * audioDataLength);
    const currentIndex = randomNumber;

    result.currentIndex = currentIndex;
    
    result.nextUp = { 
      name: audioData[currentIndex].name, 
      title: audioData[currentIndex].title 
    };

    result.stats = {
      "total": audioDataLength,
      "queued": audioDataLength,
      "voiced": 0,
      "pfi": Math.floor(Math.random() * 100) + 1,
      "totalOnAir": 0
    };

    await redis.set("rootIndex", randomNumber);
    await redis.set("currentIndex", randomNumber);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error using redis:", error);
    return res.status(500).json({ error: "Error using redis" });
  }
}

