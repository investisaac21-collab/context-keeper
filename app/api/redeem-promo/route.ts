import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { code } = await req.json()
    if (!code) {
      return NextResponse.json({ error: 'Codigo requerido' }, { status: 400 })
    }

    const upperCode = code.trim().toUpperCase()

    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', upperCode)
      .single()

    if (promoError || !promo) {
      return NextResponse.json({ error: 'Codigo no valido' }, { status: 400 })
    }

    if (promo.used_count >= promo.max_uses) {
      return NextResponse.json({ error: 'Codigo agotado' }, { status: 400 })
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Codigo expirado' }, { status: 400 })
    }

    const targetPlan = promo.plan || 'pro'

    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert(
        { user_id: user.id, plan: targetPlan, promo_code: upperCode, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )

    if (subError) {
      console.error('Subscription error:', subError)
      return NextResponse.json({ error: 'Error al aplicar el plan' }, { status: 500 })
    }

    await supabase
      .from('promo_codes')
      .update({ used_count: (promo.used_count || 0) + 1 })
      .eq('code', upperCode)

    return NextResponse.json({ 
      success: true, 
      plan: targetPlan,
      message: 'Plan activado correctamente'
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}