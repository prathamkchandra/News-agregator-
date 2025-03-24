import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:5000");

function App() {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("general");
  const [page, setPage] = useState(1);
  const [darkMode, setDarkMode] = useState(false);
  const loaderRef = useRef(null);

  // Real-time updates
  useEffect(() => {
    socket.on("newsUpdate", (updatedNews) => {
      setNews(updatedNews.filter(article => article.category === category));
    });

    return () => socket.off("newsUpdate");
  }, [category]);

  // Fetch news when category changes
  useEffect(() => {
    fetchNews(1, true);
  }, [category]);

  // Fetch news data
  const fetchNews = async (pageNum, isNewCategory = false) => {
    try {
      const response = await axios.get(`http://localhost:5000/news?category=${category}`);
      setNews(prevNews => (isNewCategory ? response.data : [...prevNews, ...response.data.slice(0, 10)]));
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching news:", error);
    }
  };

  // Track user interests
  const trackInterest = async () => {
    await axios.post("http://localhost:5000/track-interest", { userId: "user123", category });
  };

  return (
    <div className={`container ${darkMode ? "dark-mode" : ""}`}>
      <nav className="floating-navbar">
        <h1>News Aggregator</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="dark-mode-toggle">
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        <select onChange={(e) => setCategory(e.target.value)} className="category-select">
          <option value="general">General</option>
          <option value="tech">Technology</option>
          <option value="business">Business</option>
          <option value="gaming">Gaming</option>
        </select>
      </nav>

      <div className="news-container">
        {news.map((article, index) => (
          <div key={index} className="news-card" onClick={trackInterest}>
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
