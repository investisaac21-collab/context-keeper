import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      if (userId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0]?.price.id
        const plan = priceId === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO ? 'pro' : 'team'

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          plan,
          status: 'active',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        }, { onConflict: 'user_id' })
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ plan: 'free', status: 'cancelled' })
        .eq('stripe_subscription_id', subscription.id)
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription
      const status = subscription.status === 'active' ? 'active' : 'past_due'
      await supabase
        .from('subscriptions')
        .update({
          status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
    }
  } catch (err) {
    console.error('Webhook error:', err)
  }

  return NextResponse.json({ received: true })
}

export const config = { api: { bodyParser: false } }
