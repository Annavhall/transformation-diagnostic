// Returns all participant summaries (password protected)
// Requires env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, ADMIN_PASSWORD

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { password } = req.query;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/lrange/diagnostic_summaries/0/-1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
        }
      }
    );

    if (!response.ok) throw new Error(`Redis error: ${response.status}`);

    const data = await response.json();
    const summaries = (data.result || []).map(s => {
      try { return JSON.parse(s); } catch { return null; }
    }).filter(Boolean);

    res.json({ summaries, count: summaries.length });
  } catch (error) {
    console.error('Summaries error:', error);
    res.status(500).json({ error: 'Failed to fetch summaries' });
  }
};
