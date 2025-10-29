# TIES Together - Deployment Guide

## Prerequisites
- Supabase account (https://supabase.com)
- Vercel account (https://vercel.com)
- Node.js 18+ installed locally

## Step 1: Supabase Setup

### 1.1 Create Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Choose organization, name your project "ties-together"
4. Set a strong database password
5. Select region closest to your users
6. Wait for project to be provisioned (~2 minutes)

### 1.2 Run SQL Schema
1. In Supabase dashboard, go to SQL Editor
2. Click "New Query"
3. Copy and paste the following SQL:

```sql
-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text check (role in ('Artist','Crew','Venue','Organiser')) not null,
  avatar_url text,
  bio text,
  city text,
  created_at timestamptz default now()
);

-- SERVICES
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  title text not null,
  price_min numeric,
  price_max numeric,
  tags text[],
  created_at timestamptz default now()
);

-- PROJECTS (scaffold)
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  status text default 'open',
  city text,
  created_at timestamptz default now()
);

create table if not exists public.project_members (
  project_id uuid references projects(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  role text,
  primary key (project_id, user_id)
);

-- MESSAGES
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  from_id uuid references profiles(id) on delete set null,
  to_id uuid references profiles(id) on delete set null,
  body text not null,
  created_at timestamptz default now()
);

-- BOOKINGS
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  organiser_id uuid references profiles(id) on delete set null,
  talent_id uuid references profiles(id) on delete set null,
  project_id uuid references projects(id) on delete set null,
  status text check (status in ('requested','accepted','declined','completed')) default 'requested',
  amount numeric,
  created_at timestamptz default now()
);

-- REVIEWS
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  about_user_id uuid references profiles(id) on delete cascade,
  by_user_id uuid references profiles(id) on delete cascade,
  rating int check (rating between 1 and 5),
  text text,
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;
alter table services enable row level security;
alter table projects enable row level security;
alter table project_members enable row level security;
alter table messages enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;

-- POLICIES
create policy "public read profiles" on profiles for select using (true);
create policy "user update own profile" on profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "user insert own profile" on profiles for insert with check (auth.uid() = id);

create policy "public read services" on services for select using (true);
create policy "owner CRUD services" on services for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "public read projects" on projects for select using (true);
create policy "owner CRUD projects" on projects for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owner manage membership" on project_members
  for all using (auth.uid() in (select owner_id from projects where id = project_id))
  with check (auth.uid() in (select owner_id from projects where id = project_id));

create policy "read my messages" on messages for select using (auth.uid() = from_id or auth.uid() = to_id);
create policy "send message" on messages for insert with check (auth.uid() = from_id);

create policy "read my bookings" on bookings for select using (auth.uid() in (organiser_id, talent_id));
create policy "create booking" on bookings for insert with check (auth.uid() = organiser_id);
create policy "update booking status" on bookings for update using (auth.uid() in (organiser_id, talent_id));

create policy "read reviews" on reviews for select using (true);
create policy "create my review" on reviews for insert with check (auth.uid() = by_user_id);
```

4. Click "Run" to execute the SQL
5. Verify tables were created in Table Editor

### 1.3 Setup Storage
1. Go to Storage in Supabase dashboard
2. Click "New Bucket"
3. Name it `avatars`
4. Set to **Public** bucket
5. Click "Create Bucket"

### 1.4 Get API Credentials
1. Go to Project Settings > API
2. Copy your:
   - Project URL (looks like: https://xxxxx.supabase.co)
   - Anon/Public key (starts with: eyJhbGc...)

## Step 2: Local Development

### 2.1 Environment Setup
1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_NAME=TIES Together
VITE_TITO_MIN_LOADER_MS=1200
VITE_APP_URL=http://localhost:5174
```

### 2.2 Install & Run
```bash
npm install
npm run dev
```

Visit http://localhost:5174

## Step 3: Vercel Deployment

### 3.1 Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 3.2 Deploy to Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. Add Environment Variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `VITE_APP_NAME`: TIES Together
   - `VITE_TITO_MIN_LOADER_MS`: 1200
   - `VITE_APP_URL`: Your Vercel URL (add after first deploy)

5. Click "Deploy"

### 3.3 Update Supabase Auth Settings
1. After deployment, copy your Vercel URL
2. Go to Supabase Dashboard > Authentication > URL Configuration
3. Add your Vercel URL to:
   - Site URL
   - Redirect URLs

## Step 4: Testing

### 4.1 Create Test Account
1. Visit your deployed site
2. Click "Sign up for free"
3. Enter email and password
4. Complete profile setup
5. Verify you can:
   - Create a service
   - Browse services
   - Send messages
   - Create bookings

### 4.2 Test Flows
- [ ] Sign up → Profile setup → Browse
- [ ] Login → Dashboard
- [ ] Create service → View on browse
- [ ] Search services
- [ ] Message another user
- [ ] Request booking
- [ ] Accept/decline booking
- [ ] Complete booking → Leave review

## Troubleshooting

### Issue: "Missing Supabase environment variables"
- Check `.env` file exists and has correct values
- Restart dev server after changing `.env`

### Issue: "Failed to create profile"
- Verify SQL schema was run correctly
- Check RLS policies are enabled
- Verify user is authenticated

### Issue: "Avatar upload fails"
- Verify `avatars` bucket exists in Supabase Storage
- Check bucket is set to public
- Verify file size is under 5MB

### Issue: "Services not showing"
- Check services table has data
- Verify RLS policy allows public reads
- Check browser console for errors

## Next Steps

1. **Email Verification**: Enable in Supabase Auth settings
2. **Custom Domain**: Add in Vercel project settings
3. **Analytics**: Add Vercel Analytics
4. **Monitoring**: Setup Sentry or similar
5. **Backups**: Configure Supabase backups

## Support

For issues, check:
- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs
- Project README: README.md
