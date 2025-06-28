export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Only POST requests allowed");
  }

  try {
    const response = await fetch(
      "https://script.google.com/macros/s/AKfycbyZEJIoSQEXZUiE6lyUwipzg5G1sfLX1aoo0Z0QiAG8BlyTUBOEqpDew4YFWfp_bFiF/exec",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      }
    );
    const text = await response.text();
    res.status(200).send(text);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to forward to Google Apps Script");
  }
}
