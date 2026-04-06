const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY

const SYSTEM_PROMPT = `You are an intelligent AI assistant for SahayakAI, a disaster relief system.
You are having a real-time voice conversation with a user reporting a crisis or volunteer mission.

YOUR GOALS:
1. Extract mission details (category, urgency, location, peopleAffected, volunteersNeeded, timeframe, needs).
2. If info is missing, decide the SINGLE most important follow-up question to ask right now based on context and urgency.
3. Keep your questions very brief, conversational, empathetic, and spoken-language friendly.
10. If a location is needed, ALWAYS ask the user: "Kya aapki current location use karoon ya aap koi aur address batana chahte hain?" (Should I take your current location or do you want to provide another one?).
11. If the user says "current location", "mera location lelo", "lelo", or similar, respond to confirm, and set "locationRequested": true.
12. Once you have enough critical info (especially Location and Need), mark "hasEnoughInfo": true.
13. CRITICAL: Identify the language the user is speaking in, and respond EXACTLY in that same language. If the user speaks Hindi or Hinglish, you MUST write your response in the Devanagari script (e.g., "नमस्ते", not "Namaste").

Output ONLY JSON matching this structure:
{
  "hasEnoughInfo": boolean,
  "nextReply": "string (your translated conversational reply or question to the user, leave blank if hasEnoughInfo is true)",
  "locationRequested": boolean,
  "extracted": {
    "category": "string/null",
    "urgency": "low/medium/high/critical/null",
    "location": "string/null",
    "peopleAffected": "number/null",
    "volunteersNeeded": "number/null",
    "timeframe": "string/null",
    "needs": "string/null",
    "summary": "1-sentence summary of mission so far"
  }
}`

export async function chatWithAgent(conversationHistory) {
  if (!GROQ_API_KEY) throw new Error('Groq API key not configured')

  // Map our UI history [{role, content}] into Groq format, injecting System Prompt
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...conversationHistory.map(m => ({ role: m.role, content: m.content }))
  ]

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.3,
      max_tokens: 1400,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const msg = err?.error?.message || res.statusText
    throw new Error(`Groq API error (${res.status}): ${msg}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from Groq')

  return JSON.parse(content)
}

// ─── Batch Analysis (for CreateTaskPage non-voice flow) ────────
const BATCH_ANALYSIS_PROMPT = `You are a crisis mission analyzer. 
Extract details from the user's report and generate up to 5 specific follow-up questions to fill remaining gaps.
Questions should have types: "text", "choice", "location", "media", "counter", "multiselect".
"choice", "select", "multiselect" types MUST have a "suggestions" array.

Output ONLY JSON matching this structure:
{
  "extracted": { "category": "string", "volunteersNeeded": number, "location": "string", "summary": "string" },
  "questions": [
    { "id": "urgency", "question": "string", "type": "choice", "suggestions": ["Critical", "High", "Medium", "Low"] }
  ]
}`

export async function analyzeMissionReport(text) {
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
        { role: 'system', content: BATCH_ANALYSIS_PROMPT },
        { role: 'user', content: text }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) throw new Error('Groq API error')
  const data = await res.json()
  const content = data.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty Groq response')
  
  return JSON.parse(content)
}
