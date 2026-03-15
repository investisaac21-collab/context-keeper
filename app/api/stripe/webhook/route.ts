import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const stripeKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' })

  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Webhook verification failed: ' + message }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const userId = session.metadata?.userId
        const subscriptionId = session.subscription

        if (!userId || !subscriptionId) break

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price?.id

        // Determinar plan según priceId
        let planName = 'pro'
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM) {
          planName = 'team'
        }

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          plan: planName,
          status: 'active',
          stripe_subscription_id: subscriptionId,
          stripe_customer_id: session.customer,
          current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
        }, { onConflict: 'user_id' })

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        const customerId = subscription.customer

        // Buscar usuario por customer_id
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!sub?.user_id) break

        const priceId = subscription.items.data[0]?.price?.id
        let planName = 'pro'
        if (priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_TEAM) planName = 'team'

        await supabase.from('subscriptions').upsert({
          user_id: sub.user_id,
          plan: planName,
          status: subscription.status,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }, { onConflict: 'user_id' })

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any
        const customerId = subscription.customer

        const { data: sub } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (!sub?.user_id) break

        await supabase.from('subscriptions').upsert({
          user_id: sub.user_id,
          plan: 'free',
          status: 'cancelled',
          stripe_subscription_id: null,
          current_period_end: null,
        }, { onConflict: 'user_id' })

        break
      }

      default:
        // Evento no manejado, ignorar
        break
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook handler error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
