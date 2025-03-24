const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");

const app = express();
const PORT = 5000;
app.use(cors());

const parser = new Parser();

// News sources categorized by topics and regions
const RSS_FEEDS = {
  general: [
    { name: "BBC", url: "https://feeds.bbci.co.uk/news/rss.xml" },
    { name: "CNN", url: "http://rss.cnn.com/rss/edition.rss" }
  ],
  tech: [{ name: "TechCrunch", url: "https://techcrunch.com/feed/" }],
  business: [{ name: "Forbes", url: "https://www.forbes.com/business/feed/" }],
  sports: [{ name: "ESPN", url: "https://www.espn.com/espn/rss/news" }],
};

// Country-based RSS feeds
const COUNTRY_FEEDS = {
  us: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml",
  uk: "https://feeds.bbci.co.uk/news/rss.xml",
  india: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
  australia: "https://www.abc.net.au/news/feed/51120/rss.xml",
  canada: "https://www.cbc.ca/cmlink/rss-topstories",
};

// Fetch news based on category and region
app.get("/news", async (req, res) => {
  try {
    const category = req.query.category || "general";
    const region = req.query.region || "us"; // Default to US
    const searchQuery = req.query.query ? req.query.query.toLowerCase() : "";

    let selectedFeeds = RSS_FEEDS[category] || RSS_FEEDS["general"];
    if (region !== "global" && COUNTRY_FEEDS[region]) {
      selectedFeeds = [{ name: region.toUpperCase(), url: COUNTRY_FEEDS[region] }];
    }

    let articles = [];
    for (const feed of selectedFeeds) {
      const parsedFeed = await parser.parseURL(feed.url);
      articles.push(...parsedFeed.items.map(item => ({
        title: item.title,
        link: item.link,
        source: feed.name,
        pubDate: item.pubDate,
        category
      })));
    }

    // Filter articles by search query if provided
    if (searchQuery) {
      articles = articles.filter(article => article.title.toLowerCase().includes(searchQuery));
    }

    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch RSS feeds" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
