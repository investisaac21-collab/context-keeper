import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AccountPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const plan = sub?.plan || 'free'
  const status = sub?.status || 'active'
  const periodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
    : null

  const planLabels: Record<string, string> = { free: 'Gratuito', pro: 'Pro', team: 'Team' }
  const planColors: Record<string, string> = { free: 'bg-gray-100 text-gray-700', pro: 'bg-indigo-100 text-indigo-700', team: 'bg-purple-100 text-purple-700' }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900">Context Keeper</span>
          </Link>
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">Ir al dashboard</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi cuenta</h1>

        {/* USER INFO */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Perfil</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.email}</p>
              <p className="text-sm text-gray-400">Miembro desde {new Date(user.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
        </div>

        {/* SUBSCRIPTION */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Suscripcion</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${planColors[plan]}`}>
                  Plan {planLabels[plan]}
                </span>
                {status === 'active' && plan !== 'free' && (
                  <span className="text-xs text-green-600 font-medium">Activo</span>
                )}
                {status === 'past_due' && (
                  <span className="text-xs text-red-600 font-medium">Pago pendiente</span>
                )}
              </div>
              {periodEnd && (
                <p className="text-sm text-gray-500">Proxima renovacion: {periodEnd}</p>
              )}
              {plan === 'free' && (
                <p className="text-sm text-gray-500">Sin fecha de renovacion</p>
              )}
            </div>
          </div>

          {plan === 'free' ? (
            <Link href="/pricing" className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
              Mejorar a Pro →
            </Link>
          ) : (
            <p className="text-sm text-gray-400">Para cancelar tu suscripcion, contacta con soporte.</p>
          )}
        </div>

        {/* BACK */}
        <div className="text-center">
          <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline">
            ← Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
