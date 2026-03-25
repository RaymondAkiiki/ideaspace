# Ideaspace

A personal idea journal with AI-powered formatting. Write raw thoughts in private, let AI structure them into readable posts, publish to a clean public blog.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=flat-square)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=flat-square)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square)

---

## What it does

You brain-dump a raw idea into a private draft. Hit **Process with AI** — GPT-4o reads your draft and formats it into a structured post with a title, explanation, insight, and conclusion in your own voice. Hit **Generate Cover** — DALL-E 3 creates a contextual cover image, stored permanently on Cloudinary. When you're ready, publish it to the public site with one click.

Every public page carries a disclaimer: *these are thoughts, not advice.*

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Auth | Custom JWT + httpOnly cookies (`jose`, Node `crypto`) |
| Database | Supabase (Postgres) |
| AI — Text | OpenAI GPT-4o |
| AI — Image | OpenAI DALL-E 3 |
| Image Storage | Cloudinary |
| Hosting | Vercel |

---

## Features

- **Single-user portal** — no sign-up, no OAuth, credentials live in env vars
- **Draft scratchpad** — raw brain dump, never shown publicly
- **AI text processing** — GPT-4o structures drafts into title + explanation + insight + conclusion
- **AI cover generation** — DALL-E 3 generates a topic-relevant cover image
- **Permanent image storage** — DALL-E URLs expire; images are re-uploaded to Cloudinary immediately
- **Publish / unpublish toggle** — full control over what goes live
- **Public blog** — clean, minimal reading experience with disclaimer on every page
- **OG meta tags** — every published idea has correct open graph tags for link previews
- **Fixed disclaimer bar** — always visible on public pages

---

## Project Structure

```
ideaspace/
├── app/
│   ├── api/
│   │   ├── auth/login/          # POST — JWT login
│   │   ├── auth/logout/         # POST — clear cookie
│   │   └── ideas/
│   │       ├── route.ts         # GET list, POST create
│   │       └── [id]/
│   │           ├── route.ts         # GET, PUT, DELETE
│   │           ├── process/         # POST — GPT-4o formatting
│   │           └── generate-cover/  # POST — DALL-E 3 + Cloudinary
│   ├── ideas/[slug]/            # Public idea detail page
│   ├── login/                   # Login page
│   ├── portal/                  # Private portal (auth required)
│   │   ├── page.tsx             # Ideas list
│   │   └── ideas/
│   │       ├── new/             # New idea form
│   │       └── [id]/            # Idea editor
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Public homepage
├── components/
│   ├── DisclaimerBar.tsx
│   ├── PublicNav.tsx
│   ├── StatusBadge.tsx
│   └── portal/PortalNav.tsx
├── lib/
│   ├── auth.ts                  # JWT sign / verify
│   ├── cloudinary.ts
│   ├── openai.ts
│   ├── slug.ts
│   └── supabase.ts
├── middleware.ts                 # Protects /portal/* at the edge
├── sql/schema.sql               # Run once in Supabase SQL editor
└── types/index.ts
```

---

## Local Setup

### 1. Prerequisites

- Node.js 18+
- A Supabase project (free tier)
- An OpenAI account with credits
- A Cloudinary account (free tier)

### 2. Install

```bash
git clone https://github.com/RaymondAkiiki/ideaspace.git
cd ideaspace
npm install
```

### 3. Database

1. Go to your Supabase project → **SQL Editor** → **New query**
2. Paste and run the contents of `sql/schema.sql`
3. Confirm the `ideas` table exists in **Table Editor**

### 4. Environment variables

Create `.env.local` in the project root. The safest way on Windows (avoids `$` expansion issues):

```powershell
node -e "
const fs = require('fs');
const env = [
  'ADMIN_EMAIL=you@example.com',
  'ADMIN_PASSWORD=your_plain_password',
  'JWT_SECRET=your_random_32char_string',
  'NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key',
  'SUPABASE_SERVICE_ROLE_KEY=your_service_role_key',
  'OPENAI_API_KEY=sk-your_key',
  'CLOUDINARY_CLOUD_NAME=your_cloud_name',
  'CLOUDINARY_API_KEY=your_api_key',
  'CLOUDINARY_API_SECRET=your_api_secret',
  'NEXTAUTH_URL=http://localhost:3000',
  'NODE_ENV=development'
].join('\n');
fs.writeFileSync('.env.local', env);
console.log('Done.');
"
```

| Variable | Where to get it |
|---|---|
| `ADMIN_EMAIL` | Your login email |
| `ADMIN_PASSWORD` | Your plain text password |
| `JWT_SECRET` | Any random 32+ char string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `OPENAI_API_KEY` | platform.openai.com → API keys |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard |

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

- Public site: `/`
- Login: `/login`
- Portal: `/portal`

---

## Deploying to Vercel

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import this repo
3. Add all environment variables from `.env.local` into Vercel's environment settings
4. Set `NEXTAUTH_URL` to your Vercel deployment URL (e.g. `https://ideaspace.vercel.app`)
5. Set `NODE_ENV` to `production`
6. Deploy

Vercel auto-deploys on every push to `main`.

---

## Usage

1. Go to `/login` and sign in
2. Go to `/portal` — your idea dashboard
3. Click **+ New** — write your raw draft, no formatting needed
4. In the editor:
   - Click **Process with AI** — GPT-4o formats your draft
   - Edit any section manually if needed
   - Click **Generate Cover** — DALL-E 3 creates a relevant cover image
   - Click **Publish** — idea goes live on the public site
5. Public site at `/` shows all published ideas

---

## AI Cost Estimate

| Action | Model | Approx. cost |
|---|---|---|
| Process draft | GPT-4o | ~$0.01–0.05 |
| Generate image prompt | GPT-4o-mini | ~$0.001 |
| Generate cover image | DALL-E 3 | ~$0.08 |
| **Per idea total** | | **~$0.10–0.15** |

---

## Auth Design

No third-party auth providers. Credentials are stored as environment variables. The login route hashes both the submitted password and the stored `ADMIN_PASSWORD` using Node's built-in `crypto.createHash('sha256')` and compares them with `timingSafeEqual` — constant-time comparison to prevent timing attacks. Sessions are JWT tokens signed with `jose`, stored as httpOnly cookies. The middleware protects all `/portal/*` routes at the edge.

---

## Disclaimer

All published ideas are personal thoughts and are not professional advice, recommendations, or finished work. A disclaimer is displayed on every public page.

---

*Built by Raymond Akiiki*
