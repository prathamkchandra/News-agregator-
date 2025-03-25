import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [news, setNews] = useState([]);
  const [category, setCategory] = useState("general");
  const [region, setRegion] = useState("global");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  // Fetch news when category or region changes
  useEffect(() => {
    setNews([]); // Reset news on category/region change
    setPage(1);
    setHasMore(true);
    fetchNews(1, true);
  }, [category, region]);

  // Fetch news data
  const fetchNews = useCallback(async (pageNum, isNewCategory = false) => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const response = await axios.get(`http://localhost:5000/news`, {
        params: { category, region, page: pageNum, limit: 10 },
      });

      if (response.data && response.data.articles) {
        setNews(prevNews => (isNewCategory ? response.data.articles : [...prevNews, ...response.data.articles]));
        setHasMore(response.data.hasMore);
        setPage(response.data.nextPage || pageNum + 1);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    }

    setLoading(false);
  }, [category, region, loading, hasMore]);

  // Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchNews(page);
      }
    });

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchNews, hasMore, loading, page]);

  return (
    <div className="container">
      <nav className="floating-navbar">
        <h1>News Aggregator</h1>

        {/* Category Dropdown */}
        <select onChange={(e) => setCategory(e.target.value)} className="category-select">
          <option value="general">General</option>
          <option value="tech">Technology</option>
          <option value="business">Business</option>
          <option value="sports">Sports</option>
        </select>

        {/* Region Dropdown */}
        <select onChange={(e) => setRegion(e.target.value)} className="region-select">
          <option value="global">All Regions</option>
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

      {hasMore && <div ref={loaderRef} className="loading">Loading more news...</div>}
    </div>
  );
}

export default App;
