import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Idea } from '@/types'
import DisclaimerBar from '@/components/DisclaimerBar'
import PublicNav from '@/components/PublicNav'

type Props = { params: { slug: string } }

export const revalidate = 60

async function getIdea(slug: string): Promise<Idea | null> {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) return null
  return data as Idea
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const idea = await getIdea(params.slug)
  if (!idea) return { title: 'Not Found' }

  return {
    title: idea.title ?? 'Idea',
    description: idea.body_explanation?.slice(0, 160),
    openGraph: {
      title: idea.title ?? 'Idea',
      description: idea.body_explanation?.slice(0, 160),
      images: idea.cover_image_url ? [{ url: idea.cover_image_url }] : [],
      type: 'article',
    },
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function Section({ label, content }: { label: string; content: string }) {
  const paragraphs = content.split('\n\n').filter(Boolean)
  return (
    <div className="mb-12">
      <p className="font-mono text-[11px] text-ink-3 tracking-widest uppercase mb-6 pb-3 border-b border-border">
        {label}
      </p>
      <div className="idea-prose">
        {paragraphs.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  )
}

export default async function IdeaDetailPage({ params }: Props) {
  const idea = await getIdea(params.slug)
  if (!idea) notFound()

  return (
    <>
      <DisclaimerBar />
      <div className="pt-8">
        <PublicNav />

        <main>
          {/* Cover hero */}
          {idea.cover_image_url && (
            <div className="w-full aspect-[21/9] max-h-[480px] overflow-hidden bg-surface-3">
              <Image
                src={idea.cover_image_url}
                alt={idea.title ?? 'Cover image'}
                width={1792}
                height={768}
                className="w-full h-full object-cover"
                priority
              />
            </div>
          )}

          <div className="max-w-2xl mx-auto px-6 py-16">
            {/* Meta */}
            <div className="mb-10">
              <time className="font-mono text-[11px] text-ink-3 tracking-widest uppercase block mb-4">
                {formatDate(idea.created_at)}
              </time>
              <h1 className="font-serif text-3xl md:text-4xl text-ink font-medium leading-tight">
                {idea.title}
              </h1>
            </div>

            {/* Body sections */}
            {idea.body_explanation && (
              <Section label="The Idea" content={idea.body_explanation} />
            )}
            {idea.body_solution && (
              <Section label="The Thinking" content={idea.body_solution} />
            )}
            {idea.body_conclusion && (
              <Section label="Where This Lands" content={idea.body_conclusion} />
            )}

            {/* Footer disclaimer */}
            <div className="mt-16 pt-8 border-t border-border">
              <p className="font-mono text-xs text-ink-3 leading-relaxed">
                This is a personal thought, not a finished idea or professional advice.
                It may be incomplete, wrong, or change over time.
              </p>
              <Link
                href="/"
                className="inline-block mt-6 font-mono text-xs text-ink-3 hover:text-accent transition-colors uppercase tracking-widest"
              >
                ← All ideas
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
