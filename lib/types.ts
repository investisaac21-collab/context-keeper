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

export interface ProjectVersion {
  id: string
  project_id: string
  user_id: string
  name: string
  tag: string | null
  context: string
  version_number: number
  created_at: string
}

export interface UserVariable {
  id: string
  user_id: string
  name: string
  default_value: string
  created_at: string
}