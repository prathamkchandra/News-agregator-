import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("general");
  const [region, setRegion] = useState("us");
  const [page, setPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const loaderRef = useRef(null);

  // Fetch news when category or region changes
  useEffect(() => {
    fetchNews(1, true);
  }, [category, region]);

  // Fetch news data
  const fetchNews = async (pageNum, isNewCategory = false) => {
    try {
      const response = await axios.get(`http://localhost:5000/news`, {
        params: { category, region, query: search },
      });

      setNews(prevNews => (isNewCategory ? response.data : [...prevNews, ...response.data.slice(0, 10)]));
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  return (
    <div className={`container ${darkMode ? "dark-mode" : ""}`}>
      <nav className="floating-navbar">
        <h1>News Aggregator</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="dark-mode-toggle">
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        {/* Search News Input */}
        <input
          type="text"
          placeholder="Search news topics..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
        />

        {/* Category Dropdown */}
        <select onChange={(e) => setCategory(e.target.value)} className="category-select">
          <option value="general">General</option>
          <option value="tech">Technology</option>
          <option value="business">Business</option>
          <option value="sports">Sports</option>
        </select>

        {/* Region Dropdown */}
        <select onChange={(e) => setRegion(e.target.value)} className="region-select">
          <option value="us">USA</option>
          <option value="uk">UK</option>
          <option value="india">India</option>
          <option value="australia">Australia</option>
          <option value="canada">Canada</option>
        </select>
      </nav>

      <div className="news-container">
        {news.map((article, index) => (
          <div key={index} className="news-card">
            <h2>{article.title}</h2>
            <p><strong>Source:</strong> {article.source}</p>
            <p><strong>Published:</strong> {new Date(article.pubDate).toLocaleString()}</p>
            <a href={article.link} target="_blank" rel="noopener noreferrer">Read more</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
