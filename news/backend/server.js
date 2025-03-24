const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = 5000;
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const parser = new Parser();
const RSS_FEEDS = {
  general: [
    { name: "BBC", url: "https://feeds.bbci.co.uk/news/rss.xml" },
    { name: "CNN", url: "http://rss.cnn.com/rss/edition.rss" }
  ],
  tech: [
    { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
    { name: "Wired", url: "https://www.wired.com/feed/rss" }
  ],
  business: [
    { name: "Forbes", url: "https://www.forbes.com/business/feed/" },
    { name: "CNBC", url: "https://www.cnbc.com/id/10001147/device/rss/rss.html" }
  ],
  gaming: [
    { name: "IGN", url: "https://www.ign.com/articles?feed=rss" },
    { name: "Kotaku", url: "https://kotaku.com/rss" }
  ],
};

// Store user interest data for recommendations
const userInterests = {};

async function fetchNews(category = "general") {
  let selectedFeeds = RSS_FEEDS[category] || RSS_FEEDS["general"];
  let articles = [];

  for (const feed of selectedFeeds) {
    try {
      const parsedFeed = await parser.parseURL(feed.url);
      articles.push(...parsedFeed.items.map(item => ({
        title: item.title,
        link: item.link,
        source: feed.name,
        pubDate: item.pubDate,
        category
      })));
    } catch (error) {
      console.error(`Error fetching feed from ${feed.url}:`, error.message);
    }
  }

  return articles;
}

// API endpoint to fetch news
app.get("/news", async (req, res) => {
  try {
    const category = req.query.category || "general";
    const articles = await fetchNews(category);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch RSS feeds" });
  }
});

// WebSocket - Send live news updates
setInterval(async () => {
  const articles = await fetchNews();
  io.emit("newsUpdate", articles);
}, 30000);

// API for AI-based news recommendations
app.post("/track-interest", (req, res) => {
  const { userId, category } = req.body;
  if (!userInterests[userId]) {
    userInterests[userId] = {};
  }
  userInterests[userId][category] = (userInterests[userId][category] || 0) + 1;
  res.json({ success: true });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
