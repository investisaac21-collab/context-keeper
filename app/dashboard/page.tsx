import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import ProjectsClient from '@/components/ProjectsClient'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()

  const [{ data: projects }, { data: variables }] = await Promise.all([
    supabase.from('projects').select('*').order('updated_at', { ascending: false }),
    supabase.from('user_variables').select('*').order('created_at', { ascending: true })
  ])

  return (
    <ProjectsClient
      initialProjects={projects || []}
      initialVariables={variables || []}
      userId={session!.user.id}
    />
  )
}