// TIES Together - Capture Payment Edge Function
// Captures authorized payment when booking is completed

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
    const { paymentIntentId, bookingId } = await req.json()

    // Validation
    if (!paymentIntentId || !bookingId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: paymentIntentId, bookingId' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Retrieve the payment intent to verify it's capturable
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status !== 'requires_capture') {
      return new Response(
        JSON.stringify({
          error: `Payment cannot be captured. Status: ${paymentIntent.status}`
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, freelancer:profiles!bookings_freelancer_id_fkey(id, email)')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      throw new Error('Booking not found')
    }

    // Get freelancer's Stripe Connect account
    const { data: stripeAccount } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id')
      .eq('user_id', booking.freelancer_id)
      .single()

    // Capture the payment
    const capturedPayment = await stripe.paymentIntents.capture(paymentIntentId)

    console.log(`Payment captured: ${capturedPayment.id} for booking ${bookingId}`)

    // Calculate amounts
    const totalAmount = capturedPayment.amount // in cents
    const platformFee = Math.round(totalAmount * PLATFORM_FEE_PERCENT)
    const freelancerAmount = totalAmount - platformFee

    // If freelancer has Stripe Connect, create transfer
    let transferId = null
    if (stripeAccount?.stripe_account_id) {
      try {
        const transfer = await stripe.transfers.create({
          amount: freelancerAmount,
          currency: capturedPayment.currency,
          destination: stripeAccount.stripe_account_id,
          transfer_group: `booking_${bookingId}`,
          metadata: {
            booking_id: bookingId,
            payment_intent_id: paymentIntentId,
          },
        })
        transferId = transfer.id
        console.log(`Transfer created: ${transfer.id} to ${stripeAccount.stripe_account_id}`)
      } catch (transferError) {
        console.error('Transfer failed:', transferError)
        // Don't fail the whole operation - payment is captured
        // Admin can manually transfer later
      }
    }

    // Generate invoice number
    const { data: invoiceNumber } = await supabase.rpc('generate_invoice_number')

    // Create invoice record
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        booking_id: bookingId,
        invoice_number: invoiceNumber || `INV-${Date.now()}`,
        client_id: booking.client_id,
        freelancer_id: booking.freelancer_id,
        subtotal: totalAmount,
        platform_fee: platformFee,
        total_amount: totalAmount,
        freelancer_payout: freelancerAmount,
        currency: capturedPayment.currency,
        status: 'paid',
        paid_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (invoiceError) {
      console.error('Failed to create invoice:', invoiceError)
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoice?.id,
        booking_id: bookingId,
        stripe_payment_intent_id: paymentIntentId,
        stripe_charge_id: capturedPayment.latest_charge,
        stripe_transfer_id: transferId,
        payer_id: booking.client_id,
        recipient_id: booking.freelancer_id,
        amount: totalAmount,
        platform_fee: platformFee,
        recipient_amount: freelancerAmount,
        status: 'succeeded',
        captured_at: new Date().toISOString(),
        transferred_at: transferId ? new Date().toISOString() : null,
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Failed to create payment record:', paymentError)
    }

    // Update booking with payment info
    await supabase
      .from('bookings')
      .update({
        payment_status: 'captured',
        payment_captured_at: new Date().toISOString(),
        invoice_id: invoice?.id,
      })
      .eq('id', bookingId)

    return new Response(
      JSON.stringify({
        success: true,
        paymentIntentId: capturedPayment.id,
        chargeId: capturedPayment.latest_charge,
        transferId: transferId,
        invoiceId: invoice?.id,
        invoiceNumber: invoice?.invoice_number,
        amount: totalAmount,
        platformFee: platformFee,
        freelancerAmount: freelancerAmount,
        currency: capturedPayment.currency,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Capture payment failed:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to capture payment'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/* To invoke:

  curl -i --location --request POST 'https://YOUR_PROJECT.supabase.co/functions/v1/capture-payment' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"paymentIntentId":"pi_xxx","bookingId":"xxx"}'

*/
