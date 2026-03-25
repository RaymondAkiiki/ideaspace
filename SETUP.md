# Ideaspace — Complete Setup Guide

---

## Overview

This guide walks you through every provider setup you need before the app will run. Do these in order.

---

## 1. Prerequisites

Install Node.js 18+ if you don't have it:
- Download from https://nodejs.org (LTS version)
- Verify: `node -v` should print 18.x or higher

---

## 2. Clone & Install

```bash
# In your terminal:
cd ~/projects   # or wherever you keep code
# Unzip or clone the project, then:
cd ideaspace
npm install
```

---

## 3. Supabase (Free Database)

### Create account & project
1. Go to https://supabase.com → Sign up (free)
2. Click **New project**
3. Name it `ideaspace`
4. Choose a region close to you
5. Set a database password (save it somewhere safe)
6. Click **Create new project** — wait ~1 minute for it to provision

### Run the schema
1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the file `sql/schema.sql` from this project
4. Copy the entire contents and paste it into the SQL editor
5. Click **Run** — you should see "Success. No rows returned"
6. Go to **Table Editor** → confirm the `ideas` table exists

### Get your API keys
1. Go to **Project Settings** (gear icon) → **API**
2. Copy these three values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret key** → `SUPABASE_SERVICE_ROLE_KEY`

> ⚠️ The service role key has full database access. Never expose it to the browser or commit it to git.

---

## 4. OpenAI (AI Processing + Image Generation)

### Create account & get API key
1. Go to https://platform.openai.com → Sign up / Log in
2. Click your profile (top right) → **API keys**
3. Click **Create new secret key**
4. Name it `ideaspace`
5. Copy the key immediately — you won't see it again
6. This is your `OPENAI_API_KEY`

### Add credits
1. Go to **Settings** → **Billing**
2. Add a payment method and load $5–10 of credits
3. Optionally set a monthly spend limit under **Limits**

### Cost estimate
- GPT-4o: ~$0.01–0.05 per idea processed (depending on draft length)
- GPT-4o-mini: ~$0.001 per image prompt generation
- DALL-E 3 (1792×1024): $0.08 per image generated
- **Typical per-idea cost: $0.10–0.15**

> You need access to GPT-4o and DALL-E 3. Both are available on any paid OpenAI account.
> If you want to reduce costs, change `gpt-4o` to `gpt-4o-mini` in `lib/openai.ts` (quality will be lower).

---

## 5. Cloudinary (Image Storage)

### Create account
1. Go to https://cloudinary.com → Sign up (free tier)
2. Free tier gives you: 25GB storage, 25GB bandwidth/month — more than enough

### Get your credentials
1. After signup, go to the **Dashboard**
2. You'll see your credentials at the top:
   - **Cloud name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

> Cloudinary automatically creates the `ideaspace/covers` folder when the first image is uploaded.

---

## 6. Generate Your Password Hash

You never store your plain-text password anywhere. Instead, you store a bcrypt hash.

Run this command in your terminal (replace `yourpassword`):

```bash
node -e "const b=require('bcryptjs');console.log(b.hashSync('yourpassword',12))"
```

If bcryptjs isn't installed yet, run `npm install` first, then try again.

The output will look like:
```
$2b$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Copy the entire output — this is your `ADMIN_PASSWORD_HASH`.

---

## 7. Generate JWT Secret

Run this in your terminal:

```bash
openssl rand -base64 32
```

Or if you don't have openssl:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output — this is your `JWT_SECRET`.

---

## 8. Set Up Environment Variables

```bash
# In the project root:
cp .env.local.example .env.local
```

Now open `.env.local` and fill in every value:

```env
ADMIN_EMAIL=your-actual-email@example.com
ADMIN_PASSWORD_HASH=$2b$12$...   ← from step 6
JWT_SECRET=...                    ← from step 7

NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

OPENAI_API_KEY=sk-...

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abc...

