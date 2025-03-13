from flask import Flask, render_template, request
import feedparser
import requests

app = Flask(__name__)

# OpenWeatherMap API Key (Replace with your API Key)
WEATHER_API_KEY = "YOUR_API_KEY"

# RSS Feeds categorized by topics
news_categories = {
    "Technology": [
        "https://www.theverge.com/rss/index.xml",
        "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml"
    ],
    "Sports": [
        "https://www.espn.com/espn/rss/news",
        "https://feeds.bbci.co.uk/sport/rss.xml"
    ],
    "Business": [
        "https://feeds.bbci.co.uk/news/business/rss.xml",
        "https://rss.cnn.com/rss/money_news_international.rss"
    ],
    "Entertainment": [
        "https://www.hollywoodreporter.com/t/rss/",
        "https://www.billboard.com/feed/"
    ],
    "International": [
        "https://rss.cnn.com/rss/edition_world.rss",
        "https://feeds.bbci.co.uk/news/world/rss.xml",
        "https://www.aljazeera.com/xml/rss/all.xml"
    ]
}

# Regional News Feeds
regional_news = {
    "Delhi": "https://timesofindia.indiatimes.com/rssfeeds/-2128839596.cms",
    "Mumbai": "https://timesofindia.indiatimes.com/rssfeeds/-2128838581.cms",
    "New York": "https://rss.nytimes.com/services/xml/rss/nyt/NYRegion.xml",
    "London": "https://feeds.bbci.co.uk/news/england/london/rss.xml",
    "Tokyo": "https://www3.nhk.or.jp/rss/news/cat1.xml"
}

# Fetch News
def fetch_news(search_query=None):
    news_list = []

    if search_query in news_categories:
        feeds = news_categories[search_query]
    elif search_query in regional_news:
        feeds = [regional_news[search_query]]
    else:
        feeds = sum(news_categories.values(), [])  # Fetch all categories if no match

    for url in feeds:
        feed = feedparser.parse(url)
        for entry in feed.entries[:5]:  
            news_item = {
                "title": entry.title,
                "link": entry.link,
                "published": entry.published
            }
            news_list.append(news_item)

    return news_list

# Fetch Weather Report
def fetch_weather(city):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "weather": data["weather"][0]["description"].capitalize(),
            "icon": f"http://openweathermap.org/img/wn/{data['weather'][0]['icon']}.png"
        }
    return None

@app.route("/", methods=["GET", "POST"])
def home():
    search_query = request.form.get("search")
    city = request.form.get("city") or search_query or "New Delhi"

    news = fetch_news(search_query)
    weather = fetch_weather(city)

    return render_template("news.html", news=news, search_query=search_query, weather=weather, categories=list(news_categories.keys()), regions=list(regional_news.keys()))

if __name__ == "__main__":
    app.run(debug=True)
