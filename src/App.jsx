import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import "./styles.css";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1Uj3fxh-rNGQDD9BP6KZyoJCzz_qxDZDG3O9o2fILSqo/export?format=csv";

const DONATE_URL = "https://buymeacoffee.com/ghazalextensionproject"; // Replace with your actual donate URL

function cleanText(text) {
  return (text || "").replace(/\\n/g, "\n").trim();
}

function App() {
  const [entries, setEntries] = useState([]);
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch and parse CSV
  useEffect(() => {
    setLoading(true);
    Papa.parse(SHEET_CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setEntries(results.data);
        setLoading(false);
      },
      error: (err) => {
        setError("Could not load poetry data.");
        setLoading(false);
      },
    });
  }, []);

  // Ensure index is valid if entries change
  useEffect(() => {
    if (entries.length && index >= entries.length) {
      setIndex(0);
    }
  }, [entries, index]);

  const handleLike = () => {
    setLiked((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handlePrev = () => {
    setIndex((i) => (i === 0 ? entries.length - 1 : i - 1));
  };

  const handleNext = () => {
    setIndex((i) => (i === entries.length - 1 ? 0 : i + 1));
  };

  const handleRandom = () => {
    if (entries.length < 2) return;
    let rand;
    do {
      rand = Math.floor(Math.random() * entries.length);
    } while (rand === index);
    setIndex(rand);
  };

  const current = entries[index] || {};

  return (
    <div className="main-container">
      <div className="poetry-block" aria-live="polite">
        {loading ? (
          <div style={{ textAlign: "center", color: "#aaa" }}>Loading…</div>
        ) : error ? (
          <div style={{ color: "#c00" }}>{error}</div>
        ) : (
          <>
            <div className="prompt" style={{ whiteSpace: "pre-line" }}>
  {cleanText(current.Prompt)}
</div>
            <div className="prompt-poet">
              {current["Prompt Poet"]}
            </div>
            <div className="extension" style={{ whiteSpace: "pre-line" }}>
              {cleanText(current.Extension)}
            </div>
            <div className="extension-author">
              {current["Extension Author"]}
            </div>
          </>
        )}
      </div>

      <div className="button-row">
        <button
          className="btn"
          onClick={handleLike}
          aria-pressed={!!liked[index]}
          title="Like this poem"
        >
          {liked[index] ? "♥ Liked" : "♡ Like"}
        </button>
        <button className="btn" onClick={handlePrev} disabled={loading || !entries.length}>
          Previous
        </button>
        <button className="btn" onClick={handleNext} disabled={loading || !entries.length}>
          Next
        </button>
        <button className="btn" onClick={handleRandom} disabled={loading || entries.length < 2}>
          Random
        </button>
      </div>

      {/* Optional: Report link */}
      <a
        href="#"
        className="report-link"
        onClick={(e) => {
          e.preventDefault();
          window.alert("Thank you for your feedback! (Reporting not yet implemented.)");
        }}
      >
        Report Tough Words
      </a>

      <div className="donate-container">
        <a
          className="donate-btn"
          href={DONATE_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Support us
        </a>
      </div>

      <div className="footer">
        A crowdsourced anthology of poetic extensions
      </div>
    </div>
  );
}

export default App;