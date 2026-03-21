'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface NavbarProps {
  userEmail?: string
  plan?: string
}

export default function Navbar({ userEmail, plan = 'free' }: NavbarProps) {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [initials, setInitials] = useState('?')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (userEmail) {
      setInitials(userEmail[0].toUpperCase())
    }
  }, [userEmail])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isPro = plan === 'pro' || plan === 'team'

  const planBadge: Record<string, string> = {
    free: 'bg-zinc-800/80 text-zinc-400 border border-zinc-700',
    pro: 'bg-violet-900/50 text-violet-300 border border-violet-700/60',
    team: 'bg-blue-900/50 text-blue-300 border border-blue-700/60',
  }

  const planLabel: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    team: 'Team',
  }

  return (
    <nav className="bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60 px-6 py-3 sticky top-0 z-40">
      {/* Top ambient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />

      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo — K mark */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 rounded-xl bg-violet-600/20 blur-md group-hover:bg-violet-500/30 transition-all duration-500" />
            <div className="relative w-8 h-8 bg-gradient-to-br from-violet-600 to-violet-700 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all duration-300">
              <span className="text-white font-bold text-sm tracking-tight">K</span>
            </div>
          </div>
          <span className="font-semibold text-white text-sm group-hover:text-violet-300 transition-colors duration-200">Keeper</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/lab" className="text-zinc-500 hover:text-zinc-200 text-sm transition-colors duration-200 hidden sm:block">
            Lab
          </Link>
          <Link href="/profiles" className="text-zinc-500 hover:text-zinc-200 text-sm transition-colors duration-200 hidden sm:block">
            Perfiles
          </Link>

          {/* Plan badge */}
          <span className={"text-xs px-2.5 py-1 rounded-full font-medium tracking-wide " + (planBadge[plan] || planBadge.free)}>
            {planLabel[plan] || 'Free'}
          </span>

          {/* UPGRADE BUTTON — only for free users */}
          {!isPro && (
            <Link
              href="/pricing"
              className="relative hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white overflow-hidden group/up transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%)',
                boxShadow: '0 0 16px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              {/* Shimmer */}
              <div className="absolute inset-0 opacity-0 group-hover/up:opacity-100 transition-opacity duration-500"
                style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)', backgroundSize: '200% 100%' }}
              />
              <svg className="w-3.5 h-3.5 relative z-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span className="relative z-10">Subir a Pro</span>
            </Link>
          )}

          {/* Avatar + menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 bg-violet-600 hover:bg-violet-500 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30"
            >
              {initials}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl shadow-2xl shadow-black/50 w-52 py-2 z-50">
                <div className="px-3 py-2.5 border-b border-zinc-800">
                  <p className="text-xs text-zinc-400 truncate">{userEmail}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">Plan: {planLabel[plan] || 'Free'}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors rounded-lg mx-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M3 12h18M3 17h18"/></svg>
                  Dashboard
                </Link>
                <Link
                  href="/profiles"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors rounded-lg mx-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  Keeper Profiles
                </Link>
                <Link
                  href="/lab"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-colors rounded-lg mx-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/></svg>
                  Keeper Lab
                </Link>
                {!isPro && (
                  <Link
                    href="/pricing"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors rounded-lg mx-1"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                    Subir a Pro — 9 &#x20AC;/mes
                  </Link>
                )}
                <div className="h-px bg-zinc-800 mx-3 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors rounded-lg mx-0"
                >
                  <svg className="w-3.5 h-3.5 ml-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                  Cerrar sesi&#xF3;n
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
