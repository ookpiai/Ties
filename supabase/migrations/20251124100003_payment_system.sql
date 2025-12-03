-- Migration: Payment System - Stripe Integration
-- Date: 2025-11-24
-- Description: Complete payment infrastructure for TIES Together

-- =====================================================
-- STRIPE CONNECTED ACCOUNTS
-- =====================================================
-- Stores Stripe Connect account info for freelancers/venues/vendors
CREATE TABLE IF NOT EXISTS stripe_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_account_id TEXT UNIQUE NOT NULL,
  account_type TEXT DEFAULT 'express', -- express or standard
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  details_submitted BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  country TEXT DEFAULT 'US',
  currency TEXT DEFAULT 'usd',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_stripe_accounts_user_id ON stripe_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_accounts_stripe_account_id ON stripe_accounts(stripe_account_id);

-- =====================================================
-- PAYMENT METHODS
-- =====================================================
-- Stores customer payment methods (for clients/organisers)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_payment_method_id TEXT NOT NULL,
  type TEXT DEFAULT 'card', -- card, bank_account
  brand TEXT, -- visa, mastercard, amex, etc.
  last4 TEXT,
  exp_month INTEGER,
  exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_stripe_customer_id ON payment_methods(stripe_customer_id);

-- =====================================================
-- INVOICES
-- =====================================================
-- Generated automatically on booking completion
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  stripe_invoice_id TEXT,
  stripe_hosted_url TEXT,
  stripe_pdf_url TEXT,

  -- Parties
  client_id UUID NOT NULL REFERENCES profiles(id),
  freelancer_id UUID NOT NULL REFERENCES profiles(id),

  -- Amounts (all in cents for precision)
  subtotal INTEGER NOT NULL, -- booking amount
  platform_fee INTEGER NOT NULL, -- TIES commission (10%)
  tax_amount INTEGER DEFAULT 0, -- if using Stripe Tax
  total_amount INTEGER NOT NULL, -- subtotal + tax
  freelancer_payout INTEGER NOT NULL, -- subtotal - platform_fee

  -- Payment info
  currency TEXT DEFAULT 'usd',
  status TEXT DEFAULT 'pending', -- pending, paid, cancelled, refunded
  payment_method TEXT, -- card brand + last4

  -- Timestamps
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(booking_id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_booking_id ON invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_freelancer_id ON invoices(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- =====================================================
-- PAYMENTS
-- =====================================================
-- Tracks individual payment transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  -- Stripe IDs
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_transfer_id TEXT, -- transfer to connected account

  -- Parties
  payer_id UUID NOT NULL REFERENCES profiles(id),
  recipient_id UUID NOT NULL REFERENCES profiles(id),

  -- Amounts
  amount INTEGER NOT NULL, -- total amount paid
  platform_fee INTEGER NOT NULL, -- TIES commission
  recipient_amount INTEGER NOT NULL, -- amount to freelancer

  -- Status
  status TEXT DEFAULT 'pending', -- pending, processing, succeeded, failed, cancelled
  failure_reason TEXT,

  -- Payment method
  payment_method_id TEXT,
  payment_method_type TEXT, -- card, bank_account

  -- Timestamps
  captured_at TIMESTAMPTZ,
  transferred_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_id ON payments(payer_id);
CREATE INDEX IF NOT EXISTS idx_payments_recipient_id ON payments(recipient_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);

-- =====================================================
-- PAYOUTS
-- =====================================================
-- Tracks payouts to freelancers/venues/vendors
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL,
  stripe_payout_id TEXT,

  -- Amount
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'usd',

  -- Status
  status TEXT DEFAULT 'pending', -- pending, processing, paid, failed, cancelled
  failure_reason TEXT,

  -- Schedule
  scheduled_date TIMESTAMPTZ,
  arrival_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- Metadata
  description TEXT,
  invoice_ids UUID[], -- array of invoice IDs included in payout

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payouts_user_id ON payouts(user_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON payouts(status);
CREATE INDEX IF NOT EXISTS idx_payouts_stripe_payout_id ON payouts(stripe_payout_id);
CREATE INDEX IF NOT EXISTS idx_payouts_scheduled_date ON payouts(scheduled_date);

-- =====================================================
-- REFUNDS
-- =====================================================
-- Tracks refund requests and processing
CREATE TABLE IF NOT EXISTS refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,

  -- Stripe
  stripe_refund_id TEXT UNIQUE,

  -- Amount
  amount INTEGER NOT NULL, -- refund amount in cents
  reason TEXT, -- duplicate, fraudulent, requested_by_customer
  description TEXT, -- additional context

  -- Status
  status TEXT DEFAULT 'pending', -- pending, processing, succeeded, failed, cancelled
  failure_reason TEXT,

  -- Who requested
  requested_by UUID NOT NULL REFERENCES profiles(id),

  -- Timestamps
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_booking_id ON refunds(booking_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
CREATE INDEX IF NOT EXISTS idx_refunds_requested_by ON refunds(requested_by);

-- =====================================================
-- PAYMENT SETTINGS
-- =====================================================
-- Per-user payment preferences
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Payout preferences (for freelancers)
  payout_schedule TEXT DEFAULT 'weekly', -- daily, weekly, monthly, manual
  minimum_payout_amount INTEGER DEFAULT 2000, -- $20.00 minimum

  -- Payment preferences (for clients)
  auto_pay_on_completion BOOLEAN DEFAULT false,

  -- Notifications
  notify_on_payment_received BOOLEAN DEFAULT true,
  notify_on_payout_processed BOOLEAN DEFAULT true,
  notify_on_invoice_generated BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_settings_user_id ON payment_settings(user_id);

-- =====================================================
-- UPDATE BOOKINGS TABLE
-- =====================================================
-- Add payment-related fields to existing bookings table
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_connected_account_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending', -- pending, authorized, captured, failed
  ADD COLUMN IF NOT EXISTS payment_captured_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id);

CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_invoice_id ON bookings(invoice_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Stripe Accounts
ALTER TABLE stripe_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own stripe account" ON stripe_accounts;
CREATE POLICY "Users can view own stripe account"
  ON stripe_accounts FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stripe account" ON stripe_accounts;
CREATE POLICY "Users can update own stripe account"
  ON stripe_accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert stripe accounts" ON stripe_accounts;
CREATE POLICY "System can insert stripe accounts"
  ON stripe_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Payment Methods
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payment methods" ON payment_methods;
CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own payment methods" ON payment_methods;
CREATE POLICY "Users can manage own payment methods"
  ON payment_methods FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view invoices they're part of" ON invoices;
CREATE POLICY "Users can view invoices they're part of"
  ON invoices FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

-- Payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view payments they're part of" ON payments;
CREATE POLICY "Users can view payments they're part of"
  ON payments FOR SELECT
  USING (auth.uid() = payer_id OR auth.uid() = recipient_id);

-- Payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payouts" ON payouts;
CREATE POLICY "Users can view own payouts"
  ON payouts FOR SELECT
  USING (auth.uid() = user_id);

-- Refunds
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view refunds for their bookings" ON refunds;
CREATE POLICY "Users can view refunds for their bookings"
  ON refunds FOR SELECT
  USING (
    auth.uid() IN (
      SELECT client_id FROM bookings WHERE id = booking_id
      UNION
      SELECT freelancer_id FROM bookings WHERE id = booking_id
    )
  );

-- Payment Settings
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own payment settings" ON payment_settings;
CREATE POLICY "Users can manage own payment settings"
  ON payment_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to generate unique invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  new_number TEXT;
  year_month TEXT;
  sequence_num INTEGER;
BEGIN
  -- Format: INV-YYYYMM-NNNN (e.g., INV-202511-0001)
  year_month := TO_CHAR(NOW(), 'YYYYMM');

  -- Get next sequence number for this month
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(invoice_number FROM 13) AS INTEGER)
  ), 0) + 1
  INTO sequence_num
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '-%';

  new_number := 'INV-' || year_month || '-' || LPAD(sequence_num::TEXT, 4, '0');

  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate platform fee (10%)
CREATE OR REPLACE FUNCTION calculate_platform_fee(subtotal INTEGER)
RETURNS INTEGER AS $$
BEGIN
  RETURN FLOOR(subtotal * 0.10); -- 10% commission
END;
$$ LANGUAGE plpgsql;

-- Function to get user's total earnings
CREATE OR REPLACE FUNCTION get_user_earnings(p_user_id UUID)
RETURNS TABLE(
  total_earned INTEGER,
  pending_earnings INTEGER,
  paid_earnings INTEGER,
  total_payouts INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(i.freelancer_payout), 0)::INTEGER as total_earned,
    COALESCE(SUM(CASE WHEN i.status = 'pending' THEN i.freelancer_payout ELSE 0 END), 0)::INTEGER as pending_earnings,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.freelancer_payout ELSE 0 END), 0)::INTEGER as paid_earnings,
    COALESCE((SELECT SUM(amount) FROM payouts WHERE user_id = p_user_id AND status = 'paid'), 0)::INTEGER as total_payouts
  FROM invoices i
  WHERE i.freelancer_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's payment history
