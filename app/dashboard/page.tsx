import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Navbar from '@/components/Navbar'
import ProjectsClient from '@/components/ProjectsClient'

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: variables } = await supabase
    .from('user_variables')
    .select('*')
    .eq('user_id', user.id)

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  const plan = sub?.plan || 'free'

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} plan={plan} />
      <ProjectsClient
        initialProjects={projects || []}
        initialVariables={variables || []}
        userEmail={user.email || ''}
        userId={user.id}
        plan={plan}
      />
    </div>
  )
}
