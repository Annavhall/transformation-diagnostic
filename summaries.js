// Saves a completed participant summary to Upstash Redis
// Requires env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { summary } = req.body;
    if (!summary) return res.status(400).json({ error: 'summary required' });

    const record = {
      ...summary,
      id: Date.now().toString(),
      submittedAt: new Date().toISOString()
    };

    const response = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/rpush/diagnostic_summaries`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([JSON.stringify(record)])
      }
    );

    if (!response.ok) {
      throw new Error(`Redis error: ${response.status}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Submit error:', error);
    res.status(500).json({ error: 'Failed to save response' });
  }
};