CREATE OR REPLACE FUNCTION get_user_payment_history(p_user_id UUID)
RETURNS TABLE(
  total_spent INTEGER,
  pending_payments INTEGER,
  completed_payments INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(i.total_amount), 0)::INTEGER as total_spent,
    COALESCE(SUM(CASE WHEN i.status = 'pending' THEN i.total_amount ELSE 0 END), 0)::INTEGER as pending_payments,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0)::INTEGER as completed_payments
  FROM invoices i
  WHERE i.client_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE stripe_accounts IS 'Stripe Connect accounts for freelancers/venues/vendors to receive payments';
COMMENT ON TABLE payment_methods IS 'Stored payment methods for clients/organisers';
COMMENT ON TABLE invoices IS 'Automatically generated invoices for completed bookings';
COMMENT ON TABLE payments IS 'Individual payment transactions with Stripe tracking';
COMMENT ON TABLE payouts IS 'Scheduled payouts to freelancers/venues/vendors';
COMMENT ON TABLE refunds IS 'Refund requests and processing';
COMMENT ON TABLE payment_settings IS 'User payment preferences and notification settings';

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create default payment settings for existing users
INSERT INTO payment_settings (user_id)
SELECT id FROM profiles
WHERE id NOT IN (SELECT user_id FROM payment_settings)
ON CONFLICT (user_id) DO NOTHING;
