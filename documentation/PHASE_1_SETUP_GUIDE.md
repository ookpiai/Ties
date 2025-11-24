# Phase 1: Payment System - Setup Guide

**Date:** November 24, 2025
**Status:** Development In Progress - Week 1 Complete
**Next Steps:** Stripe Setup & Edge Functions

---

## 📊 WHAT'S BEEN COMPLETED (Today)

### ✅ Core Infrastructure Built:

1. **Stripe SDK Installed**
   - `stripe` - Server-side SDK
   - `@stripe/stripe-js` - Client-side SDK

2. **Database Schema Created**
   - `stripe_accounts` - Connect accounts for freelancers
   - `payment_methods` - Stored payment methods for clients
   - `invoices` - Automatically generated invoices
   - `payments` - Payment transaction tracking
   - `payouts` - Payout scheduling
   - `refunds` - Refund processing
   - `payment_settings` - User payment preferences
   - Updated `bookings` table with payment fields

3. **API Layer Complete**
   - `src/api/payments.ts` (480 lines)
     - Stripe Connect account creation
     - Payment method management
     - Payment intent creation/capture
     - Payment history tracking
   - `src/api/invoices.ts` (530 lines)
     - Automatic invoice generation
     - Invoice retrieval and tracking
     - Invoice status updates
     - Statistics and reporting

4. **Integration Complete**
   - `src/api/bookings.ts` updated
   - Automatic invoice generation on booking completion
   - Automatic payment capture (if authorized)
   - Seamless integration with existing booking flow

5. **Environment Configuration**
   - `.env.example` updated with Stripe keys

---

## 🚧 WHAT'S NEXT (Your Action Items)

### **Step 1: Create Stripe Account**

**Time Required:** 10 minutes

1. Go to: https://dashboard.stripe.com/register
2. Sign up with your email
3. Complete business verification (you can use test mode during development)
4. Verify your email address

---

### **Step 2: Get Stripe API Keys**

**Time Required:** 2 minutes

1. Go to: https://dashboard.stripe.com/apikeys
2. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"

3. Copy both keys

---

### **Step 3: Add Keys to Environment Variables**

**Time Required:** 1 minute

1. Copy `.env.example` to `.env` (if not already done):
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and add your Stripe keys:
   ```bash
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
   VITE_STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
   ```

3. **IMPORTANT:** Never commit `.env` to git! It's already in `.gitignore`.

---

### **Step 4: Run Database Migration**

**Time Required:** 2 minutes

1. Run the payment system migration:
   ```bash
   npx supabase db push
   ```

2. This will create all payment-related tables in your Supabase database

3. Verify migration succeeded:
   ```bash
   npx supabase db diff
   ```
   Should show "No changes detected"

---

### **Step 5: Create Supabase Edge Functions (Backend API)**

**Why Edge Functions?**
- Stripe secret keys must NEVER be exposed to client-side code
- Edge Functions run server-side and keep secrets secure
- They're like AWS Lambda but integrated with Supabase

**Time Required:** 30-45 minutes

#### **5A: Initialize Supabase Functions (if not already done)**

```bash
npx supabase functions new stripe-create-connect-account
npx supabase functions new stripe-add-payment-method
npx supabase functions new stripe-create-payment-intent
npx supabase functions new stripe-capture-payment
npx supabase functions new stripe-create-invoice
```

#### **5B: Implement Each Function**

I'll create template files for each function. Let me know when you're ready and I'll generate them.

**What each function does:**

1. **stripe-create-connect-account**
   - Creates Stripe Connect Express account
   - Generates onboarding link
   - Returns account ID and URL

2. **stripe-add-payment-method**
   - Attaches payment method to customer
   - Creates customer if doesn't exist
   - Returns payment method details

