import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase'
import { processIdeaWithAI } from '@/lib/openai'
import { generateSlug } from '@/lib/slug'

type Params = { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminClient()

  // Fetch the idea
  const { data: idea, error: fetchError } = await db
    .from('ideas')
    .select('id, draft_content')
    .eq('id', params.id)
    .single()

  if (fetchError || !idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
  }

  if (!idea.draft_content?.trim()) {
    return NextResponse.json({ error: 'Draft content is empty' }, { status: 400 })
  }

  try {
    const processed = await processIdeaWithAI(idea.draft_content)
    const slug = generateSlug(processed.title, params.id)

    const { data: updated, error: updateError } = await db
      .from('ideas')
      .update({
        title: processed.title,
        body_explanation: processed.explanation,
        body_solution: processed.solution,
        body_conclusion: processed.conclusion,
        slug,
        status: 'processed',
      })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json(updated)
  } catch (err) {
    console.error('[process]', err)
    const message = err instanceof Error ? err.message : 'AI processing failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
