# Deploy Email Notification System

## What We Built:
- ✅ Supabase Edge Function (`send-email`)
- ✅ 9 Professional Email Templates (all embedded in function)
- ✅ Email Helper Functions (`src/api/emails.ts`)
- ✅ Ready to integrate into APIs

---

## Step 1: Install Supabase CLI (if not already installed)

```bash
# On Windows (run in PowerShell as Administrator)
scoop install supabase

# Or use npm
npm install -g supabase
```

**Verify installation:**
```bash
supabase --version
```

---

## Step 2: Login to Supabase CLI

```bash
supabase login
```

This will open a browser window. Log in with your Supabase account credentials.

---

## Step 3: Link Your Project

```bash
cd /mnt/c/Users/oo/Desktop/ties-together/TIES-Together-V2
supabase link --project-ref faqiwcrnltuqvhkmzrxp
```

When prompted, paste your database password (from your Supabase dashboard).

---

## Step 4: Add SendGrid API Key as Secret

```bash
supabase secrets set SENDGRID_API_KEY=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
```

**⚠️ IMPORTANT**: After we finish testing, regenerate this API key in SendGrid since it was shared here.

---

## Step 5: Deploy the Edge Function

```bash
supabase functions deploy send-email
```

This will:
- Upload the function to Supabase
- Make it available at: `https://faqiwcrnltuqvhkmzrxp.supabase.co/functions/v1/send-email`

---

## Step 6: Test the Function

After deployment, test it with a simple email:

```bash
curl -X POST https://faqiwcrnltuqvhkmzrxp.supabase.co/functions/v1/send-email \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "your.email@example.com",
    "subject": "Test Email from TIES Together",
    "template": "booking-request",
    "data": {
      "freelancerName": "Test User",
      "clientName": "Test Client",
      "startDate": "2025-12-01",
      "endDate": "2025-12-05",
      "rate": "$500/day",
      "bookingUrl": "https://tiestogether.com/bookings/123"
    }
  }'
```

Replace `YOUR_ANON_KEY` with your Supabase anon key from `.env.local` (VITE_SUPABASE_ANON_KEY).

---

## Step 7: Verify Deployment

1. Go to Supabase Dashboard → Edge Functions
2. You should see `send-email` listed
3. Click on it to view logs and details

---

## Troubleshooting

### Error: "supabase: command not found"
- CLI not installed. Install using scoop or npm (see Step 1)

### Error: "Failed to link project"
- Make sure you're logged in: `supabase login`
- Check project ref is correct: `faqiwcrnltuqvhkmzrxp`

### Error: "SENDGRID_API_KEY not configured"
- Secret wasn't set. Run Step 4 again
- Verify: `supabase secrets list`

### Error: "SendGrid API error: 403"
- API key invalid or expired
- Verify sender email is verified in SendGrid
- Check SendGrid dashboard for issues

### Function deploys but emails don't send
- Check function logs: `supabase functions logs send-email`
- Verify SendGrid sender is verified
- Check SendGrid activity dashboard

---

## Next Steps After Deployment

Once the function is deployed and tested:

1. Integrate into booking APIs (`src/api/bookings.ts`)
2. Integrate into job APIs (`src/api/jobs.ts`)
3. Integrate into message API (`src/api/messages.ts`)
4. Test all email scenarios
5. Regenerate SendGrid API key (for security)

---

## Alternative: Deploy Via Supabase Dashboard

If CLI doesn't work, you can deploy via dashboard:

1. Go to Supabase Dashboard → Edge Functions
2. Click "Create a new function"
3. Name: `send-email`
4. Copy/paste contents of `supabase/functions/send-email/index.ts`
5. Click "Deploy"
6. Add secret via Dashboard → Settings → Edge Functions → Secrets

---

Ready to deploy? Run the commands above and let me know once it's deployed!
