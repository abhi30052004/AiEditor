import OpenAI from 'openai'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompt-builder'
import { connectDB } from '@/lib/db'
import Generation from '@/models/Generation'

function validatePayload(payload) {
  if (!payload?.prompt || !String(payload.prompt).trim()) {
    return 'Prompt is required.'
  }

  if (!payload?.platform) {
    return 'Platform is required.'
  }

  if (!payload?.tone) {
    return 'Tone is required.'
  }

  if (!payload?.length) {
    return 'Length is required.'
  }

  return null
}

export async function POST(request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return Response.json(
        { error: 'Missing OPENAI_API_KEY. Add it to your .env.local file and restart the dev server.' },
        { status: 500 }
      )
    }

    const payload = await request.json()
    const validationError = validatePayload(payload)

    if (validationError) {
      return Response.json({ error: validationError }, { status: 400 })
    }

    const client = new OpenAI({ apiKey })

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(payload) },
      ],
    })

    const rawContent = completion.choices?.[0]?.message?.content
    const content = typeof rawContent === 'string' ? rawContent.trim() : ''

    if (!content) {
      return Response.json({ error: 'The model returned an empty response.' }, { status: 502 })
    }

    // Save to database
    try {
      await connectDB()
      await Generation.create({
        platform: payload.platform,
        tone: payload.tone,
        length: payload.length,
        audience: payload.audience || '',
        prompt: payload.prompt,
        content: content
      })
    } catch (dbError) {
      console.error('Database save error:', dbError)
      // We don't want to fail the request if saving to DB fails, 
      // but the user should know something happened if they expect history.
    }

    return Response.json({ content })
  } catch (error) {
    console.error('Generate route error:', error)
    return Response.json(
      { error: 'Unable to generate content right now. Check your API key and try again.' },
      { status: 500 }
    )
  }
}
