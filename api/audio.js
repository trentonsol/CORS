import fs from "fs";
import path from "path";


/**
 * Serverless function that returns all file names inside the /public folder (recursively).
 */
export default function handler(req, res) {

  // CORS headers (optional if frontend is on another domain)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
    
  try {
    const publicDir = path.join(process.cwd(), "public");

    // Helper function to recursively get file names
    const getFileNames = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      let files = [];

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          files = files.concat(getFileNames(fullPath));
        } else {
          files.push(entry.name); // only push file name
        }
      }

      return files;
    };

    const fileNames = getFileNames(publicDir);

    return res.status(200).json({ files: fileNames });
  } catch (error) {
    console.error("Error reading public folder:", error);
    return res.status(500).json({ error: "Failed to read public folder" });
  }
}
