# Supabase Email Confirmation Setup Guide

## Overview
This guide will help you configure Supabase to enable proper email confirmation flow for user signups.

## What We've Built

### The Flow:
1. User fills signup form → clicks "Create account"
2. Supabase sends confirmation email automatically
3. User sees "Check Your Email" page (`/confirm-email`)
4. User clicks link in email
5. Email link redirects to `/auth/callback` with session tokens
6. App detects session and auto-logs in user
7. User is directed to profile setup or dashboard

---

## Configuration Steps

### Step 1: Configure Redirect URLs in Supabase Dashboard

1. **Go to Supabase Dashboard**: https://faqiwcrnltuqvhkmzrxp.supabase.co
2. **Navigate to**: Authentication → URL Configuration
3. **Add the following Redirect URLs**:

   **For Development:**
   ```
   http://localhost:5173/auth/callback
   http://localhost:5173/**
   ```

   **For Production (when deployed):**
   ```
   https://yourdomain.com/auth/callback
   https://yourdomain.com/**
   ```

4. **Set Site URL**:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

5. Click **Save**

---

### Step 2: Enable Email Confirmation

1. **Navigate to**: Authentication → Providers
2. **Find "Email" provider** (should already be enabled)
3. **Toggle ON**: "Confirm email"
4. **Double check**: "Enable email confirmations" should be checked
5. Click **Save**

---

### Step 3: Configure Email Templates (Optional but Recommended)

1. **Navigate to**: Authentication → Email Templates
2. **Find**: "Confirm signup" template
3. **Customize the email** (optional):

   Default template should work, but you can customize it to match your brand:

   ```html
   <h2>Confirm your email for TIES Together</h2>
   <p>Hi there,</p>
   <p>Welcome to TIES Together! Click the link below to confirm your email address and get started:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
   <p>If you didn't create an account with TIES Together, you can safely ignore this email.</p>
   ```

4. **Important**: Make sure the template includes `{{ .ConfirmationURL }}` - this is the magic link
5. Click **Save**

---

### Step 4: SMTP Configuration (CRITICAL FOR PRODUCTION)

⚠️ **Important**: Supabase's default email service has rate limits and may be unreliable.

For production, you MUST configure custom SMTP:

1. **Navigate to**: Project Settings → Authentication → SMTP Settings
2. **Toggle ON**: "Enable Custom SMTP"
3. **Choose a provider**:
   - **Recommended**: SendGrid (free tier: 100 emails/day)
   - Alternatives: Mailgun, AWS SES, Postmark

#### SendGrid Setup:
1. Sign up at https://sendgrid.com
2. Create an API key with "Mail Send" permissions
3. Configure SMTP in Supabase:
   - **Sender email**: noreply@yourdomain.com (must verify domain)
   - **Sender name**: TIES Together
   - **Host**: smtp.sendgrid.net
   - **Port**: 587
   - **Username**: apikey (literally "apikey")
   - **Password**: Your SendGrid API key

4. Click **Save**

---

## Testing the Flow

### Step 1: Clear Browser Data
- Clear cookies and local storage
- Or use incognito mode

### Step 2: Test Signup
1. Go to http://localhost:5173
2. Click "Sign Up"
3. Enter email and password
4. Click "Create account"
5. **You should see**: "Check Your Email" page with your email address

### Step 3: Check Email
1. Check the inbox for the email you used
2. **Check spam folder** if you don't see it
3. You should receive an email from Supabase

### Step 4: Click Confirmation Link
1. Click the confirmation link in the email
2. **You should be redirected** to your app at `/auth/callback`
3. You should see: "Confirming your email..." with loading spinner
4. **Then automatically redirected** to `/profile/setup` (if new user) or `/dashboard` (if profile exists)

### Step 5: Verify Session
1. You should be logged in automatically
2. Check browser dev tools → Application → Local Storage
3. You should see Supabase auth tokens stored

---

## Troubleshooting

### Problem: "Email not sent"
**Solution**:
- Check SMTP configuration
- Verify sender email is validated
- Check Supabase logs (Dashboard → Logs)

### Problem: "Confirmation link doesn't work"
**Solution**:
- Verify redirect URLs are correctly configured
- Check that `/auth/callback` is in the allowed list
- Make sure Site URL matches your dev environment

### Problem: "User not auto-logged in"
**Solution**:
- Check browser console for errors
- Verify `onAuthStateChange` listener in App.jsx is working
- Check that session tokens are in URL hash after redirect

### Problem: "Redirected to wrong page after confirmation"
**Solution**:
- Check `AuthCallback.tsx` logic
- Verify profile creation is working
- Check database for profile record

### Problem: "Email goes to spam"
**Solution**:
- Use custom SMTP (SendGrid)
- Verify sender domain (SPF, DKIM records)
- Add custom "From" email address

---

## Email Template Variables

When customizing email templates, you can use these variables:

- `{{ .ConfirmationURL }}` - The magic confirmation link
- `{{ .SiteURL }}` - Your site URL
- `{{ .TokenHash }}` - Token hash (for advanced PKCE flow)
- `{{ .Token }}` - Token (for implicit flow)

---

## Production Checklist

Before deploying to production:

- [ ] Custom SMTP configured (SendGrid/Mailgun)
- [ ] Production redirect URLs added to Supabase
- [ ] Site URL updated to production domain
- [ ] Email templates customized with branding
- [ ] Sender email verified and SPF/DKIM configured
- [ ] Test complete flow in production environment
- [ ] Monitor email delivery rates

---

## Security Notes

1. **Never disable email confirmation** in production - it prevents spam signups
2. **Always use HTTPS** in production for redirect URLs
3. **Validate redirect URLs** - only allow your domain
4. **Rate limit signups** to prevent abuse
5. **Monitor failed confirmation attempts** in Supabase logs

---

## Support

If you encounter issues:
1. Check Supabase Dashboard → Logs
2. Check browser console for errors
3. Review Supabase Auth documentation: https://supabase.com/docs/guides/auth
4. Check your SMTP provider's delivery logs

---

## What's Next?

After email confirmation is working:
1. ✅ Test complete signup flow end-to-end
2. Implement email notifications for bookings/jobs
3. Add rate requirement enforcement
4. Connect Dashboard to real statistics
5. Deploy to production!
