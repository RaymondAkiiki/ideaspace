import type { Metadata } from 'next'
import Link from 'next/link'
import { getAdminClient } from '@/lib/supabase'
import type { Idea } from '@/types'
import StatusBadge from '@/components/StatusBadge'

export const metadata: Metadata = { title: 'Portal · Ideaspace' }

async function getAllIdeas(): Promise<Idea[]> {
  const db = getAdminClient()
  const { data, error } = await db
    .from('ideas')
    .select('id, title, status, slug, created_at, updated_at, draft_content')
    .order('created_at', { ascending: false })

  if (error) return []
  return data as Idea[]
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default async function PortalPage() {
  const ideas = await getAllIdeas()

  const counts = {
    draft: ideas.filter((i) => i.status === 'draft').length,
    processed: ideas.filter((i) => i.status === 'processed').length,
    published: ideas.filter((i) => i.status === 'published').length,
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl text-ink font-medium mb-1">Your ideas</h1>
          <p className="font-mono text-xs text-ink-3 tracking-wide">
            {ideas.length} total · {counts.draft} draft · {counts.processed} processed · {counts.published} published
          </p>
        </div>
        <Link
          href="/portal/ideas/new"
          className="bg-accent hover:bg-accent/90 text-white font-mono text-xs tracking-widest uppercase px-4 py-2.5 rounded-lg transition-colors"
        >
          + New idea
        </Link>
      </div>

      {/* Table */}
      {ideas.length === 0 ? (
        <div className="border border-border rounded-xl bg-surface text-center py-24">
          <p className="font-mono text-xs text-ink-3 uppercase tracking-widest mb-4">No ideas yet</p>
          <Link
            href="/portal/ideas/new"
            className="font-mono text-xs text-accent hover:underline uppercase tracking-wider"
          >
            Write your first one →
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="text-left font-mono text-[10px] text-ink-3 uppercase tracking-widest px-5 py-3.5">
                  Title / Draft
                </th>
                <th className="text-left font-mono text-[10px] text-ink-3 uppercase tracking-widest px-4 py-3.5 hidden sm:table-cell">
                  Status
                </th>
                <th className="text-left font-mono text-[10px] text-ink-3 uppercase tracking-widest px-4 py-3.5 hidden md:table-cell">
                  Created
                </th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {ideas.map((idea, i) => (
                <tr
                  key={idea.id}
                  className={`border-b border-border last:border-0 hover:bg-surface-2/50 transition-colors ${
                    i % 2 === 0 ? '' : ''
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="font-medium text-sm text-ink leading-snug mb-0.5">
                      {idea.title ?? (
                        <span className="text-ink-3 italic">Untitled draft</span>
                      )}
                    </div>
                    <div className="font-mono text-[10px] text-ink-3 truncate max-w-xs">
                      {idea.draft_content?.slice(0, 80)}…
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden sm:table-cell">
                    <StatusBadge status={idea.status} />
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="font-mono text-[11px] text-ink-3">
                      {formatDate(idea.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/portal/ideas/${idea.id}`}
                      className="font-mono text-[11px] text-ink-3 hover:text-accent transition-colors uppercase tracking-wider"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
