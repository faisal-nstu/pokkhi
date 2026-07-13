import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to proxy audio requests
  app.get("/api/sound-stream", async (req, res) => {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).send("Missing url parameter");
    }

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          "Referer": "https://xeno-canto.org/"
        }
      });

      if (!response.ok) {
        return res.status(response.status).send(`Failed to fetch sound file from source: ${response.statusText}`);
      }

      // Set headers for smooth streaming in the browser's audio element
      const contentType = response.headers.get("Content-Type");
      res.setHeader("Content-Type", contentType || "audio/mpeg");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "public, max-age=86400");

      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err) {
      console.error("Audio proxy error:", err);
      res.status(500).send("Error proxying sound file");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "docs");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
