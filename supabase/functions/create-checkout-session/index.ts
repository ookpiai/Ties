// TIES Together - Create Checkout Session
// Creates Stripe Checkout for clients to pay for bookings

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Platform fee percentage (10%)
const PLATFORM_FEE_PERCENT = 0.10

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get environment variables
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

    // Parse request body
    const {
      bookingId,
      amount, // in dollars
      clientEmail,
      freelancerName,
      description,
      successUrl,
      cancelUrl,
    } = await req.json()

    // Validation
    if (!bookingId || !amount || !clientEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: bookingId, amount, clientEmail' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select(`
        *,
        freelancer:profiles!bookings_freelancer_id_fkey(id, display_name, email),
        client:profiles!bookings_client_id_fkey(id, display_name, email)
      `)
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      throw new Error('Booking not found')
    }

    // Check if booking already has a payment
    if (booking.payment_status === 'captured' || booking.payment_status === 'succeeded') {
      return new Response(
        JSON.stringify({ error: 'Booking has already been paid' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get freelancer's Stripe Connect account
    const { data: stripeAccount } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id, onboarding_completed')
      .eq('user_id', booking.freelancer_id)
      .single()

    if (!stripeAccount?.stripe_account_id || !stripeAccount.onboarding_completed) {
      return new Response(
        JSON.stringify({
          error: 'Freelancer has not completed payment setup. Please contact them to set up their payment account.'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Calculate amounts
    const amountInCents = Math.round(amount * 100)
    const platformFee = Math.round(amountInCents * PLATFORM_FEE_PERCENT)

    // Determine origin for redirect URLs
    const origin = req.headers.get('origin') || 'http://localhost:5173'

    // Create Checkout Session with Stripe Connect
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: description || `Booking with ${freelancerName || booking.freelancer?.display_name}`,
              description: `Booking ID: ${bookingId}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: stripeAccount.stripe_account_id,
        },
        metadata: {
          booking_id: bookingId,
          client_id: booking.client_id,
          freelancer_id: booking.freelancer_id,
          platform_fee: platformFee.toString(),
        },
      },
      success_url: successUrl || `${origin}/bookings?payment=success&booking=${bookingId}`,
      cancel_url: cancelUrl || `${origin}/bookings?payment=cancelled&booking=${bookingId}`,
      metadata: {
        booking_id: bookingId,
        client_id: booking.client_id,
        freelancer_id: booking.freelancer_id,
      },
    })

    console.log(`Checkout session created: ${session.id} for booking ${bookingId}`)

    // Update booking with session ID
    await supabase
      .from('bookings')
      .update({
        stripe_payment_intent_id: session.payment_intent,
        payment_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
        paymentIntentId: session.payment_intent,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Create checkout session failed:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create checkout session'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/* To invoke:

  curl -i --location --request POST 'https://YOUR_PROJECT.supabase.co/functions/v1/create-checkout-session' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{
      "bookingId": "xxx",
      "amount": 500,
      "clientEmail": "client@example.com",
      "freelancerName": "John Doe",
      "description": "Wedding Photography"
    }'

*/
