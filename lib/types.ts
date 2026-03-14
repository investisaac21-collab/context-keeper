export interface Project {
  id: string
  user_id: string
  name: string
  tag: string | null
  context: string
  copies: number
  created_at: string
  updated_at: string
}