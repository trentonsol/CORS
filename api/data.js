import Redis from 'ioredis';
import audioData from '../data/audioData.json' with { type: 'json' };
import footerData from '../data/footerData.json' with { type: 'json' };

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
        const audioDataLength = audioData.length;
        const rootIndex = await redis.get("rootIndex");
        const currentIndex = await redis.get("currentIndex");
        const nextUpIndex = modulo((currentIndex + 1), audioDataLength);
        const voiced = modulo((currentIndex - rootIndex), audioDataLength);
        let result = {};

        result.audioData = audioData[currentIndex];
        result.nexUp = { name: audioData[nextUpIndex].name, title: audioData[nextUpIndex].title };
        result.footerData = footerData[currentIndex];

        result.stats = {
            "total": audioDataLength,
            "queued": audioDataLength - voiced,
            "voiced": voiced,
            "pfi": Math.floor(Math.random() * 100) + 1,
            "totalOnAir": voiced * 75
        };

        await redis.incr("currentIndex");
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error reading public folder:", error);
        return res.status(500).json({ error: "Failed to read public folder" });
    }
}