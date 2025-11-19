# Supabase Configuration Checklist

## ⚠️ Critical: If users aren't being created and emails aren't sending, follow this checklist

---

## Step 1: Access Your Supabase Dashboard

1. Go to **https://supabase.com**
2. Click **"Sign In"** (top right)
3. Log in with your credentials
4. Click on your **"TIES Together"** project

---

## Step 2: Check Email Confirmation Settings

### 2a. Enable Email Provider
1. In left sidebar, click **"Authentication"**
2. Click **"Providers"**
3. Find **"Email"** in the list
4. Make sure the toggle is **ON** (green/enabled)

### 2b. Enable Email Confirmations
1. Still on the Providers page
2. Look for **"Confirm email"** checkbox or toggle
3. Make sure it's **CHECKED/ENABLED**
4. Click **"Save"** at the bottom

---

## Step 3: Configure Redirect URLs (CRITICAL!)

1. In left sidebar, click **"Authentication"**
2. Click **"URL Configuration"**
3. You should see two sections:

### Site URL:
```
http://localhost:5173
```

### Redirect URLs - Add BOTH of these:
```
http://localhost:5173/auth/callback
http://localhost:5173/**
```

4. Click **"Save"**

**⚠️ Without these redirect URLs, emails won't be sent correctly!**

---

## Step 4: Check Email Template

1. In left sidebar, click **"Authentication"**
2. Click **"Email Templates"**
3. Find **"Confirm signup"** template
4. Make sure it contains: `{{ .ConfirmationURL }}`
5. The default template works fine - no need to change unless you want custom branding

---

## Step 5: Check SMTP Settings (Optional for Testing)

1. Click **"Project Settings"** (gear icon in sidebar)
2. Click **"Authentication"**
3. Scroll to **"SMTP Settings"**

### For Testing (Development):
- You can use Supabase's default email service
- **Note**: Has rate limits (30 emails/hour)
- Emails might go to spam

### For Production:
- Must configure custom SMTP (SendGrid, Mailgun, etc.)
- See SUPABASE_EMAIL_SETUP.md for detailed SMTP setup

---

## Step 6: Verify Database Setup

1. In left sidebar, click **"Table Editor"**
2. Check these tables exist:
   - ✅ `profiles` table
   - ✅ `auth.users` (system table)

3. Click on **"Database"** → **"Triggers"**
4. Look for a trigger that creates profiles automatically when users sign up
   - If missing, profiles won't be created!

---

## Step 7: Test Signup Flow

After configuring everything above:

1. **Clear browser data** (cookies, local storage) or use incognito
2. Go to http://localhost:5173
3. Click **"Join Today"** or **"Sign Up"**
4. Fill in the form:
   - Email: Use a real email you can access
   - Password: At least 6 characters
   - Fill other required fields
5. Click **"Create account"**

### What Should Happen:
✅ You should be redirected to "Check Your Email" page
✅ Email should arrive within 30-60 seconds
✅ Check **spam folder** if not in inbox
✅ Click confirmation link in email
✅ You should be auto-logged in

### What Might Go Wrong:

**❌ No email arrives:**
- Check SMTP settings
- Check email confirmation is enabled
- Check redirect URLs are configured
- Check Supabase logs (Dashboard → Logs → Auth)

**❌ Email arrives but link doesn't work:**
- Verify redirect URLs are correct
- Check Site URL matches your dev environment
- Check browser console for errors

**❌ Error on signup form:**
- Check browser console for specific error
- Check Supabase logs for auth errors
- Verify email isn't already registered

---

## Step 8: Check Supabase Logs

If still having issues:

1. In left sidebar, click **"Logs"**
2. Click **"Auth"**
3. Look for recent signup attempts
4. Check for error messages

Common errors:
- `Email rate limit exceeded` - Wait or configure custom SMTP
- `Invalid redirect URL` - Add URL to allowed list
- `Email not configured` - Enable email provider

---

## Quick Verification Script

After configuring, run this test:

1. Open browser dev tools (F12)
2. Go to Console tab
3. Run this in console:

```javascript
// Check Supabase config
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Window origin:', window.location.origin)
console.log('Expected redirect:', window.location.origin + '/auth/callback')
```

Make sure the redirect URL matches what's in your Supabase dashboard!

---

## Need Help?

If you're still stuck:
1. Screenshot your Supabase URL Configuration page
2. Check browser console for errors during signup
3. Check Supabase logs for auth errors
4. Verify your .env.local file has correct Supabase credentials
