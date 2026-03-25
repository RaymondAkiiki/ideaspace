export type IdeaStatus = 'draft' | 'processed' | 'published'

export interface Idea {
  id: string
  title: string | null
  draft_content: string
  body_explanation: string | null
  body_solution: string | null
  body_conclusion: string | null
  cover_image_url: string | null
  status: IdeaStatus
  slug: string | null
  created_at: string
  updated_at: string
}

export interface IdeaCreateInput {
  draft_content: string
}

export interface IdeaUpdateInput {
  title?: string
  draft_content?: string
  body_explanation?: string
  body_solution?: string
  body_conclusion?: string
  status?: IdeaStatus
}

export interface AIProcessedOutput {
  title: string
  explanation: string
  solution: string
  conclusion: string
}
