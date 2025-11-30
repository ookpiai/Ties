// TIES Together - Stripe Webhook Handler
// Handles Stripe events for account updates, payment status, etc.

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeKey || !webhookSecret) {
      throw new Error('Stripe environment variables not configured')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // Get the signature from headers
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing stripe-signature header' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get raw body for signature verification
    const body = await req.text()

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(
        JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log(`Received Stripe event: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      // =====================================================
      // CONNECT ACCOUNT EVENTS
      // =====================================================
      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        console.log(`Account updated: ${account.id}`)

        // Update account status in database
        const { error } = await supabase
          .from('stripe_accounts')
          .update({
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
            onboarding_completed: account.charges_enabled && account.payouts_enabled && account.details_submitted,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_account_id', account.id)

        if (error) {
          console.error('Failed to update account:', error)
        }
        break
      }

      // =====================================================
      // PAYMENT INTENT EVENTS
      // =====================================================
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`Payment succeeded: ${paymentIntent.id}`)

        const bookingId = paymentIntent.metadata?.booking_id
        if (bookingId) {
          await supabase
            .from('bookings')
            .update({
              payment_status: 'succeeded',
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId)

          // Update payment record if exists
          await supabase
            .from('payments')
            .update({
              status: 'succeeded',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntent.id)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`Payment failed: ${paymentIntent.id}`)

        const bookingId = paymentIntent.metadata?.booking_id
        if (bookingId) {
          await supabase
            .from('bookings')
            .update({
              payment_status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId)

          await supabase
            .from('payments')
            .update({
              status: 'failed',
              failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntent.id)
        }
        break
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log(`Payment canceled: ${paymentIntent.id}`)

        const bookingId = paymentIntent.metadata?.booking_id
        if (bookingId) {
          await supabase
            .from('bookings')
            .update({
              payment_status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', bookingId)

          await supabase
            .from('payments')
            .update({
              status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntent.id)
        }
        break
      }

      // =====================================================
      // CHARGE EVENTS
      // =====================================================
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        console.log(`Charge refunded: ${charge.id}`)

        // Update payment status
        await supabase
          .from('payments')
          .update({
            status: 'refunded',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_charge_id', charge.id)

        // Update invoice status
        const { data: payment } = await supabase
          .from('payments')
          .select('invoice_id')
          .eq('stripe_charge_id', charge.id)
          .single()

        if (payment?.invoice_id) {
          await supabase
            .from('invoices')
            .update({
              status: 'refunded',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.invoice_id)
        }
        break
      }

      // =====================================================
      // TRANSFER EVENTS
      // =====================================================
      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        console.log(`Transfer created: ${transfer.id}`)

        // Update payment with transfer info
        if (transfer.metadata?.payment_intent_id) {
          await supabase
            .from('payments')
            .update({
              stripe_transfer_id: transfer.id,
              transferred_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', transfer.metadata.payment_intent_id)
        }
        break
      }

      case 'transfer.reversed': {
        const transfer = event.data.object as Stripe.Transfer
        console.log(`Transfer reversed: ${transfer.id}`)

        // Log for admin review - transfers shouldn't normally be reversed
        console.warn(`WARNING: Transfer ${transfer.id} was reversed`)
        break
      }

      // =====================================================
      // PAYOUT EVENTS
      // =====================================================
      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout
        console.log(`Payout paid: ${payout.id}`)

        await supabase
          .from('payouts')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payout_id', payout.id)
        break
      }

      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout
        console.log(`Payout failed: ${payout.id}`)

        await supabase
          .from('payouts')
          .update({
            status: 'failed',
            failure_reason: payout.failure_message || 'Payout failed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payout_id', payout.id)
        break
      }

      // =====================================================
      // DEFAULT
      // =====================================================
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    // Return success response
    return new Response(
      JSON.stringify({ received: true, type: event.type }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Webhook handler error:', error)

    return new Response(
      JSON.stringify({ error: error.message || 'Webhook handler failed' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/* To configure webhook in Stripe Dashboard:

  1. Go to Developers > Webhooks
  2. Add endpoint: https://YOUR_PROJECT.supabase.co/functions/v1/handle-stripe-webhook
  3. Select events to listen to:
     - account.updated
     - payment_intent.succeeded
     - payment_intent.payment_failed
     - payment_intent.canceled
     - charge.refunded
     - transfer.created
     - transfer.reversed
     - payout.paid
     - payout.failed
  4. Copy webhook signing secret and add to Supabase secrets:
     supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx

*/
