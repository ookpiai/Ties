# 🚀 TIES Together - Vercel Deployment Guide

Complete step-by-step guide to deploy your application to Vercel.

---

## 📋 Prerequisites

Before deploying, make sure you have:
- ✅ A Vercel account (sign up at https://vercel.com)
- ✅ Your Supabase project credentials
- ✅ Git repository (GitHub, GitLab, or Bitbucket)

---

## 🔐 Step 1: Prepare Environment Variables

You'll need these environment variables from your `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=TIES Together
VITE_APP_URL=https://your-app.vercel.app  # Will be updated after deployment
```

**⚠️ IMPORTANT:**
- Keep your `.env` file LOCAL only - never commit it to git
- The `.env.example` is for documentation only

---

## 🌐 Step 2: Push Code to GitHub/GitLab

If you haven't already:

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "chore: Prepare for Vercel deployment"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/TIES-Together-V2.git

# Push to main branch
git push -u origin main
```

---

## 🚀 Step 3: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended for First Time)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Click "Add New..." → "Project"

2. **Import Your Repository**
   - Select "Import Git Repository"
   - Choose GitHub/GitLab/Bitbucket
   - Authorize Vercel to access your repos
   - Select your `TIES-Together-V2` repository

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add each variable from your `.env` file:
     - `VITE_SUPABASE_URL` → your Supabase URL
     - `VITE_SUPABASE_ANON_KEY` → your Supabase anon key
     - `VITE_APP_NAME` → TIES Together
     - `VITE_APP_URL` → (leave blank for now, update after first deploy)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Vercel will give you a URL like: `https://ties-together-v2.vercel.app`

6. **Update Environment Variables**
   - Go to Project Settings → Environment Variables
   - Update `VITE_APP_URL` with your new Vercel URL
   - Redeploy (Deployments → Three dots → Redeploy)

---

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - What's your project's name? TIES-Together-V2
# - In which directory is your code located? ./
# - Want to override settings? No

# After first deploy, set environment variables:
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_APP_NAME production
vercel env add VITE_APP_URL production

# Deploy to production
vercel --prod
```

---

## ⚙️ Step 4: Configure Supabase for Production

1. **Add Your Vercel Domain to Supabase**
   - Go to your Supabase Dashboard
   - Navigate to Authentication → URL Configuration
   - Add your Vercel URL to "Site URL"
   - Add your Vercel URL to "Redirect URLs":
     ```
     https://your-app.vercel.app/**
     ```

2. **Update CORS Settings (if needed)**
   - Go to Project Settings → API
   - Add your Vercel domain to allowed origins

---

## 🔄 Step 5: Automatic Deployments

Vercel automatically deploys when you push to your repository:

```bash
# Make changes to your code
git add .
git commit -m "feat: Add new feature"
git push

# Vercel will automatically:
# 1. Detect the push
# 2. Build your project
# 3. Deploy to production
# 4. Update your live URL
```

**Preview Deployments:**
- Every pull request gets a unique preview URL
- Test changes before merging to main
- Automatically cleaned up after merge

---

## 🔍 Step 6: Verify Deployment

1. **Check Build Status**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Latest deployment should show "Ready" with green checkmark

2. **Test Your Live App**
   - Visit your Vercel URL
   - Test key features:
     - [ ] Landing page loads
     - [ ] Login/Register works
     - [ ] Dashboard loads
     - [ ] Navigation works
     - [ ] Dark mode toggle works
     - [ ] Mobile responsive menu works

3. **Check Browser Console**
   - Open DevTools (F12)
   - Look for any errors in Console tab
   - Common issues:
     - Missing environment variables
     - CORS errors (check Supabase settings)
     - 404s (check vercel.json rewrites)

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Module not found` or `Cannot resolve`
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build  # Test locally first
```

**Error:** `Out of memory`
- Go to Project Settings → General
- Increase Node.js Version to latest (20.x)
- Increase Memory Limit if available

### White Screen / 404 Errors

**Check vercel.json:**
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Check build output:**
- Go to Deployments → Click deployment → View Build Logs
- Look for errors during build process

### Environment Variables Not Working

**Verify in Vercel Dashboard:**
1. Project Settings → Environment Variables
2. Make sure all variables are set for "Production"
3. Must start with `VITE_` prefix for Vite to expose them
4. Redeploy after adding variables

### Supabase Connection Issues

**Error:** `Invalid API key` or CORS errors
1. Check Supabase Dashboard → Settings → API
2. Copy the correct anon key (public, not service role)
3. Add Vercel domain to Supabase URL Configuration
4. Update environment variables in Vercel

---

## 📊 Performance Optimization

### Enable Compression
Already configured in `vercel.json` with Cache-Control headers.

### Check Performance
1. Visit https://pagespeed.web.dev
2. Enter your Vercel URL
3. Review recommendations

### Monitor Analytics
- Vercel Dashboard → Analytics
- View page views, unique visitors
- Check Web Vitals (LCP, FID, CLS)

---

## 🔒 Security Checklist

- [ ] Environment variables set in Vercel (not in code)
- [ ] `.env` file in `.gitignore`
- [ ] Supabase RLS (Row Level Security) enabled
- [ ] Supabase anon key used (not service role key)
- [ ] CORS configured correctly in Supabase
- [ ] HTTPS enabled (automatic with Vercel)

---

## 🎯 Custom Domain (Optional)

### Add Your Own Domain

1. **Purchase Domain** (GoDaddy, Namecheap, etc.)

2. **Add to Vercel**
   - Project Settings → Domains
   - Click "Add Domain"
   - Enter your domain: `tiestogether.com`

3. **Update DNS Records**
   - Add A record: `76.76.21.21`
   - Or CNAME record: `cname.vercel-dns.com`
   - Wait 24-48 hours for DNS propagation

4. **Update Environment Variables**
   ```bash
   VITE_APP_URL=https://tiestogether.com
   ```

5. **Update Supabase**
   - Add custom domain to Supabase URL Configuration

---

## 📱 Mobile App Deployment (Future)

When ready for mobile apps:
- Expo/React Native: Use same Supabase backend
- Update `VITE_APP_URL` to point to mobile deep links
- Configure OAuth redirects for mobile

---

## 🔄 Continuous Integration (CI/CD)

Your setup already includes:
- ✅ Automatic deployments on push to main
- ✅ Preview deployments for pull requests
- ✅ Automatic builds on commit
- ✅ Environment variable management

Optional additions:
- GitHub Actions for testing before deploy
- Automatic database migrations
- E2E testing with Playwright

---

## 📞 Support

**Vercel Issues:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Support: https://vercel.com/support

**Supabase Issues:**
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Support: https://supabase.com/support

**Application Issues:**
- Check browser console for errors
- Review Vercel build logs
- Test locally with `npm run build && npm run preview`

---

## ✅ Deployment Checklist

Before going live:

**Technical:**
- [ ] All features working locally
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Supabase URL configuration updated
- [ ] Mobile responsive tested
- [ ] Dark mode working
- [ ] All routes accessible

**Content:**
- [ ] Logo and branding correct
- [ ] Contact information updated
- [ ] Privacy policy (if needed)
- [ ] Terms of service (if needed)

**SEO (Optional):**
- [ ] Meta tags in index.html
- [ ] Open Graph tags
- [ ] Sitemap.xml
- [ ] Robots.txt

---

## 🎉 You're Live!

Your TIES Together application is now deployed and accessible worldwide!

**Next Steps:**
1. Share your URL with users
2. Monitor analytics in Vercel
3. Set up error tracking (Sentry, LogRocket)
4. Create a custom domain
5. Keep improving based on user feedback

---

**Deployment Date:** 2025-11-24
**Version:** 1.0.0
**Platform:** Vercel + Supabase
**Status:** ✅ Production Ready
