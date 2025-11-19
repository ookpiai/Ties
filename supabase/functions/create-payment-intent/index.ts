// TIES Together - Create Payment Intent Edge Function
// Handles Stripe payment creation for bookings

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get Stripe secret key from environment
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeKey) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Parse request body
    const { bookingId, amount, freelancerId, clientId, description } = await req.json()

    // Validation
    if (!bookingId || !amount || !freelancerId || !clientId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Calculate commission (10% platform fee)
    const platformFee = Math.round(amount * 0.10)
    const freelancerAmount = amount - platformFee

    // Create Payment Intent
    // We charge the full amount and hold it until booking completion
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'aud',
      description: description || `TIES Together Booking ${bookingId}`,
      metadata: {
        booking_id: bookingId,
        freelancer_id: freelancerId,
        client_id: clientId,
        platform_fee: platformFee.toString(),
        freelancer_amount: freelancerAmount.toString(),
      },
      // Manual capture - we'll capture after booking accepted
      capture_method: 'manual',
    })

    console.log(`Payment Intent created: ${paymentIntent.id} for booking ${bookingId}`)

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amount,
        platformFee: platformFee,
        freelancerAmount: freelancerAmount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Payment Intent creation failed:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create payment intent'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/* To invoke:

  curl -i --location --request POST 'https://YOUR_PROJECT.supabase.co/functions/v1/create-payment-intent' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"bookingId":"xxx","amount":100,"freelancerId":"xxx","clientId":"xxx","description":"Test booking"}'

*/
