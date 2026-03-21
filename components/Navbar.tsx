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

  const planBadge: Record<string, string> = {
    free: 'bg-zinc-800 text-zinc-400 border border-zinc-700',
    pro: 'bg-violet-900/50 text-violet-300 border border-violet-700',
    team: 'bg-blue-900/50 text-blue-300 border border-blue-700',
  }

  const planLabel: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    team: 'Team',
  }

  return (
    <nav className="bg-zinc-950 border-b border-zinc-800 px-6 py-3 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">CK</span>
          </div>
          <span className="font-semibold text-white text-sm group-hover:text-violet-300 transition-colors">Context Keeper</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/lab" className="text-zinc-400 hover:text-violet-300 text-sm transition-colors hidden sm:block">
            Keeper Lab
          </Link>
          <Link href="/profiles" className="text-zinc-400 hover:text-violet-300 text-sm transition-colors hidden sm:block">
            Perfiles
          </Link>

          <span className={"text-xs px-2 py-1 rounded-full font-medium " + (planBadge[plan] || planBadge.free)}>
            {planLabel[plan] || 'Free'}
          </span>

          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 bg-violet-600 hover:bg-violet-500 rounded-full flex items-center justify-center text-white font-semibold text-sm transition-colors"
            >
              {initials}
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-10 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl w-48 py-2 z-50">
                <div className="px-3 py-2 border-b border-zinc-700">
                  <p className="text-xs text-zinc-400 truncate">{userEmail}</p>
                </div>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profiles"
                  className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Keeper Profiles
                </Link>
                <Link
                  href="/lab"
                  className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Keeper Lab
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors"
                >
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