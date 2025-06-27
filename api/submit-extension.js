// /api/submit-extension.js

export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }
  
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw3_6slE4KN12f67TM-OO6RMwBaEc9_8PA1nfJ-kYYRLRkXmjF3YzYhpETBwr1uR2ja/exec";
  
    try {
      const googleRes = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
  
      const text = await googleRes.text();
  
      if (googleRes.ok) {
        return res.status(200).json({ message: "Extension submitted", googleResponse: text });
      } else {
        return res.status(500).json({ error: "Failed to submit extension", googleResponse: text });
      }
    } catch (err) {
      return res.status(500).json({ error: "Proxy error", details: err.message });
    }
  }