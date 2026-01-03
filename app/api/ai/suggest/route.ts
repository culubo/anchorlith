import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { context = '', instructions = 'Continue the following note in a helpful, concise tone.' } = body

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured. Set OPENAI_API_KEY on the server.' }, { status: 501 })
    }

    const payload = {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful writing assistant that helps continue and improve short notes.' },
        { role: 'user', content: `${instructions}\n\nContext:\n${context}` },
      ],
      max_tokens: 300,
      temperature: 0.7,
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: 'Failed to fetch suggestion', details: text }, { status: 502 })
    }

    const data = await res.json()
    const suggestion = data?.choices?.[0]?.message?.content || ''

    return NextResponse.json({ suggestion })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
