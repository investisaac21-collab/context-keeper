'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push('/dashboard')
    })
  }, [supabase, router])

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    })
  }

  return (
    <div className="min-h-screen flex" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'}}>
      
      {/* Left side - branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl">Context Keeper</span>
        </div>

        <div>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-4 py-1.5 mb-6">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
              <span className="text-indigo-300 text-sm font-medium">Poteniciado con IA</span>
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
              Tus prompts.<br />
              <span className="text-transparent bg-clip-text" style={{backgroundImage: 'linear-gradient(90deg, #818cf8, #c084fc)'}}>
                Siempre listos.
              </span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              Crea, organiza y reutiliza tus mejores prompts de IA con variables din&aacute;micas. 
              Copia con un click y pega en ChatGPT, Claude o cualquier IA.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: '&#128196;', title: 'Prompts organizados', desc: 'Guarda todos tus prompts en un solo lugar' },
              { icon: '&#9889;', title: 'Variables dinámicas', desc: 'Usa {{nombre}} para personalizar instantáneamente' },
              { icon: '&#129504;', title: 'Genera con IA', desc: 'Describe lo que necesitas y la IA lo crea por ti' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                  dangerouslySetInnerHTML={{__html: f.icon}} />
                <div>
                  <div className="text-white font-medium text-sm">{f.title}</div>
                  <div className="text-slate-400 text-sm">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-sm">&copy; 2025 Context Keeper &mdash; Construido para builders</p>
      </div>

      {/* Right side - login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          
          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Context Keeper</h1>
            <p className="text-slate-400 text-sm mt-1">Tus prompts, siempre listos</p>
          </div>

          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Bienvenido</h2>
              <p className="text-slate-400">Inicia sesi&oacute;n para acceder a tus proyectos</p>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-2xl transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-base"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { num: '100%', label: 'Gratis para empezar' },
                  { num: '1-click', label: 'Copia instantánea' },
                  { num: 'IA', label: 'Generación automática' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-white font-bold text-lg">{s.num}</div>
                    <div className="text-slate-500 text-xs leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            Al continuar aceptas nuestros T&eacute;rminos de Servicio y Pol&iacute;tica de Privacidad
          </p>
        </div>
      </div>
    </div>
  )
}
