import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase'
import { generateCoverPrompt, generateCoverImage } from '@/lib/openai'
import { uploadImageFromUrl } from '@/lib/cloudinary'

type Params = { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminClient()

  const { data: idea, error: fetchError } = await db
    .from('ideas')
    .select('id, title, body_explanation')
    .eq('id', params.id)
    .single()

  if (fetchError || !idea) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
  }

  if (!idea.title || !idea.body_explanation) {
    return NextResponse.json(
      { error: 'Idea must be processed with AI before generating a cover' },
      { status: 400 }
    )
  }

  try {
    // Step 1: generate a good DALL-E prompt via gpt-4o-mini
    const dallePrompt = await generateCoverPrompt(idea.title, idea.body_explanation)

    // Step 2: generate image via DALL-E 3
    const dalleUrl = await generateCoverImage(dallePrompt)

    // Step 3: upload to Cloudinary for permanent storage
    const cloudinaryUrl = await uploadImageFromUrl(dalleUrl, params.id)

    // Step 4: save Cloudinary URL to Supabase
    const { data: updated, error: updateError } = await db
      .from('ideas')
      .update({ cover_image_url: cloudinaryUrl })
      .eq('id', params.id)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ cover_image_url: cloudinaryUrl, idea: updated })
  } catch (err) {
    console.error('[generate-cover]', err)
    const message = err instanceof Error ? err.message : 'Cover generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