NEXTAUTH_URL=http://localhost:3000
NODE_ENV=development
```

---

## 9. Run Locally

```bash
npm run dev
```

Open http://localhost:3000

- Public site: http://localhost:3000
- Login: http://localhost:3000/login
- Portal: http://localhost:3000/portal (redirects to login if not authenticated)

---

## 10. Deploy to Vercel

### First time setup
1. Push your code to GitHub (make sure `.env.local` is in `.gitignore` — it is by default)
2. Go to https://vercel.com → Sign up with GitHub
3. Click **Add New Project** → Import your repository
4. Vercel auto-detects Next.js — no build config needed
5. Click **Environment Variables** and add every variable from `.env.local`:

| Key | Value |
|-----|-------|
| `ADMIN_EMAIL` | your email |
| `ADMIN_PASSWORD_HASH` | your bcrypt hash |
| `JWT_SECRET` | your random secret |
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase |
| `OPENAI_API_KEY` | from OpenAI |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
| `CLOUDINARY_API_KEY` | from Cloudinary |
| `CLOUDINARY_API_SECRET` | from Cloudinary |
| `NEXTAUTH_URL` | your Vercel URL e.g. `https://ideaspace.vercel.app` |
| `NODE_ENV` | `production` |

6. Click **Deploy**

### After deploy
- Update `NEXTAUTH_URL` in Vercel env vars to match your actual deployment URL
- Redeploy once after adding that URL

---

## 11. Usage Flow

Once deployed:

1. **Go to `/login`** — sign in with your email + password
2. **Go to `/portal`** — your idea dashboard
3. **Click `+ New`** — write your raw draft
4. **On the editor page:**
   - Click **Process with AI** — GPT-4o formats your draft into title, explanation, thinking, and conclusion
   - Review and edit the output — it's fully editable
   - Click **Generate cover** — DALL-E 3 creates a cover image, uploaded to Cloudinary
   - Click **Publish** — idea goes live on the public site
5. **Public site at `/`** shows all published ideas

---

## Troubleshooting

**Login not working**
- Double-check `ADMIN_EMAIL` matches exactly what you type
- Re-run the bcrypt hash command and copy the fresh output to `ADMIN_PASSWORD_HASH`
- Make sure `JWT_SECRET` is set

**AI processing returns error**
- Check your OpenAI API key is valid and has credits
- Check Vercel function logs: Vercel Dashboard → your project → **Functions** tab

**Cover image fails**
- Verify all three Cloudinary env vars are set correctly
- Check Cloudinary dashboard for any usage limits

**Supabase connection fails**
- Confirm the SQL schema was run successfully
- Verify the service role key (not just the anon key) is set as `SUPABASE_SERVICE_ROLE_KEY`

---

## File Structure Reference

```
ideaspace/
├── app/
│   ├── api/
│   │   ├── auth/login/route.ts       ← POST login
│   │   ├── auth/logout/route.ts      ← POST logout
│   │   └── ideas/
│   │       ├── route.ts              ← GET list, POST create
│   │       └── [id]/
│   │           ├── route.ts          ← GET, PUT, DELETE idea
│   │           ├── process/route.ts  ← POST AI text processing
│   │           └── generate-cover/route.ts ← POST image gen
│   ├── ideas/[slug]/page.tsx         ← Public idea detail
│   ├── login/page.tsx                ← Login page
│   ├── portal/
│   │   ├── layout.tsx                ← Portal shell (auth check)
│   │   ├── page.tsx                  ← Ideas list
│   │   └── ideas/
│   │       ├── new/page.tsx          ← New idea form
│   │       └── [id]/page.tsx         ← Idea editor
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx                      ← Public homepage
├── components/
│   ├── DisclaimerBar.tsx
│   ├── PublicNav.tsx
│   ├── StatusBadge.tsx
│   └── portal/PortalNav.tsx
├── lib/
│   ├── auth.ts                       ← JWT sign/verify
│   ├── cloudinary.ts
│   ├── openai.ts
│   ├── slug.ts
│   └── supabase.ts
├── middleware.ts                     ← Protects /portal/*
├── sql/schema.sql                    ← Run once in Supabase
├── types/index.ts
├── .env.local.example
└── SETUP.md                          ← This file
```
