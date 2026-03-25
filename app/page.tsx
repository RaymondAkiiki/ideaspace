import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import type { Idea } from '@/types'
import DisclaimerBar from '@/components/DisclaimerBar'
import PublicNav from '@/components/PublicNav'

export const metadata: Metadata = {
  title: 'Ideaspace',
  description: 'A journal of unfinished thoughts and half-baked ideas.',
}

export const revalidate = 60

async function getPublishedIdeas(): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('ideas')
    .select('id, title, body_explanation, cover_image_url, slug, created_at, status')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(error)
    return []
  }
  return data as Idea[]
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function HomePage() {
  const ideas = await getPublishedIdeas()

  return (
    <>
      <DisclaimerBar />
      <div className="pt-8">
        <PublicNav />
        <main className="max-w-4xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="mb-16 max-w-xl">
            <h1 className="font-serif text-4xl md:text-5xl text-ink font-medium leading-tight mb-4">
              Ideas worth<br />thinking about.
            </h1>
            <p className="text-ink-3 text-sm font-mono tracking-wide">
              Unpolished, unfinished, unafraid.
            </p>
          </div>

          {ideas.length === 0 ? (
            <div className="text-center py-24 border border-border rounded-xl">
              <p className="font-mono text-xs text-ink-3 uppercase tracking-widest">
                Nothing published yet
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ideas.map((idea) => (
                <Link
                  key={idea.id}
                  href={`/ideas/${idea.slug}`}
                  className="group block border border-border rounded-xl overflow-hidden hover:border-accent/40 transition-all duration-200 hover:shadow-sm"
                >
                  {/* Cover image */}
                  <div className="aspect-[16/9] bg-surface-3 overflow-hidden">
                    {idea.cover_image_url ? (
                      <Image
                        src={idea.cover_image_url}
                        alt={idea.title ?? 'Idea cover'}
                        width={800}
                        height={450}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="font-mono text-xs text-ink-3 uppercase tracking-widest">
                          No cover
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card body */}
                  <div className="p-6">
                    <time className="font-mono text-[11px] text-ink-3 tracking-wider uppercase mb-3 block">
                      {formatDate(idea.created_at)}
                    </time>
                    <h2 className="font-serif text-xl text-ink font-medium leading-snug mb-3 group-hover:text-accent transition-colors">
                      {idea.title}
                    </h2>
                    {idea.body_explanation && (
                      <p className="text-sm text-ink-3 line-clamp-2 leading-relaxed">
                        {idea.body_explanation.slice(0, 160)}…
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>

        <footer className="border-t border-border mt-24 py-10 text-center">
          <p className="font-mono text-xs text-ink-3 tracking-wide">
            These are personal thoughts — not advice.{' '}
            <Link href="/login" className="hover:text-ink transition-colors">
              ·
            </Link>
          </p>
        </footer>
      </div>
    </>
  )
}
