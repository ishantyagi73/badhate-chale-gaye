import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import "./styles.css";

const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1Uj3fxh-rNGQDD9BP6KZyoJCzz_qxDZDG3O9o2fILSqo/export?format=csv";
const DONATE_URL = "https://buymeacoffee.com/ghazalextensionproject";
const REPORT_URL =
  "https://script.google.com/macros/s/AKfycbyZEJIoSQEXZUiE6lyUwipzg5G1sfLX1aoo0Z0QiAG8BlyTUBOEqpDew4YFWfp_bFiF/exec";

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
      await fetch(REPORT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptIndex: index,
          words: reportInput.trim(),
        }),
      });
      setReportThankYou(true);
      setTimeout(() => {
        handleReportClose();
      }, 1200);
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
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbw3_6slE4KN12f67TM-OO6RMwBaEc9_8PA1nfJ-kYYRLRkXmjF3YzYhpETBwr1uR2ja/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "submitExtension",
            promptIndex: index,
            extension: userExtension.trim(),
          }),
        },
      );
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
      <div className="landing-header">
        <div className="landing-title">बढ़ाते चले गये</div>
        <div className="landing-summary">
          Continuing with the tradition of <b>तरह (tarah)</b>, we try to extend
          the rhythms of classic ghazals in our own words. Conveying modern
          perspectives and worldview. The finishing rhyme (<b>qafiya + radif</b>
          ) from the prompt (<b>matla</b>) is preserved and repeated in the
          second line of every extension. Enjoy
        </div>
      </div>
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
              <div className="prompt-poet">{current["Prompt Poet"]}</div>
              <div className="extension" style={{ whiteSpace: "pre-line" }}>
                {cleanText(current.Extension)}
              </div>
              <div className="extension-author">
                {current["Extension Author"]}
              </div>
            </>
          )}
        </div>
        {current["Rhyme Scheme"] && (
          <div className="rhyme-scheme-block">
            <div className="rhyme-scheme-title">Rhyme Scheme</div>
            <div
              className="rhyme-scheme-value"
              style={{ whiteSpace: "pre-line" }}
            >
              {cleanText(current["Rhyme Scheme"])}
            </div>
          </div>
        )}

        <div className="user-extension-block">
          <div className="user-extension-title">Write Your Own Extension</div>
          <textarea
            className="user-extension-input"
            rows={4}
            placeholder="Your poetic response…"
            value={userExtension}
            onChange={(e) => setUserExtension(e.target.value)}
            disabled={userExtensionLoading}
          />
          <button
            className="user-extension-submit"
            onClick={handleExtensionSubmit}
            disabled={userExtensionLoading || !userExtension.trim()}
          >
            Submit Extension
          </button>
          {userExtensionSuccess && (
            <div className="user-extension-success">
              Thanks! Your extension has been submitted for review.
            </div>
          )}
          {userExtensionError && (
            <div className="user-extension-error">
              Could not submit extension. Please try again.
            </div>
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
          <button
            className="btn"
            onClick={handlePrev}
            disabled={loading || !entries.length}
          >
            Previous
          </button>
          <button
            className="btn"
            onClick={handleNext}
            disabled={loading || !entries.length}
          >
            Next
          </button>
          <button
            className="btn"
            onClick={handleRandom}
            disabled={loading || entries.length < 2}
          >
            Random
          </button>
        </div>

        {/* Enhanced Report Link/Button */}
        <button
          className="report-link"
          onClick={handleReportOpen}
          type="button"
          aria-haspopup="dialog"
        >
          Report Tough Words
        </button>

        {/* Modal Popup */}
        {reportModalOpen && (
          <div className="modal-overlay" onClick={handleReportClose}>
            <div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="report-modal-title"
            >
              {!reportThankYou ? (
                <>
                  <div className="modal-title" id="report-modal-title">
                    Report Tough Words
                  </div>
                  <form onSubmit={handleReportSubmit}>
                    <input
                      className="modal-input"
                      type="text"
                      value={reportInput}
                      onChange={handleReportInput}
                      placeholder="e.g. ranjish, hasrat, maazi..etc"
                      disabled={reportLoading}
                      autoFocus
                    />
                    <button
                      className="modal-submit-btn"
                      type="submit"
                      disabled={reportLoading || !reportInput.trim()}
                    >
                      {reportLoading ? "Submitting..." : "Submit"}
                    </button>
                    <button
                      className="modal-cancel-btn"
                      type="button"
                      onClick={handleReportClose}
                      disabled={reportLoading}
                    >
                      Cancel
                    </button>
                  </form>
                </>
              ) : (
                <div className="modal-thankyou">
                  Thank you for your feedback!
                </div>
              )}
            </div>
          </div>
        )}

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
    </>
  );
}

export default App;
