import audioData from '../data/audioData.json' assert { type: 'json' };
import footerData from '../data/footerData.json' assert { type: 'json' };


export default function handler(req, res) {

    // CORS headers (optional if frontend is on another domain)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    try {
        const audioDataLength = audioData.length;
        const rootIndex = Math.floor(Math.random() * audioDataLength);
        const currentIndex = (rootIndex + 5) % audioDataLength
        const nextUpIndex = (currentIndex + 1) % audioDataLength;
        let result = {};

        result.audioData = audioData[currentIndex];
        result.nexUp = { name: audioData[nextUpIndex].name, title: audioData[nextUpIndex].title };
        result.footerData = footerData[currentIndex];
        result.stats = {
            total: audioDataLength,
            queued: audioDataLength - ((currentIndex - rootIndex) % audioDataLength),
            voiced: (currentIndex - rootIndex) % audioDataLength,
            pfi: Math.floor(Math.random() * 100) + 1,
            totalOnAir: voiced * 75
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: "Failed to read public folder" });
    }
}