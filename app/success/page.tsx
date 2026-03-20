'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Navbar from '@/components/Navbar'

// Confetti sencillo sin dependencias externas
function useConfetti(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pieces: Array<{
      x: number; y: number; w: number; h: number;
      color: string; speed: number; angle: number; rotation: number; rotSpeed: number;
    }> = []

    const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#f97316']
    for (let i = 0; i < 140; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        w: 8 + Math.random() * 8,
        h: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: 2 + Math.random() * 4,
        angle: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
      })
    }

    let frame = 0
    let animId: number

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach(p => {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rotation)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()
        p.y += p.speed
        p.x += Math.sin(p.angle + frame * 0.02) * 1.2
        p.rotation += p.rotSpeed
        if (p.y > canvas.height + 20) {
          p.y = -20
          p.x = Math.random() * canvas.width
        }
      })
      frame++
      if (frame < 300) {
        animId = requestAnimationFrame(draw)
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    draw()
    return () => cancelAnimationFrame(animId)
  }, [active])

  return canvasRef
}

export default function SuccessPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [plan, setPlan] = useState('pro')
  const [email, setEmail] = useState('')
  const [confettiActive, setConfettiActive] = useState(false)
  const canvasRef = useConfetti(confettiActive)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setEmail(user.email || '')
      supabase.from('subscriptions').select('plan').eq('user_id', user.id).single().then(({ data: sub }) => {
        if (sub?.plan) setPlan(sub.plan)
        setTimeout(() => setConfettiActive(true), 300)
      })
    })
  }, [])

  const planLabel = plan === 'team' ? 'Team' : 'Pro'
  const planColor = plan === 'team' ? 'from-purple-600 to-pink-600' : 'from-indigo-600 to-purple-600'

  const proFeatures = [
    { icon: '&#128218;', text: 'Historial de versiones con rollback' },
    { icon: '&#129302;', text: 'Generación y refinamiento de prompts con IA' },
    { icon: '&#9889;', text: 'Proyectos ilimitados' },
    { icon: '&#127760;', text: 'Variables globales guardadas' },
  ]

  const teamFeatures = [
    ...proFeatures,
    { icon: '&#128101;', text: 'Hasta 5 miembros en tu equipo' },
    { icon: '&#128203;', text: 'Prompts compartidos entre miembros' },
    { icon: '&#128736;', text: 'Panel de administrador y permisos por rol' },
  ]

  const features = plan === 'team' ? teamFeatures : proFeatures

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: '100vw', height: '100vh' }}
      />
      <Navbar userEmail={email} plan={plan} />

      <main className="max-w-lg mx-auto px-4 py-16 text-center">
        {/* Badge animado */}
        <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${planColor} text-white text-sm font-semibold px-5 py-2 rounded-full shadow-lg mb-6`}>
          <span>&#10023;</span>
          Plan {planLabel} activado
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          ¡Bienvenido a {planLabel}!
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Tu cuenta ya está activa. Ahora tienes acceso a todo el potencial de Context Keeper.
        </p>

        {/* Features desbloqueadas */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 text-left">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
            Ahora tienes acceso a
          </p>
          <ul className="space-y-3">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-sm shrink-0"
                  dangerouslySetInnerHTML={{ __html: f.icon }}
                />
                <span className="text-sm text-gray-700 font-medium">{f.text}</span>
                <span className="ml-auto text-green-500 text-sm font-bold">&#10003;</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTAs */}
        <div className="flex flex-col gap-3">
          <a
            href="/dashboard"
            className={`w-full py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r ${planColor} hover:opacity-90 transition shadow-md`}
          >
            Ir a mi dashboard &#8594;
          </a>
          <a
            href="/account"
            className="w-full py-3 rounded-xl font-medium text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Ver mi cuenta
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-6">
          Recibirás un email de confirmación en {email || 'tu correo'}.{' '}
          <a href="/account" className="underline hover:text-gray-600">Gestionar suscripción</a>
        </p>
      </main>
    </div>
  )
}
