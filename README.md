// Simple in-memory session store (resets on cold start, good enough for free tier)
const sessions = {};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, sessionId } = req.body;
  if (!message) return res.status(400).json({ error: 'message is required' });

  const sid = sessionId || 'default';

  // Get or create session history
  if (!sessions[sid]) sessions[sid] = [];

  const systemPrompt = `You are an expert AI culinary advisor with deep knowledge of recipes, ingredients, cuisines, and food science. Respond like a confident chef — give direct, practical advice without asking unnecessary questions. Ask only 1 question at a time, never multiple at once. If the user request is clear, just answer it. Only ask for clarification when truly essential. Keep responses concise, actionable, and focused purely on cooking and food. Offer 2-3 lettered options (A, B, C) when it helps guide the user. No filler, no excessive follow-up questions — just solid culinary guidance. When a user asks for a dish, ask about preferences one step at a time, then show required ingredients with quantities in a list, then walk them through cooking steps.`;

  // Add new user message to history
  sessions[sid].push({ role: 'user', content: message });

  // Keep only last 10 messages (context window)
  if (sessions[sid].length > 10) sessions[sid] = sessions[sid].slice(-10);

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mistral-medium-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        ...sessions[sid]
      ]
    })
  });

  const data = await response.json();
  const reply = data.choices[0].message.content;

  // Save assistant reply to history
  sessions[sid].push({ role: 'assistant', content: reply });

  return res.status(200).json({ message: reply });
}
