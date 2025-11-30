// TIES Together - Create Stripe Connect Account
// Handles onboarding freelancers/vendors/venues to receive payments

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const { userId, email, country, returnUrl, refreshUrl } = await req.json()

    // Validation
    if (!userId || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, email' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Check if user already has a Stripe account
    const { data: existingAccount } = await supabase
      .from('stripe_accounts')
      .select('stripe_account_id, onboarding_completed')
      .eq('user_id', userId)
      .single()

    if (existingAccount?.stripe_account_id) {
      // Account exists - create new onboarding link if not completed
      if (!existingAccount.onboarding_completed) {
        const accountLink = await stripe.accountLinks.create({
          account: existingAccount.stripe_account_id,
          refresh_url: refreshUrl || `${req.headers.get('origin')}/settings?stripe=refresh`,
          return_url: returnUrl || `${req.headers.get('origin')}/settings?stripe=success`,
          type: 'account_onboarding',
        })

        return new Response(
          JSON.stringify({
            accountId: existingAccount.stripe_account_id,
            onboardingUrl: accountLink.url,
            isExisting: true,
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        )
      }

      // Already completed onboarding
      return new Response(
        JSON.stringify({
          accountId: existingAccount.stripe_account_id,
          onboardingCompleted: true,
          isExisting: true,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create new Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: country || 'AU',
      email: email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        ties_user_id: userId,
      },
    })

    console.log(`Stripe Connect account created: ${account.id} for user ${userId}`)

    // Save account to database
    const { error: insertError } = await supabase
      .from('stripe_accounts')
      .insert({
        user_id: userId,
        stripe_account_id: account.id,
        account_type: 'express',
        country: country || 'AU',
        currency: country === 'US' ? 'usd' : 'aud',
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
        onboarding_completed: false,
      })

    if (insertError) {
      console.error('Failed to save Stripe account:', insertError)
      // Don't throw - account is created in Stripe, we can sync later
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: refreshUrl || `${req.headers.get('origin')}/settings?stripe=refresh`,
      return_url: returnUrl || `${req.headers.get('origin')}/settings?stripe=success`,
      type: 'account_onboarding',
    })

    return new Response(
      JSON.stringify({
        accountId: account.id,
        onboardingUrl: accountLink.url,
        isExisting: false,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Create Connect Account failed:', error)

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to create Stripe Connect account'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

/* To invoke:

  curl -i --location --request POST 'https://YOUR_PROJECT.supabase.co/functions/v1/create-connect-account' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"userId":"xxx","email":"test@example.com","country":"AU"}'

*/
