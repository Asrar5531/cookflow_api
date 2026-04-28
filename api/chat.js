export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { description } = req.body;
  if (!description) return res.status(400).json({ error: 'description is required' });

  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer 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',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/gemma-2-2b-it',
      messages: [{
        role: 'user',
        content: `You are a strict recipe generator for a cooking AI system.\n\nAvailable ingredients (ENGLISH ONLY): sugar, rice, salt, oil, butter, milk, chicken, mutton, potato, onion, garlic\n\nThe user has described what they want to cook. Return ONLY valid JSON with this exact structure, no explanation, no markdown:\n{\n  "recipe_name": "string",\n  "ingredients": ["string"],\n  "steps": ["string"],\n  "cook_time_minutes": number\n}\n\nRules:\n- Only use ingredients from the allowed list above\n- Understand English, Hindi, and Hinglish input\n- Fix spelling mistakes\n- If the request is not food-related, return: {"error": "Not a food request"}\n- Return ONLY the JSON object, nothing else\n\nUser request: ${description}`
      }],
      temperature: 0.3,
      max_tokens: 500
    })
  });

  const data = await response.json();
  const raw = data.choices[0].message.content;
  const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();

  try {
    return res.status(200).json(JSON.parse(cleaned));
  } catch (e) {
    return res.status(200).json({ error: 'Parse failed', raw: cleaned });
  }
}
