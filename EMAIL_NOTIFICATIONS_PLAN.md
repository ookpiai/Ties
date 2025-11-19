# Email Notifications Implementation Plan

## Overview
Implement a complete email notification system using SendGrid to notify users of important platform events.

---

## Architecture

### Components:
1. **SendGrid** - Email delivery service (free tier: 100 emails/day)
2. **Supabase Edge Function** - Serverless function to send emails
3. **Email Templates** - HTML templates with dynamic data
4. **API Integration** - Trigger emails from booking/job/message actions

### Flow:
```
User Action (booking, message, etc.)
    ↓
Backend API (bookings.ts, jobs.ts, etc.)
    ↓
Call Supabase Edge Function
    ↓
Edge Function calls SendGrid API
    ↓
SendGrid sends email to recipient
```

---

## Email Templates Needed (12 Total)

### Booking Emails (6):
1. **Booking Request Created** → To Freelancer
   - "New booking request from [Client Name]"
   - Show: dates, rate, project details
   - CTA: "View Request"

2. **Booking Accepted** → To Client
   - "Your booking request has been accepted!"
   - Show: confirmation details, next steps
   - CTA: "View Booking"

3. **Booking Declined** → To Client
   - "Booking request declined"
   - Show: freelancer name, dates
   - CTA: "Find Other Professionals"

4. **Booking Cancelled** → To Both Parties
   - "Booking has been cancelled"
   - Show: booking details, who cancelled
   - CTA: "View Details"

5. **Booking Completed** → To Both Parties
   - "Booking completed - Please leave a review"
   - Show: project summary
   - CTA: "Leave Review"

6. **Booking Reminder** → To Both Parties (24h before)
   - "Reminder: Booking starts tomorrow"
   - Show: time, location, details
   - CTA: "View Details"

### Job Application Emails (3):
7. **Application Received** → To Organiser
   - "New application for [Job Title]"
   - Show: applicant name, role, preview
   - CTA: "View Application"

8. **Application Selected** → To Freelancer
   - "You've been selected for [Job Title]!"
   - Show: job details, next steps
   - CTA: "View Job Details"

9. **Application Rejected** → To Freelancer
   - "Application status update"
   - Show: job title, thank you message
   - CTA: "Browse Other Jobs"

### Message Emails (1):
10. **New Message Received** → To Recipient
    - "New message from [Sender Name]"
    - Show: message preview (first 100 chars)
    - CTA: "Read Message"

### System Emails (2):
11. **Welcome Email** → New Users (already done by Supabase)
    - Handled by email confirmation system

12. **Password Reset** → Users (already done by Supabase)
    - Handled automatically

---

## Implementation Steps

### Phase 1: Setup (15 min)
- [ ] Create SendGrid account (free tier)
- [ ] Generate SendGrid API key
- [ ] Add API key to Supabase secrets
- [ ] Test SendGrid connection

### Phase 2: Edge Function (30 min)
- [ ] Create `/supabase/functions/send-email/index.ts`
- [ ] Implement SendGrid integration
- [ ] Add email template logic
- [ ] Add error handling and logging
- [ ] Deploy function to Supabase

### Phase 3: Email Templates (2 hours)
- [ ] Create base HTML email template (TIES Together branding)
- [ ] Create 10 specific email templates
- [ ] Test templates with sample data
- [ ] Make templates responsive (mobile-friendly)

### Phase 4: API Integration (2 hours)
- [ ] Update `bookings.ts` API:
  - `createBooking()` → Send email to freelancer
  - `acceptBooking()` → Send email to client
  - `declineBooking()` → Send email to client
  - `cancelBooking()` → Send emails to both
  - `completeBooking()` → Send emails to both

- [ ] Update `jobs.ts` API:
  - `applyForJob()` → Send email to organiser
  - `selectApplicant()` → Send email to freelancer
  - `rejectApplicant()` → Send email to freelancer

- [ ] Update `messages.ts` API:
  - `sendMessage()` → Send email to recipient (with debounce)

### Phase 5: Email Preferences (30 min)
- [ ] Add email preferences to Settings page
- [ ] Store preferences in profiles table
- [ ] Check preferences before sending emails