3. **stripe-create-payment-intent**
   - Creates PaymentIntent with destination charge
   - Authorizes payment (doesn't capture yet)
   - Returns client secret for frontend

4. **stripe-capture-payment**
   - Captures previously authorized payment
   - Transfers funds to connected account
   - Returns charge and transfer IDs

5. **stripe-create-invoice**
   - Creates Stripe Invoice
   - Sends PDF via email
   - Returns hosted invoice URL

---

### **Step 6: Deploy Edge Functions to Supabase**

**Time Required:** 5 minutes

```bash
npx supabase functions deploy stripe-create-connect-account
npx supabase functions deploy stripe-add-payment-method
npx supabase functions deploy stripe-create-payment-intent
npx supabase functions deploy stripe-capture-payment
npx supabase functions deploy stripe-create-invoice
```

---

### **Step 7: Update API Endpoints in Frontend**

**Time Required:** 5 minutes

In `src/api/payments.ts` and `src/api/invoices.ts`, update the Edge Function URLs:

Change:
```typescript
const response = await fetch('/api/stripe/create-connect-account', {
```

To:
```typescript
const response = await fetch(
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-create-connect-account`,
  {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json'
    },
```

This change needs to be made in 5 places:
1. `payments.ts` - createStripeConnectAccount
2. `payments.ts` - addPaymentMethod
3. `payments.ts` - createPaymentIntent
4. `payments.ts` - capturePayment
5. `invoices.ts` - createStripeInvoice

---

### **Step 8: Test Payment Flow**

**Time Required:** 15 minutes

1. **Test Stripe Connect Onboarding:**
   - Create a test freelancer account
   - Navigate to payment settings
   - Click "Connect Stripe Account"
   - Complete onboarding flow

2. **Test Payment Method:**
   - Create a test client account
   - Add payment method (use Stripe test cards)
   - Test card: `4242 4242 4242 4242`, any future date, any CVC

3. **Test Booking Payment:**
   - Client books freelancer
   - Freelancer accepts (payment authorized)
   - Complete booking (payment captured, invoice generated)
   - Verify invoice appears in database

---

## 🎨 UI COMPONENTS (Week 2)

Once backend is working, we'll build:

### **Components to Create:**

1. **Stripe Connect Onboarding Button**
   - `src/components/payments/StripeConnectButton.jsx`
   - Triggers onboarding flow
   - Shows onboarding status

2. **Payment Method Manager**
   - `src/components/payments/PaymentMethodsPage.jsx`
   - Add/remove cards
   - Set default payment method

3. **Payment Dashboard (Client)**
   - `src/components/payments/PaymentDashboard.jsx`
   - Payment history
   - Pending payments
   - Total spent

4. **Earnings Dashboard (Freelancer)**
   - `src/components/payments/EarningsDashboard.jsx`
   - Earnings history
   - Pending payouts
   - Total earned

5. **Invoice Display**
   - `src/components/payments/InvoiceModal.jsx`
   - Show invoice details
   - Download PDF
   - Payment status

---

## 💰 STRIPE PRICING & COSTS

### **Stripe Fees:**

**Payment Processing:**
- 2.9% + $0.30 per successful card charge
- International cards: +1%
- Currency conversion: +1%

**Stripe Connect:**
- FREE to use
- No additional fees beyond payment processing

**Stripe Invoicing:**
- FREE to create and send invoices
- No additional fees

**Stripe Tax (Optional):**
- $0.004 per transaction (0.4%)
- Automatic tax calculations for 50+ countries

### **Example Transaction:**

**Booking Amount:** $500.00
```
Client pays:              $500.00
Platform fee (10%):        -$50.00
Stripe fee (2.9% + $0.30): -$14.80
Freelancer receives:      $435.20
Platform keeps:            $50.00
```

**Platform Revenue Per Transaction:** $50.00
**Net Revenue (after Stripe):** $35.20

---

## 📊 TESTING WITH STRIPE TEST MODE

### **Test Cards:**

**Success:**
- `4242 4242 4242 4242` - Visa
- `5555 5555 5555 4444` - Mastercard
- `378282246310005` - Amex

**Declined:**
- `4000 0000 0000 0002` - Card declined
- `4000 0000 0000 9995` - Insufficient funds

**Requires Authentication (3D Secure):**
- `4000 0025 0000 3155` - Requires authentication

**Test CVC:** Any 3 digits (4 for Amex)
**Test Expiry:** Any future date

---

## 🔐 SECURITY BEST PRACTICES

### ✅ What We've Done Right:

1. **Secrets in Environment Variables**
   - Never hardcoded in code
   - Not committed to git

2. **Server-Side Payment Processing**
   - Edge Functions handle sensitive operations
   - Client never sees secret key

3. **Row Level Security (RLS)**
   - Database policies protect payment data
   - Users can only see their own data

4. **Payment Status Tracking**
   - Separate status for booking and payment
   - Prevents double-charging

### ⚠️ Additional Security Measures:

1. **Webhook Verification**
   - Verify Stripe webhook signatures
   - Prevent fake events

2. **Idempotency Keys**
   - Prevent duplicate charges
   - Use booking ID as idempotency key

3. **Amount Validation**
   - Always validate amounts server-side
   - Never trust client-side amounts

---

## 🚀 DEPLOYMENT TO PRODUCTION

### **When Ready for Production:**

1. **Switch to Live Keys**
   - Get live keys from Stripe Dashboard
   - Update `.env` with `pk_live_...` and `sk_live_...`
   - Redeploy Edge Functions with live keys

2. **Activate Your Stripe Account**
   - Complete business verification
   - Provide tax information
   - Add bank account for payouts

3. **Test in Production**
   - Use real credit card (yours)
   - Make small test transaction ($1)
   - Verify everything works

4. **Enable Payouts**
   - Connect bank account in Stripe Dashboard
   - Set payout schedule (daily/weekly)

---

## 📚 RESOURCES

### **Stripe Documentation:**
- Stripe Connect: https://stripe.com/docs/connect
- Payment Intents: https://stripe.com/docs/payments/payment-intents
- Invoicing: https://stripe.com/docs/invoicing
- Test Cards: https://stripe.com/docs/testing

### **Supabase Documentation:**
- Edge Functions: https://supabase.com/docs/guides/functions
- Database Functions: https://supabase.com/docs/guides/database/functions

### **Our Documentation:**
- `CURRENT_STATE_AND_ROADMAP.md` - Overall project status
- `CALENDAR_AND_INVOICE_SYSTEM.md` - Calendar system design
- `DEPLOYMENT_GUIDE.md` - Vercel deployment

---

## ✅ WEEK 1 CHECKLIST

**What You Need To Do This Week:**

- [ ] Create Stripe account
- [ ] Get test API keys
- [ ] Add keys to `.env` file
- [ ] Run database migration (`npx supabase db push`)
- [ ] Create 5 Supabase Edge Functions
- [ ] Deploy Edge Functions to Supabase
- [ ] Update API endpoint URLs in frontend
- [ ] Test Stripe Connect onboarding
- [ ] Test payment method addition
- [ ] Test end-to-end booking payment

**Estimated Time:** 3-4 hours of focused work

---

## 🎯 SUCCESS CRITERIA

**Week 1 Complete When:**

✅ Stripe account created and verified
✅ All Edge Functions deployed and working
✅ Can create Stripe Connect account
✅ Can add payment method
✅ Payment intent creates successfully
✅ Payment capture works on booking completion
✅ Invoice generates automatically
✅ No errors in console logs

---

## 💬 NEED HELP?

**Common Issues:**

1. **"Stripe key not found"**
   - Check `.env` file has correct keys
   - Restart dev server after adding keys

2. **"Function not found"**
   - Verify Edge Functions are deployed
   - Check function URLs are correct

3. **"Payment failed"**
   - Check Stripe Dashboard for error details
   - Verify test card number is correct
   - Ensure Connect account is fully onboarded

4. **"Database error"**
   - Verify migration ran successfully
   - Check RLS policies aren't blocking access
   - Review Supabase logs

---

**Ready to start? Begin with Step 1: Create Stripe Account!**

**Questions? Check the Stripe Dashboard or Supabase logs for detailed error messages.**

---

**Document Status:** ✅ Complete - Ready for Implementation
**Last Updated:** November 24, 2025
**Next Review:** After Week 1 completion
