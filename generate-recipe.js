export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { ingredient } = req.body;
  if (!ingredient) return res.status(400).json({ error: 'ingredient is required' });

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
        content: `You are a strict ingredient extractor for a cooking AI system.\n\nAvailable ingredients (ENGLISH ONLY): sugar, rice, salt, oil, butter, milk, chicken, mutton, potato, onion, garlic\n\nYour job:\n- Understand English, Hindi, and Hinglish\n- Fix spelling mistakes\n- ALWAYS convert input words into the EXACT allowed ENGLISH ingredient names\n- NEVER output the original input word\n\nMappings (MANDATORY - ALWAYS APPLY):\n- chawal = rice\n- chaawal = rice\n- cheeni = sugar\n- chini = sugar\n- namak = salt\n- tel = oil\n- makhan = butter\n- doodh = milk\n- murga = chicken\n- murgi = chicken\n- gosht = mutton\n- aloo = potato\n- pyaz = onion\n- lasun = garlic\n\nRules (VERY IMPORTANT):\n- Output ONLY ONE WORD in ENGLISH\n- Output MUST be EXACTLY one of the allowed ingredients\n- NEVER output Hindi or Hinglish words\n- If multiple ingredients are found, return ONLY the FIRST one\n- Do NOT repeat words\n- Do NOT return multiple words\n- Do NOT return anything outside the allowed list\n- If nothing matches, return: none\n- No explanation\n\nUser message: ${ingredient}`
      }],
      temperature: 0.1,
      max_tokens: 10
    })
  });

  const data = await response.json();
  const substitute = data.choices[0].message.content.trim();

  return res.status(200).json({ substitute });
}
