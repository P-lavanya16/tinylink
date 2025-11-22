import { pool } from "../lib/db.js";

export default async function handler(req, res) {
  const code = req.query.code;

  const result = await pool.query(
    "SELECT * FROM links WHERE code=$1",
    [code]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Not found" });
  }

  return res.status(200).json(result.rows[0]);
}
