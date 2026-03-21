import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProfilesClient from '@/components/ProfilesClient'

export default async function ProfilesPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profilesData } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  // Intentar cargar keeper_profiles (tabla puede no existir aun)
  let keeperProfiles: any[] = []
  try {
    const { data } = await supabase
      .from('keeper_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    keeperProfiles = data || []
  } catch(e) {
    keeperProfiles = []
  }

  return (
    <ProfilesClient
      userId={user.id}
      userEmail={user.email || ''}
      plan={profilesData?.plan || 'free'}
      initialProfiles={keeperProfiles}
    />
  )
}
