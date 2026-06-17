// Generates an aggregate report from all participant summaries using Claude
// Requires env vars: ANTHROPIC_API_KEY, ADMIN_PASSWORD

const Anthropic = require('@anthropic-ai/sdk');

const DIMENSIONS = [
  { key: 'visionStrategy', label: 'Vision & Strategy' },
  { key: 'leadershipSponsorship', label: 'Leadership & Sponsorship' },
  { key: 'governanceDecisionMaking', label: 'Governance & Decision-Making' },
  { key: 'deliveryExecution', label: 'Delivery & Execution' },
  { key: 'changeManagementPeople', label: 'Change Management & People' },
  { key: 'stakeholderEngagement', label: 'Stakeholder Engagement' }
];

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { password, summaries } = req.body;
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!summaries || summaries.length === 0) {
    return res.status(400).json({ error: 'No summaries provided' });
  }

  try {
    // Calculate average ratings
    const avgRatings = {};
    DIMENSIONS.forEach(({ key }) => {
      const values = summaries
        .map(s => s.ratings?.[key])
        .filter(v => typeof v === 'number');
      avgRatings[key] = values.length
        ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
        : null;
    });

    // Collect all quotes, strengths, concerns for Claude to synthesise
    const allStrengths = summaries.flatMap(s => s.keyStrengths || []);
    const allConcerns = summaries.flatMap(s => s.keyConcerns || []);
    const allQuotes = summaries.flatMap(s => s.notableQuotes || []);
    const allFocusAreas = summaries.flatMap(s => s.recommendedFocusAreas || []);
    const dataFindings = summaries
      .map(s => s.dataFindings)
      .filter(Boolean);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const prompt = `You are an organisational consultant synthesising diagnostic interview results from ${summaries.length} participants in a transformation program.

Here is the raw data from all participants:

STRENGTHS MENTIONED:
${allStrengths.map((s, i) => `${i + 1}. ${s}`).join('\n')}

CONCERNS MENTIONED:
${allConcerns.map((c, i) => `${i + 1}. ${c}`).join('\n')}

NOTABLE QUOTES:
${allQuotes.map((q, i) => `${i + 1}. "${q}"`).join('\n')}

RECOMMENDED FOCUS AREAS:
${allFocusAreas.map((f, i) => `${i + 1}. ${f}`).join('\n')}

DATA & ACCESS FINDINGS:
${dataFindings.map((d, i) => `Participant ${i + 1}: Access issues: ${d.dataAccessIssues || 'none noted'}. Integrity issues: ${d.dataIntegrityIssues || 'none noted'}.`).join('\n')}

AVERAGE RATINGS (1-5 scale):
${DIMENSIONS.map(({ key, label }) => `${label}: ${avgRatings[key] ?? 'N/A'}/5`).join('\n')}

Please produce a concise aggregate report with these sections:
1. Overall Assessment (2-3 sentences)
2. Top 3 Common Strengths (synthesised from all responses)
3. Top 3 Common Concerns (synthesised from all responses)
4. Data & Access Summary (key themes from data findings)
5. Top 3 Priority Focus Areas (most frequently recommended)
6. 2-3 Representative Quotes (pick the most illustrative)

Write in clear, professional consulting language. Be specific and avoid vague generalisations.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }]
    });

    res.json({
      avgRatings,
      narrativeReport: response.content[0].text,
      participantCount: summaries.length
    });
  } catch (error) {
    console.error('Aggregate error:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
};
