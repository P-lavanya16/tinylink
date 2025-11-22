import express from "express";
import { pool } from "../lib/db.js";
import { nanoid } from "nanoid";

const app = express();
app.use(express.json());

// ----------------------
// HEALTH CHECK
// ----------------------
app.get("/api/healthz", (req, res) => {
  res.status(200).json({ ok: true, version: "1.0" });
});

// ----------------------
// CREATE SHORT LINK
// POST /api/links
// ----------------------
app.post("/api/links", async (req, res) => {
  const { url, code: customCode } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const code = customCode || nanoid(7);

  // Check duplicate custom code
  const check = await pool.query("SELECT * FROM links WHERE code=$1", [code]);
  if (check.rowCount > 0) {
    return res.status(409).json({ error: "Code already exists" });
  }

  await pool.query(
    "INSERT INTO links (code, original_url, clicks, last_clicked) VALUES ($1, $2, 0, NULL)",
    [code, url]
  );

  return res.status(200).json({
    shortUrl: `${req.headers.host}/${code}`,
    code,
  });
});

// ----------------------
// LIST ALL LINKS
// GET /api/links
// ----------------------
app.get("/api/links", async (req, res) => {
  const result = await pool.query("SELECT * FROM links ORDER BY created_at DESC");
  res.status(200).json(result.rows);
});

// ----------------------
// GET STATS FOR ONE CODE
// GET /api/links/:code
// ----------------------
app.get("/api/links/:code", async (req, res) => {
  const { code } = req.params;

  const result = await pool.query("SELECT * FROM links WHERE code=$1", [code]);

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.status(200).json(result.rows[0]);
});

// ----------------------
// DELETE
// DELETE /api/links/:code
// ----------------------
app.delete("/api/links/:code", async (req, res) => {
  const { code } = req.params;

  await pool.query("DELETE FROM links WHERE code=$1", [code]);

  return res.status(200).json({ message: "Deleted" });
});

// ----------------------
// REDIRECT LOGIC
// GET /:code
// ----------------------
app.get("/:code", async (req, res) => {
  const { code } = req.params;

  const result = await pool.query("SELECT * FROM links WHERE code=$1", [code]);

  if (result.rowCount === 0) {
    return res.status(404).send("Invalid URL");
  }

  await pool.query(
    "UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code=$1",
    [code]
  );

  return res.redirect(302, result.rows[0].original_url);
});

// ----------------------
export default app;
