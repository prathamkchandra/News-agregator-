const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");

const app = express();
const PORT = 5000;
app.use(cors());

const parser = new Parser();

const RSS_FEEDS = {
  general: [
    { name: "BBC", url: "https://feeds.bbci.co.uk/news/rss.xml" },
    { name: "CNN", url: "http://rss.cnn.com/rss/edition.rss" }
  ],
  tech: [{ name: "TechCrunch", url: "https://techcrunch.com/feed/" }],
  business: [
    { name: "Forbes", url: "https://www.forbes.com/real-time/feed2/" }, 
    { name: "CNBC", url: "https://www.cnbc.com/id/10001147/device/rss/rss.html" }
  ],
  sports: [{ name: "ESPN", url: "https://www.espn.com/espn/rss/news" }],
};

// Country-specific news sources
const REGION_FEEDS = {
  us: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  uk: "https://feeds.bbci.co.uk/news/rss.xml",
  india: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
  australia: "https://www.abc.net.au/news/feed/51120/rss.xml",
  canada: "https://www.cbc.ca/cmlink/rss-topstories",
};

// Fetch news with pagination and region selection
app.get("/news", async (req, res) => {
  try {
    const category = req.query.category || "general";
    const region = req.query.region || "global"; // Default to global
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    let selectedFeeds = region !== "global" && REGION_FEEDS[region]
      ? [{ name: region.toUpperCase(), url: REGION_FEEDS[region] }]
      : RSS_FEEDS[category] || RSS_FEEDS["general"];

    let articles = [];

    for (const feed of selectedFeeds) {
      try {
        const parsedFeed = await parser.parseURL(feed.url);
        articles.push(...parsedFeed.items.map(item => ({
          title: item.title,
          link: item.link,
          source: feed.name,
          pubDate: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          category
        })));
      } catch (feedError) {
        console.error(`Error fetching feed from ${feed.url}:`, feedError.message);
      }
    }

    // Sort articles by newest first
    articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    // Paginate results
    const startIndex = (page - 1) * limit;
    const paginatedArticles = articles.slice(startIndex, startIndex + limit);

    res.json({ articles: paginatedArticles, hasMore: startIndex + limit < articles.length });
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch RSS feeds" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
