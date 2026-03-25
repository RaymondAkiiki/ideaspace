import OpenAI from 'openai'
import type { AIProcessedOutput } from '@/types'

export function getOpenAIClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
}

const SYSTEM_PROMPT = `You are an editor for a personal idea journal. 
Your job is to take a raw, unstructured brain-dump and turn it into a clear, readable post.

STRICT RULES:
- Preserve the author's original point of view and voice entirely
- Write like a thoughtful person explaining something to a friend — never corporate, never academic
- No listicles, no bullet points, no headers inside the body text
- Never use "In conclusion", "In summary", "To summarise", or motivational closings
- Remove filler words and repetition but keep the raw honesty
- End the conclusion with an open question or honest uncertainty, not a resolved statement

OUTPUT: Respond ONLY with a valid JSON object. No markdown, no backticks, no preamble.

Schema:
{
  "title": "string — clear, human, conversational. Max 12 words. Not clickbait.",
  "explanation": "string — 2-4 paragraphs. What is the problem, observation, or context? Plain language a non-expert understands.",
  "solution": "string — 2-3 paragraphs. What is the idea, approach, or shift in thinking being proposed? Be concrete.",
  "conclusion": "string — 1 short paragraph. Reframe the core takeaway. End with an open question or honest uncertainty."
}`

export async function processIdeaWithAI(draftContent: string): Promise<AIProcessedOutput> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 2000,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: draftContent },
    ],
    response_format: { type: 'json_object' },
  })

  const raw = response.choices[0]?.message?.content
  if (!raw) throw new Error('OpenAI returned empty response')

  const parsed = JSON.parse(raw) as AIProcessedOutput

  if (!parsed.title || !parsed.explanation || !parsed.solution || !parsed.conclusion) {
    throw new Error('OpenAI response missing required fields')
  }

  return parsed
}

export async function generateCoverPrompt(title: string, explanation: string): Promise<string> {
  const client = getOpenAIClient()

  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 300,
    messages: [
      {
        role: 'system',
        content: `You write DALL-E 3 image generation prompts for blog post cover images.

RULES:
- The image MUST visually represent the specific topic and core theme of the post
- Think: what scene, object, situation, or visual metaphor directly represents this exact topic?
- Style: editorial photography or cinematic still — warm natural tones, amber and black palette
- No text, no logos, no words anywhere in the image
- People and faces ARE allowed if relevant (leadership, management, relationships, etc.)
- Lighting: warm, directional, moody — like a high-quality magazine cover photo
- Be specific and concrete, not vague or abstract
- Return ONLY the prompt. No explanation, no preamble.`,
      },
      {
        role: 'user',
        content: `Title: "${title}"

Post summary: "${explanation.slice(0, 400)}"

Write a DALL-E prompt for a cover image that directly and specifically represents this topic.`,
      },
    ],
  })

  return res.choices[0]?.message?.content?.trim() ??
    `Editorial cover photo representing "${title}", warm amber tones, cinematic lighting, magazine style`
}

export async function generateCoverImage(prompt: string): Promise<string> {
  const client = getOpenAIClient()

  const response = await client.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1792x1024',
    quality: 'standard',
  })

  const url = response.data?.[0]?.url
  if (!url) throw new Error('DALL-E returned no image URL')
  return url
}