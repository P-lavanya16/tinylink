import { pool } from "../lib/db.js";
import { nanoid } from "nanoid";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { url, customCode } = JSON.parse(req.body);

  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  const code = customCode || nanoid(7);

  // Check if duplicate code exists
  const exists = await pool.query(
    "SELECT * FROM links WHERE code=$1",
    [code]
  );

  if (exists.rowCount > 0) {
    return res.status(409).json({ error: "Code already exists" });
  }

  await pool.query(
    "INSERT INTO links (code, original_url, clicks) VALUES ($1, $2, 0)",
    [code, url]
  );

  return res.status(200).json({
    code,
    shortUrl: `${req.headers.host}/${code}`
  });
}
