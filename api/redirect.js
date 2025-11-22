import { pool } from "../lib/db.js";

export default async function handler(req, res) {
  const code = req.query.code;

  const result = await pool.query(
    "SELECT * FROM links WHERE code=$1",
    [code]
  );

  if (result.rowCount === 0) {
    res.statusCode = 404;
    return res.send("Invalid URL");
  }

  await pool.query(
    "UPDATE links SET clicks = clicks + 1 WHERE code=$1",
    [code]
  );

  res.writeHead(302, { Location: result.rows[0].original_url });
  res.end();
}
