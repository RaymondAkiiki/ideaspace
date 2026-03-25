'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewIdeaPage() {
  const router = useRouter()
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft_content: draft }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to save')
        return
      }

      const idea = await res.json()
      router.push(`/portal/ideas/${idea.id}`)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/portal"
          className="font-mono text-xs text-ink-3 hover:text-ink transition-colors uppercase tracking-wider"
        >
          ← Ideas
        </Link>
        <span className="text-border">/</span>
        <span className="font-mono text-xs text-ink-3 uppercase tracking-wider">New</span>
      </div>

      <div className="bg-surface border border-border rounded-xl p-8">
        <h1 className="font-serif text-2xl text-ink font-medium mb-2">New idea</h1>
        <p className="font-mono text-xs text-ink-3 mb-8 leading-relaxed">
          Just write. Don&apos;t edit, don&apos;t format, don&apos;t think too hard.
          The AI will clean it up — your job is to get it out.
        </p>

        <form onSubmit={handleSave}>
          <textarea
            className="draft-textarea min-h-[360px]"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What's the idea? What are you thinking about? What problem keeps nagging at you? Just write it all out here — raw, unfiltered, messy. The AI will turn it into something readable later."
            autoFocus
          />

          <div className="flex items-center justify-between mt-4">
            <span className="font-mono text-[11px] text-ink-3">
              {wordCount} {wordCount === 1 ? 'word' : 'words'}
            </span>

            <div className="flex items-center gap-3">
              <Link
                href="/portal"
                className="font-mono text-xs text-ink-3 hover:text-ink transition-colors uppercase tracking-wider px-4 py-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading || !draft.trim()}
                className="bg-ink text-surface font-mono text-xs tracking-widest uppercase px-5 py-2.5 rounded-lg hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving…' : 'Save draft'}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-4 font-mono text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
