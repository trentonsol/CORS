import fs from "fs";
import path from "path";

export default function handler(req, res) {
  // Add CORS headers if the frontend is on another domain
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const publicDir = path.join(process.cwd(), "public");

    // Helper: recursively collect audio files
    const getAudioFiles = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      let files = [];

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          files = files.concat(getAudioFiles(fullPath));
        } else if (/\.(mp3|wav|ogg|m4a)$/i.test(entry.name)) {
          const relativePath = path.relative(publicDir, fullPath).replace(/\\/g, "/");
          files.push(relativePath);
        }
      }

      return files;
    };

    const audioFiles = getAudioFiles(publicDir);

    // Detect the base URL dynamically (works on Vercel)
    const baseUrl =
      req.headers["x-forwarded-proto"] && req.headers["x-forwarded-host"]
        ? `${req.headers["x-forwarded-proto"]}://${req.headers["x-forwarded-host"]}`
        : "http://localhost:3000"; // fallback for local dev

    // Prepend base URL
    const fileUrls = audioFiles.map((f) => `${baseUrl}/${f}`);

    return res.status(200).json({ files: fileUrls });
  } catch (error) {
    console.error("Error reading public folder:", error);
    return res.status(500).json({ error: "Failed to read public folder" });
  }
}
