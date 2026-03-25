'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Idea } from '@/types'
import StatusBadge from '@/components/StatusBadge'

type Props = { params: { id: string } }

type AIState = 'idle' | 'processing' | 'generating-cover' | 'saving'

export default function IdeaEditorPage({ params }: Props) {
  const router = useRouter()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [aiState, setAIState] = useState<AIState>('idle')
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Editable fields
  const [draft, setDraft] = useState('')
  const [title, setTitle] = useState('')
  const [explanation, setExplanation] = useState('')
  const [solution, setSolution] = useState('')
  const [conclusion, setConclusion] = useState('')

  const fetchIdea = useCallback(async () => {
    try {
      const res = await fetch(`/api/ideas/${params.id}`)
      if (!res.ok) { router.push('/portal'); return }
      const data: Idea = await res.json()
      setIdea(data)
      setDraft(data.draft_content ?? '')
      setTitle(data.title ?? '')
      setExplanation(data.body_explanation ?? '')
      setSolution(data.body_solution ?? '')
      setConclusion(data.body_conclusion ?? '')
    } finally {
      setLoading(false)
    }
  }, [params.id, router])

  useEffect(() => { fetchIdea() }, [fetchIdea])

  function flash(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  async function handleSaveDraft() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/ideas/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft_content: draft }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const updated = await res.json()
      setIdea(updated)
      flash('Draft saved')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveProcessed() {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/ideas/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body_explanation: explanation,
          body_solution: solution,
          body_conclusion: conclusion,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const updated = await res.json()
      setIdea(updated)
      flash('Changes saved')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleProcess() {
    setAIState('processing')
    setError('')
    try {
      const res = await fetch(`/api/ideas/${params.id}/process`, { method: 'POST' })
      if (!res.ok) throw new Error((await res.json()).error)
      const updated: Idea = await res.json()
      setIdea(updated)
      setTitle(updated.title ?? '')
      setExplanation(updated.body_explanation ?? '')
      setSolution(updated.body_solution ?? '')
      setConclusion(updated.body_conclusion ?? '')
      flash('AI processing complete')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI processing failed')
    } finally {
      setAIState('idle')
    }
  }

  async function handleGenerateCover() {
    setAIState('generating-cover')
    setError('')
    try {
      const res = await fetch(`/api/ideas/${params.id}/generate-cover`, { method: 'POST' })
      if (!res.ok) throw new Error((await res.json()).error)
      const data = await res.json()
      setIdea(data.idea)
      flash('Cover image generated')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cover generation failed')
    } finally {
      setAIState('idle')
    }
  }

  async function handleTogglePublish() {
    if (!idea) return
    const newStatus = idea.status === 'published' ? 'processed' : 'published'
    setError('')
    try {
      const res = await fetch(`/api/ideas/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      const updated = await res.json()
      setIdea(updated)
      flash(newStatus === 'published' ? 'Published!' : 'Unpublished')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this idea permanently? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/ideas/${params.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      router.push('/portal')
    } catch {
      setError('Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="font-mono text-xs text-ink-3 uppercase tracking-widest animate-pulse">Loading…</span>
      </div>
    )
  }

  if (!idea) return null

  const isAIBusy = aiState !== 'idle'
  const hasProcessed = idea.status === 'processed' || idea.status === 'published'
  const canPublish = hasProcessed && idea.title && idea.body_explanation

  return (
    <div className="max-w-2xl mx-auto">
      {/* Breadcrumb + status */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/portal" className="font-mono text-xs text-ink-3 hover:text-ink transition-colors uppercase tracking-wider">
            ← Ideas
          </Link>
          <span className="text-border">/</span>
          <span className="font-mono text-xs text-ink-3 uppercase tracking-wider">Edit</span>
        </div>
        <StatusBadge status={idea.status} />
      </div>

      {/* Feedback banners */}
      {successMsg && (
        <div className="mb-6 font-mono text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="mb-6 font-mono text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* SECTION 1: Draft */}
      <div className="bg-surface border border-border rounded-xl p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-xl text-ink font-medium">Raw draft</h2>
            <p className="font-mono text-[11px] text-ink-3 mt-1">Your unfiltered brain dump — never shown publicly</p>
          </div>
        </div>

        <textarea
          className="draft-textarea min-h-[240px]"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write your raw thoughts here…"
        />

        <div className="flex items-center justify-between mt-4">
          <span className="font-mono text-[11px] text-ink-3">
            {draft.trim() ? draft.trim().split(/\s+/).length : 0} words
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="font-mono text-xs text-ink-3 hover:text-ink transition-colors uppercase tracking-wider px-4 py-2 border border-border rounded-lg hover:border-ink/30 disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save draft'}
            </button>
            <button
              onClick={handleProcess}
              disabled={isAIBusy || !draft.trim()}
              className="bg-accent hover:bg-accent/90 text-white font-mono text-xs tracking-widest uppercase px-5 py-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {aiState === 'processing' ? 'Processing…' : '✦ Process with AI'}
            </button>
          </div>
        </div>

        {aiState === 'processing' && (
          <div className="mt-4 font-mono text-xs text-accent bg-accent-light border border-accent/20 rounded-lg px-4 py-3 animate-pulse">
            GPT-4o is reading and formatting your idea…
          </div>
        )}
      </div>

      {/* SECTION 2: Processed output (visible once processed) */}
      {hasProcessed && (
        <div className="bg-surface border border-border rounded-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-xl text-ink font-medium">Formatted output</h2>
              <p className="font-mono text-[11px] text-ink-3 mt-1">AI-generated — edit freely before publishing</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block font-mono text-[11px] text-ink-3 tracking-widest uppercase mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-border rounded-lg px-4 py-3 font-serif text-lg text-ink focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {[
              { label: 'The Idea', value: explanation, set: setExplanation, rows: 6 },
              { label: 'The Thinking', value: solution, set: setSolution, rows: 5 },
              { label: 'Where This Lands', value: conclusion, set: setConclusion, rows: 3 },
            ].map(({ label, value, set, rows }) => (
              <div key={label}>
                <label className="block font-mono text-[11px] text-ink-3 tracking-widest uppercase mb-2">{label}</label>
                <textarea
                  rows={rows}
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  className="draft-textarea"
                  style={{ minHeight: 'unset' }}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-5">
            <button
              onClick={handleSaveProcessed}
              disabled={saving}
              className="font-mono text-xs text-ink-3 hover:text-ink transition-colors uppercase tracking-wider px-4 py-2 border border-border rounded-lg hover:border-ink/30 disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Save edits'}
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: Cover image */}
      {hasProcessed && (
        <div className="bg-surface border border-border rounded-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-serif text-xl text-ink font-medium">Cover image</h2>
              <p className="font-mono text-[11px] text-ink-3 mt-1">DALL-E 3 · stored on Cloudinary</p>
            </div>
            <button
              onClick={handleGenerateCover}
              disabled={isAIBusy}
              className="bg-ink hover:bg-ink/90 text-surface font-mono text-xs tracking-widest uppercase px-4 py-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {aiState === 'generating-cover' ? 'Generating…' : idea.cover_image_url ? '↺ Regenerate' : '✦ Generate cover'}
            </button>
          </div>

          {aiState === 'generating-cover' && (
            <div className="font-mono text-xs text-ink-3 bg-surface-2 border border-border rounded-lg px-4 py-3 animate-pulse">
              Creating prompt → Generating image → Uploading to Cloudinary…
            </div>
          )}

          {idea.cover_image_url && aiState !== 'generating-cover' && (
            <div className="aspect-[16/9] rounded-lg overflow-hidden border border-border">
              <Image
                src={idea.cover_image_url}
                alt="Cover"
                width={1792}
                height={1024}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      )}

      {/* SECTION 4: Publish controls */}
      <div className="bg-surface border border-border rounded-xl p-8 mb-6">
        <h2 className="font-serif text-xl text-ink font-medium mb-1">Publish</h2>
        <p className="font-mono text-[11px] text-ink-3 mb-6">
          {idea.status === 'published'
            ? 'Live on the public site. Click to unpublish.'
            : !hasProcessed
            ? 'Process with AI first before publishing.'
            : 'Ready to go live when you are.'}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleTogglePublish}
            disabled={!canPublish && idea.status !== 'published'}
            className={`font-mono text-xs tracking-widest uppercase px-5 py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              idea.status === 'published'
                ? 'bg-surface-3 text-ink-2 border border-border hover:border-ink/30'
                : 'bg-ink text-surface hover:bg-ink/90'
            }`}
          >
            {idea.status === 'published' ? 'Unpublish' : 'Publish'}
          </button>

          {idea.status === 'published' && idea.slug && (
            <Link
              href={`/ideas/${idea.slug}`}
              target="_blank"
              className="font-mono text-xs text-ink-3 hover:text-accent transition-colors uppercase tracking-wider"
            >
              View live →
            </Link>
          )}
        </div>
      </div>

      {/* Delete */}
      <div className="flex justify-end pb-8">
        <button
          onClick={handleDelete}
          className="font-mono text-[11px] text-ink-3 hover:text-red-600 transition-colors uppercase tracking-widest"
        >
          Delete idea
        </button>
      </div>
    </div>
  )
}
