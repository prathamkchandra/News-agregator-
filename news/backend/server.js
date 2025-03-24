const express = require("express");
const cors = require("cors");
const Parser = require("rss-parser");

const app = express();
const PORT = 5000;
app.use(cors());

const parser = new Parser();

// Updated news categories
const RSS_FEEDS = {
  general: [
    { name: "BBC", url: "https://feeds.bbci.co.uk/news/rss.xml" },
    { name: "CNN", url: "http://rss.cnn.com/rss/edition.rss" }
  ],
  world: [
    { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
    { name: "Reuters", url: "https://www.reutersagency.com/feed/?best-topics=world" }
  ],
  politics: [
    { name: "Politico", url: "https://www.politico.com/rss/politics.xml" },
    { name: "The Guardian Politics", url: "https://www.theguardian.com/politics/rss" }
  ],
  gaming: [
    { name: "IGN", url: "https://www.ign.com/articles?feed=rss" },
    { name: "Kotaku", url: "https://kotaku.com/rss" }
  ],
  tech: [
    { name: "TechCrunch", url: "https://techcrunch.com/feed/" },
    { name: "Wired", url: "https://www.wired.com/feed/rss" }
  ],
  business: [
    { name: "Forbes", url: "https://www.forbes.com/business/feed/" },
    { name: "CNBC", url: "https://www.cnbc.com/id/10001147/device/rss/rss.html" }
  ],
  sports: [
    { name: "ESPN", url: "https://www.espn.com/espn/rss/news" },
    { name: "Sky Sports", url: "https://www.skysports.com/rss/12040" }
  ],
  health: [
    { name: "Medical News Today", url: "https://www.medicalnewstoday.com/rss" },
    { name: "WHO", url: "https://www.who.int/rss-feeds/news-english.xml" }
  ],
  science: [
    { name: "Science Daily", url: "https://www.sciencedaily.com/rss/top.xml" },
    { name: "NASA", url: "https://www.nasa.gov/rss/dyn/breaking_news.rss" }
  ],
  entertainment: [
    { name: "Hollywood Reporter", url: "https://www.hollywoodreporter.com/t/entertainment/feed/" },
    { name: "Variety", url: "https://variety.com/feed/" }
  ]
};

// Fetch news for a category
app.get("/news", async (req, res) => {
  try {
    const category = req.query.category || "general";
    let selectedFeeds = RSS_FEEDS[category] || RSS_FEEDS["general"];

    let articles = [];
    for (const feed of selectedFeeds) {
      const parsedFeed = await parser.parseURL(feed.url);
      articles.push(...parsedFeed.items.map(item => ({
        title: item.title,
        link: item.link,
        source: feed.name,
        pubDate: item.pubDate
      })));
    }

    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch RSS feeds" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
