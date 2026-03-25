import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/auth'
import { getAdminClient } from '@/lib/supabase'

// GET /api/ideas — list all ideas (portal, auth required)
export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getAdminClient()
  const { data, error } = await db
    .from('ideas')
    .select('id, title, status, slug, created_at, updated_at, cover_image_url')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/ideas — create new idea
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { draft_content } = await req.json()
  if (!draft_content?.trim()) {
    return NextResponse.json({ error: 'draft_content is required' }, { status: 400 })
  }

  const db = getAdminClient()
  const { data, error } = await db
    .from('ideas')
    .insert({ draft_content: draft_content.trim(), status: 'draft' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
