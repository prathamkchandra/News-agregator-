import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [news, setNews] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("general");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  // Fetch news when category changes
  useEffect(() => {
    setNews([]); // Reset news when category changes
    setPage(1); // Reset page
    setHasMore(true);
    fetchNews(1, true);
  }, [category]);

  // Intersection Observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchNews(page + 1, false);
      }
    });

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [page, hasMore, loading]);

  // Fetch news data
  const fetchNews = async (pageNum, isNewCategory) => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await axios.get(
        `http://localhost:5000/news?category=${category}`
      );

      if (response.data.length === 0) {
        setHasMore(false);
      } else {
        setNews((prevNews) =>
          isNewCategory
            ? response.data
            : [...prevNews, ...response.data.slice(0, 10)]
        );
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <h1>News Aggregator</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search news..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-bar"
      />

      {/* Category Selection */}
      <select
        onChange={(e) => setCategory(e.target.value)}
        className="category-select"
      >
        <option value="general">General</option>
        <option value="world">World News</option>
        <option value="politics">Politics</option>
        <option value="gaming">Gaming</option>
        <option value="tech">Technology</option>
        <option value="business">Business</option>
        <option value="sports">Sports</option>
        <option value="health">Health</option>
        <option value="science">Science</option>
        <option value="entertainment">Entertainment</option>
      </select>

      {/* News List */}
      {news
        .filter((article) =>
          article.title.toLowerCase().includes(search.toLowerCase())
        )
        .map((article, index) => (
          <div key={index} className="news-card">
            <h2>{article.title}</h2>
            <p>
              <strong>Source:</strong> {article.source}
            </p>
            <p>
              <strong>Published:</strong>{" "}
              {new Date(article.pubDate).toLocaleString()}
            </p>
            <a href={article.link} target="_blank" rel="noopener noreferrer">
              Read more
            </a>
          </div>
        ))}

      {/* Infinite Scroll Loader */}
      {hasMore && (
        <div ref={loaderRef} className="loading">
          {loading ? "Loading more news..." : "Scroll down for more"}
        </div>
      )}
    </div>
  );
}

export default App;
