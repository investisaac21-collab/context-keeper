'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-50 flex">

      {/* Left Ã¢ÂÂ branding (solo desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-white border-r border-gray-100 p-12">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">Context Keeper</span>
        </div>

        {/* Copy central */}
        <div>
          <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
            <span className="text-violet-600 text-sm font-medium">Potenciado con IA</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            Nunca vuelvas a<br />
            <span className="text-violet-600">reescribir el mismo prompt</span>
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed max-w-sm mb-10">
            Organiza tus mejores prompts para ChatGPT, Claude y Gemini. Variables dinÃÂ¡micas, IA integrada y un click para copiar.
          </p>

          <div className="space-y-5">
            {[
              {
                icon: (
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Prompts siempre a mano',
                desc: 'Guarda y organiza sin lÃÂ­mite. Nunca pierdas un buen prompt.'
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                ),
                title: 'Variables que se adaptan solas',
                desc: 'Cambia el tema, el tono o el nombre en segundos.'
              },
              {
                icon: (
                  <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: 'De prompt a ChatGPT en un click',
                desc: 'Sin copiar, sin pegar, sin perder tiempo.'
              },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 bg-violet-50 border border-violet-100 rounded-xl flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{f.title}</p>
                  <p className="text-gray-400 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-300 text-xs">&copy; 2026 Context Keeper</p>
      </div>

      {/* Right Ã¢ÂÂ formulario */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-8 lg:hidden">
            <div className="w-14 h-14 bg-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-violet-200">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Context Keeper</h1>
            <p className="text-gray-400 text-sm mt-1">Tus prompts, siempre listos</p>
          </div>

          {/* Card */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Bienvenido</h2>
              <p className="text-gray-400 text-sm">Accede a tus proyectos en segundos</p>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3.5 px-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-150 hover:shadow-sm text-sm"
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { num: '100%', label: 'Gratis para empezar' },
                  { num: '1-click', label: 'Copia instantÃÂ¡nea' },
                  { num: 'IA', label: 'GeneraciÃÂ³n automÃÂ¡tica' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="font-bold text-gray-900 text-base">{s.num}</div>
                    <div className="text-gray-400 text-xs leading-tight mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-gray-400 text-xs mt-5">
            Al continuar aceptas nuestros{' '}
            <Link href="/terms" className="underline hover:text-gray-600">TÃÂ©rminos</Link>
            {' '}y{' '}
            <Link href="/privacy" className="underline hover:text-gray-600">Privacidad</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
