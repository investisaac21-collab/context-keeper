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
      return NextResponse.json({ error: 'C\u00f3digo requerido' }, { status: 400 })
    }

    const upperCode = code.trim().toUpperCase()

    // Validate promo code
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', upperCode)
      .single()

    if (promoError || !promo) {
      return NextResponse.json({ error: 'C\u00f3digo no v\u00e1lido' }, { status: 400 })
    }

    if (promo.used_count >= promo.max_uses) {
      return NextResponse.json({ error: 'C\u00f3digo agotado' }, { status: 400 })
    }

    if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
      return NextResponse.json({ error: 'C\u00f3digo expirado' }, { status: 400 })
    }

    // Check if user already used this code
    const { data: existingRedemption } = await supabase
      .from('promo_redemptions')
      .select('id')
      .eq('user_id', user.id)
      .eq('code', upperCode)
      .single()

    if (existingRedemption) {
      return NextResponse.json({ error: 'Ya usaste este c\u00f3digo' }, { status: 400 })
    }

    // Apply the plan upgrade
    const targetPlan = promo.plan || 'pro'

    // Upsert subscription
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

    // Increment usage count
    await supabase
      .from('promo_codes')
      .update({ used_count: promo.used_count + 1 })
      .eq('code', upperCode)

    // Record redemption (ignore error if table doesn't exist)
    await supabase
      .from('promo_redemptions')
      .insert({ user_id: user.id, code: upperCode, plan: targetPlan })
      .then(() => {})

    return NextResponse.json({ 
      success: true, 
      plan: targetPlan,
      message: '\u00a1Plan activado! Ahora tienes acceso ' + targetPlan.charAt(0).toUpperCase() + targetPlan.slice(1)
    })

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
