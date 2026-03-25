import slugify from 'slugify'

export function generateSlug(title: string, id: string): string {
  const base = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  })
  // Append first 8 chars of UUID to guarantee uniqueness
  const suffix = id.replace(/-/g, '').slice(0, 8)
  return `${base}-${suffix}`
}
