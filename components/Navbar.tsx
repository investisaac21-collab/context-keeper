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

  const planColors: Record<string, string> = {
    free: 'bg-gray-100 text-gray-500',
    pro: 'bg-violet-100 text-violet-700',
    team: 'bg-blue-100 text-blue-700',
  }

  const planLabel: Record<string, string> = {
    free: 'Free',
    pro: 'Pro',
    team: 'Team',
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900">Context Keeper</span>
        </Link>

        <div className="flex items-center gap-3">
          {plan !== 'free' && (
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${planColors[plan]}`}>
              {planLabel[plan]}
            </span>
          )}
          {plan === 'free' && (
            <Link
              href="/pricing"
              className="text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white px-3 py-1.5 rounded-full transition-colors"
            >
              Hazte Pro — 9 €/mes
            </Link>
          )}

          {userEmail && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {initials}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${planColors[plan]}`}>
                      Plan {planLabel[plan]}
                    </span>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Mi cuenta
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Planes y precios
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
