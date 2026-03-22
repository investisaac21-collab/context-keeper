import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ProfilesClient from '@/components/ProfilesClient'

export default async function ProfilesPage() {
  const supabase = createServerComponentClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Read plan from subscriptions (same source as dashboard)
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', user.id)
    .single()

  // Load keeper_profiles
  let keeperProfiles: any[] = []
  try {
    const { data } = await supabase
      .from('keeper_profiles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    keeperProfiles = data || []
  } catch(_e) {
    keeperProfiles = []
  }

  return (
    <ProfilesClient
      userId={user.id}
      userEmail={user.email || ''}
      plan={sub?.plan || 'free'}
      initialProfiles={keeperProfiles}
    />
  )
}