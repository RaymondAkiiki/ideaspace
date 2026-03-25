import Link from 'next/link'

export default function PublicNav() {
  return (
    <nav className="border-b border-border bg-surface">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-xl text-ink font-medium tracking-tight hover:text-accent transition-colors"
        >
          Ideaspace
        </Link>
        <span className="font-mono text-xs text-ink-3 tracking-wider uppercase">
          Thoughts in progress
        </span>
      </div>
    </nav>
  )
}
