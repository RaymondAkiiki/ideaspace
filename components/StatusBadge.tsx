import type { IdeaStatus } from '@/types'

const config: Record<IdeaStatus, { label: string; classes: string }> = {
  draft: {
    label: 'Draft',
    classes: 'bg-surface-3 text-ink-3 border border-border',
  },
  processed: {
    label: 'Processed',
    classes: 'bg-accent-light text-accent-dark border border-accent/30',
  },
  published: {
    label: 'Published',
    classes: 'bg-ink text-surface border border-ink',
  },
}

export default function StatusBadge({ status }: { status: IdeaStatus }) {
  const { label, classes } = config[status]
  return (
    <span className={`inline-block font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 rounded ${classes}`}>
      {label}
    </span>
  )
}
