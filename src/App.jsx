import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import "./styles.css";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1Uj3fxh-rNGQDD9BP6KZyoJCzz_qxDZDG3O9o2fILSqo/export?format=csv";
const DONATE_URL = "https://buymeacoffee.com/ghazalextensionproject";

function cleanText(text) {
  return (text || "").replace(/\\n/g, "\n").trim();
}

function App() {
  const [entries, setEntries] = useState([]);
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state for reporting tough words
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportInput, setReportInput] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportThankYou, setReportThankYou] = useState(false);

  // User extension submission state
  const [userExtension, setUserExtension] = useState("");
  const [userExtensionLoading, setUserExtensionLoading] = useState(false);
  const [userExtensionSuccess, setUserExtensionSuccess] = useState(false);
  const [userExtensionError, setUserExtensionError] = useState(false);

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
        if (results.data && results.data.length > 0) {
          const randomIdx = Math.floor(Math.random() * results.data.length);
          setIndex(randomIdx);
        }
      },
      error: () => {
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

  // Report Tough Words modal handlers
  const handleReportOpen = () => {
    setReportModalOpen(true);
    setReportInput("");
    setReportThankYou(false);
  };

  const handleReportClose = () => {
    setReportModalOpen(false);
    setReportInput("");
    setReportThankYou(false);
    setReportLoading(false);
  };

  const handleReportInput = (e) => {
    setReportInput(e.target.value);
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportInput.trim()) return;
    setReportLoading(true);
    try {
      const res = await fetch("/api/report-tough-words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reportToughWords",
          promptId: current["Prompt ID"],
          words: reportInput.trim(),
        }),
      });
      if (res.ok) {
        setReportThankYou(true);
        setTimeout(() => {
          handleReportClose();
        }, 1200);
      } else {
        alert("Could not submit report. Please try again later.");
        setReportLoading(false);
      }
    } catch (err) {
      alert("Could not submit report. Please try again later.");
      setReportLoading(false);
    }
  };

  const current = entries[index] || {};

  async function handleExtensionSubmit() {
    setUserExtensionLoading(true);
    setUserExtensionSuccess(false);
    setUserExtensionError(false);
    try {
      const res = await fetch("/api/submit-extension", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submitExtension",
          promptId: current["Prompt ID"],
          extension: userExtension.trim(),
        }),
      });
      if (res.ok) {
        setUserExtension("");
        setUserExtensionSuccess(true);
      } else {
        setUserExtensionError(true);
      }
    } catch {
      setUserExtensionError(true);
    } finally {
      setUserExtensionLoading(false);
      setTimeout(() => setUserExtensionSuccess(false), 4000);
    }
  }

  return (
    <>
      <header className="rekhta-header">
        <h1 className="rekhta-title">बढ़ाते चले गये</h1>
        <div className="rekhta-tagline">
          हर मिसरा, एक नई आवाज़। हर कदम, एक नया सफ़र।
        </div>
      </header>
      <main className="main-container">
        <section className="rekhta-poetry-card" aria-live="polite">
          {loading ? (
            <div style={{ textAlign: "center", color: "#aaa" }}>Loading…</div>
          ) : error ? (
            <div style={{ color: "#c00" }}>{error}</div>
          ) : (
            <>
              <div className="rekhta-matla">{cleanText(current.Prompt)}</div>
              <div className="rekhta-poet">{current["Prompt Poet"]}</div>
              <div className="rekhta-extension">
                {cleanText(current.Extension)}
              </div>
              <div className="rekhta-extension-author">
                {current["Extension Author"]}
              </div>
              {current["Rhyme Scheme"] && (
                <div className="rekhta-rhyme">
                  {cleanText(current["Rhyme Scheme"])}
                </div>
              )}
            </>
          )}
        </section>

        <form
          className="rekhta-extension-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleExtensionSubmit();
          }}
        >
          <textarea
            rows={4}
            placeholder="अपनी तरही रचना यहाँ लिखें..."
            value={userExtension}
            onChange={(e) => setUserExtension(e.target.value)}
            disabled={userExtensionLoading}
          />
          <button
            className="rekhta-submit-btn"
            type="submit"
            disabled={userExtensionLoading || !userExtension.trim()}
          >
            अपनी extension भेजें
          </button>
          {userExtensionSuccess && (
            <div className="rekhta-success">
              धन्यवाद! आपकी रचना समीक्षा के लिए भेज दी गई है।
            </div>
          )}
          {userExtensionError && (
            <div className="rekhta-error">
              भेजने में समस्या आई। कृपया फिर प्रयास करें।
            </div>
          )}
        </form>

        <nav className="button-row" aria-label="Poem navigation">
          <button
            className="rekhta-nav-btn"
            onClick={handlePrev}
            disabled={loading || !entries.length}
          >
            Previous
          </button>
          <button
            className="rekhta-nav-btn"
            onClick={handleNext}
            disabled={loading || !entries.length}
          >
            Next
          </button>
          <button
            className="rekhta-nav-btn"
            onClick={handleRandom}
            disabled={loading || entries.length < 2}
          >
            Random
          </button>
          <button
            className={`rekhta-like-btn${liked[index] ? " liked" : ""}`}
            onClick={handleLike}
            aria-pressed={!!liked[index]}
            title="Like this poem"
          >
            {liked[index] ? "♥" : "♡"}
          </button>
        </nav>

        <span
          className="rekhta-report-link"
          onClick={handleReportOpen}
          role="button"
          tabIndex={0}
        >
          मुश्किल शब्द बताएं
        </span>

        {/* Modal Popup */}
        {reportModalOpen && (
          <div className="rekhta-modal" onClick={handleReportClose}>
            <div
              className="rekhta-modal-content"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-modal-title"
            >
              {!reportThankYou ? (
                <>
                  <div className="rekhta-modal-title" id="report-modal-title">
                    मुश्किल शब्द रिपोर्ट करें
                  </div>
                  <form onSubmit={handleReportSubmit}>
                    <input
                      className="rekhta-modal-input"
                      type="text"
                      value={reportInput}
                      onChange={handleReportInput}
                      placeholder="e.g. ranjish, hasrat, maazi..etc"
                      disabled={reportLoading}
                      autoFocus
                    />
                    <button
                      className="rekhta-modal-submit-btn"
                      type="submit"
                      disabled={reportLoading || !reportInput.trim()}
                    >
                      {reportLoading ? "भेज रहे हैं..." : "भेजें"}
                    </button>
                    <button
                      className="rekhta-modal-cancel-btn"
                      type="button"
                      onClick={handleReportClose}
                      disabled={reportLoading}
                    >
                      रद्द करें
                    </button>
                  </form>
                </>
              ) : (
                <div className="rekhta-modal-thankyou">
                  धन्यवाद! आपकी प्रतिक्रिया दर्ज हो गई है।
                </div>
              )}
            </div>
          </div>
        )}

        <footer className="rekhta-footer">
          <div>एक साझा कविता-संग्रह, आपकी आवाज़ों से गूँजता।</div>
          <a
            className="rekhta-support-btn"
            href={DONATE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Support us
          </a>
        </footer>
      </main>
    </>
  );
}

export default App;