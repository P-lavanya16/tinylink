import { pool } from "../lib/db.js";
import { nanoid } from "nanoid";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { url } = JSON.parse(req.body);

  if (!url || !url.startsWith("http"))
    return res.status(400).json({ error: "Invalid URL" });

  const code = nanoid(7);

  await pool.query(
    "INSERT INTO links (code, original_url) VALUES ($1, $2)",
    [code, url]
  );

  return res.status(200).json({
    shortUrl: `${req.headers.host}/${code}`
  });
}
