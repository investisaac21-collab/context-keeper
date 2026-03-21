import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default async function AccountPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const { data: projects } = await supabase
    .from('projects')
    .select('id')
    .eq('user_id', user.id)

  const { data: variables } = await supabase
    .from('user_variables')
    .select('id')
    .eq('user_id', user.id)

  const plan = sub?.plan || 'free'
  const isPro = plan === 'pro' || plan === 'team'
  const status = sub?.status || 'active'
  const projectCount = projects?.length || 0
  const variableCount = variables?.length || 0

  const periodEnd = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'long', year: 'numeric'
      })
    : null

  const planLabels: Record<string, string> = { free: 'Free', pro: 'Pro', team: 'Team' }
  const planColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-700',
    pro: 'bg-violet-100 text-violet-700',
    team: 'bg-purple-100 text-purple-700',
  }
  const FREE_LIMIT = 3

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userEmail={user.email} plan={plan} />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mi cuenta</h1>

        {/* PERFIL */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Perfil</h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.email}</p>
              <p className="text-sm text-gray-400">
                Miembro desde{' '}
                {new Date(user.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* USO */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Uso actual</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-700">Proyectos</span>
                <span className="text-sm font-medium text-gray-900">
                  {projectCount} {isPro ? '' : `/ ${FREE_LIMIT}`}
                  {isPro && <span className="text-xs text-violet-500 ml-1">ilimitados</span>}
                </span>
              </div>
              {!isPro && (
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      projectCount >= FREE_LIMIT ? 'bg-red-500' : 'bg-violet-500'
                    }`}
                    style={{ width: Math.min((projectCount / FREE_LIMIT) * 100, 100) + '%' }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Variables guardadas</span>
              <span className="text-sm font-medium text-gray-900">{variableCount}</span>
            </div>
          </div>
        </div>

        {/* SUSCRIPCIÃÃÂÂÃÂN */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">SuscripciÃÃÂÂÃÂ³n</h2>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${planColors[plan]}`}>
                  Plan {planLabels[plan]}
                </span>
                {status === 'active' && plan !== 'free' && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">
                    Activo
                  </span>
                )}
                {status === 'past_due' && (
                  <span className="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                    Pago pendiente
                  </span>
                )}
              </div>
              {periodEnd && (
                <p className="text-sm text-gray-500 mt-1">PrÃÃÂÂÃÂ³xima renovaciÃÃÂÂÃÂ³n: {periodEnd}</p>
              )}
              {plan === 'free' && (
                <p className="text-sm text-gray-400 mt-1">Sin suscripciÃÃÂÂÃÂ³n activa</p>
              )}
            </div>
          </div>

          {plan === 'free' ? (
            <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-violet-900">Desbloquea todo con Pro</p>
                <p className="text-xs text-violet-600 mt-0.5">
                  Proyectos ilimitados, historial de versiones y variables globales por solo 9 &#8364;/mes
                </p>
              </div>
              <Link
                href="/pricing"
                className="shrink-0 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Ver planes
              </Link>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Para cancelar o gestionar tu suscripciÃÃÂÂÃÂ³n, escrÃÃÂÂÃÂ­benos a{' '}
              <a href="mailto:hola@contextkeeper.app" className="text-violet-600 hover:underline">
                hola@contextkeeper.app
              </a>
            </p>
          )}
        </div>

        {/* VOLVER */}
        <div className="text-center">
          <Link href="/dashboard" className="text-sm text-violet-600 hover:underline">
            &#8592; Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