### Phase 6: Testing (1 hour)
- [ ] Test all 10 email scenarios
- [ ] Verify email delivery
- [ ] Check spam scores
- [ ] Test on mobile devices
- [ ] Verify links work correctly

---

## SendGrid Setup Instructions

### 1. Create Account
1. Go to https://sendgrid.com
2. Sign up for free account (100 emails/day)
3. Verify your email address

### 2. Create Sender Identity
1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Enter your details:
   - From Email: `noreply@tiestogether.com` (or use your domain)
   - From Name: `TIES Together`
4. Verify email address

### 3. Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name: `TIES Together Notifications`
4. Permissions: Full Access (or Mail Send only)
5. Copy the API key (save it - you won't see it again!)

### 4. Add to Supabase
1. Go to Supabase Dashboard
2. Project Settings → Edge Functions → Secrets
3. Add secret:
   - Name: `SENDGRID_API_KEY`
   - Value: [Your API key]

---

## Email Template Structure

### Base Template (HTML):
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ subject }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <!-- Main content container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header with logo -->
          <tr>
            <td style="padding: 30px; background-color: #E03131; border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">TIES Together</h1>
            </td>
          </tr>

          <!-- Email content -->
          <tr>
            <td style="padding: 40px 30px;">
              {{ content }}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px; background-color: #f8f8f8; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                You received this email because you have a TIES Together account.
                <a href="{{ unsubscribe_url }}" style="color: #E03131;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

---

## Edge Function Code Structure

```typescript
// /supabase/functions/send-email/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')

serve(async (req) => {
  try {
    const { to, subject, template, data } = await req.json()

    // Render template with data
    const html = renderTemplate(template, data)

    // Send via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: 'noreply@tiestogether.com', name: 'TIES Together' },
        subject: subject,
        content: [{ type: 'text/html', value: html }]
      })
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

---

## API Integration Example

```typescript
// In /src/api/bookings.ts

export async function createBooking(freelancerId, bookingData) {
  // Create booking in database
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single()

  if (error) throw error

  // Send email notification to freelancer
  await sendEmailNotification({
    to: freelancerEmail,
    template: 'booking-request',
    data: {
      freelancerName: freelancerProfile.display_name,
      clientName: clientProfile.display_name,
      startDate: booking.start_date,
      endDate: booking.end_date,
      rate: booking.rate,
      bookingUrl: `${window.location.origin}/bookings/${booking.id}`
    }
  })

  return { success: true, data: booking }
}
```

---

## Email Preferences Schema

Add to `profiles` table:

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_preferences JSONB DEFAULT '{
  "booking_requests": true,
  "booking_updates": true,
  "job_applications": true,
  "messages": true,
  "marketing": false
}'::jsonb;
```

---

## Testing Checklist

### Manual Tests:
- [ ] Create booking → Freelancer receives email
- [ ] Accept booking → Client receives email
- [ ] Decline booking → Client receives email
- [ ] Cancel booking → Both receive emails
- [ ] Complete booking → Both receive emails
- [ ] Apply for job → Organiser receives email
- [ ] Select applicant → Freelancer receives email
- [ ] Reject applicant → Freelancer receives email
- [ ] Send message → Recipient receives email

### Email Quality Tests:
- [ ] Emails look good in Gmail
- [ ] Emails look good in Outlook
- [ ] Emails look good on mobile
- [ ] Links work correctly
- [ ] Images load properly
- [ ] Not marked as spam
- [ ] Unsubscribe link works

---

## Timeline Estimate

- **Setup**: 15 minutes
- **Edge Function**: 30 minutes
- **Email Templates**: 2 hours
- **API Integration**: 2 hours
- **Email Preferences**: 30 minutes
- **Testing**: 1 hour

**Total**: ~6 hours of work

---

## Cost Estimate

- SendGrid Free Tier: 100 emails/day (forever free)
- For more volume:
  - Essentials: $19.95/month (50,000 emails)
  - Pro: $89.95/month (100,000 emails)

For launch, free tier should be sufficient!

---

## Next Steps

1. Create SendGrid account
2. Get API key
3. Add to Supabase secrets
4. Create Edge Function
5. Create email templates
6. Integrate into APIs
7. Test everything!

Ready to start? Let's begin with SendGrid setup!
