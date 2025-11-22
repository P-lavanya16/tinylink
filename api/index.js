export default function handler(req, res) {
  return res.status(200).json({
    ok: true,
    version: "1.0",
    timestamp: Date.now()
  });
}
