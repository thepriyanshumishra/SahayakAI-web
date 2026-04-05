const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

const SYSTEM_PROMPT = `You are an intelligent NGO mission briefing assistant for SahayakAI — a disaster relief & volunteer coordination platform in India.

Your job: analyze a crisis report (free-form text), extract every piece of info the user already provided, then generate smart follow-up questions ONLY for information that is MISSING or unclear.

RULES:
- Never ask for something the user already mentioned
- Generate 3-5 questions MAXIMUM, prioritizing most critical missing info
- Question types: "text" | "choice" | "location" | "media"
- location type — when you need WHERE the crisis is happening
- media type — when photos/videos of the situation would help
- choice type — when a discrete set of answers makes sense
- text type — for open-ended details
- Each question should have 2-4 realistic suggestions (empty array [] for media/location types)
- Suggestions should be specific and contextually relevant to India (cities, typical volunteer counts, etc.)
- Keep question text empathetic, concise, action-oriented
- "required" should be true only for critical info (location, volunteer count)
- The extracted.summary should be a single compelling sentence describing the mission

CATEGORIES: Food Distribution, Flood Relief, Medical Aid, Shelter, Education, Relief Supplies, Emergency Response, Environmental, Community, Women Safety, Animal Rescue, Other

Return ONLY valid JSON — no markdown, no extra text:
{
  "extracted": {
    "category": string | null,
    "urgency": "low" | "medium" | "high" | "critical" | null,
    "location": string | null,
    "peopleAffected": number | null,
    "volunteersNeeded": number | null,
    "timeframe": string | null,
    "needs": string | null,
    "summary": string
  },
  "questions": [
    {
      "id": string,
      "question": string,
      "type": "text" | "choice" | "location" | "media",
      "required": boolean,
      "suggestions": string[]
    }
  ]
}`

export async function analyzeMissionReport(userMessage) {
  if (!GROQ_API_KEY) throw new Error('Groq API key not configured')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Crisis report from NGO: "${userMessage}"\n\nAnalyze this and return the JSON response.`,
        },
      ],
      temperature: 0.35,
      max_tokens: 1400,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq error: ${err}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from Groq')

  return JSON.parse(content)
}
