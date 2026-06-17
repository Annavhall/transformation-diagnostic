# Transformation Diagnostic — Setup Guide

This app gives participants a conversational AI interview and saves their responses
so you can generate an aggregated report. Follow these steps to deploy it.

---

## Step 1 — Get an Anthropic API Key (5 min)

1. Go to https://console.anthropic.com and create a free account
2. Click **API Keys** in the left menu → **Create Key**
3. Copy the key (starts with `sk-ant-…`) — you'll need it in Step 4

---

## Step 2 — Create an Upstash Redis database (3 min)

Upstash stores participant responses. It's free and requires no server.

1. Go to https://upstash.com and create a free account
2. Click **Create Database** → choose a name → select a region → click **Create**
3. Once created, click your database → scroll to **REST API**
4. Copy **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN** — you'll need these in Step 4

---

## Step 3 — Deploy to Vercel (5 min)

Vercel hosts the app for free.

1. Go to https://vercel.com and create a free account (you can sign in with GitHub)
2. Click **Add New → Project**
3. Choose **"Deploy from the Vercel CLI"** OR upload this folder:
   - Install Vercel CLI: `npm install -g vercel`
   - Open Terminal in this folder and run: `vercel`
   - Follow the prompts (accept all defaults)
4. Vercel will give you a URL like `https://your-app.vercel.app`

---

## Step 4 — Set Environment Variables (3 min)

In the Vercel dashboard for your project:

1. Go to **Settings → Environment Variables**
2. Add these four variables:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your key from Step 1 |
| `UPSTASH_REDIS_REST_URL` | URL from Step 2 |
| `UPSTASH_REDIS_REST_TOKEN` | Token from Step 2 |
| `ADMIN_PASSWORD` | A password you choose for the admin dashboard |

3. Click **Save** then **Redeploy** the project

---

## Step 5 — Share with participants

Send participants this link:
```
https://your-app.vercel.app
```

Your admin dashboard is at:
```
https://your-app.vercel.app/admin
```

---

## How it works

- **Participants** → visit the site, click Begin, complete the interview, click
  "Generate & Submit Summary"
- **You** → visit `/admin`, enter your password, see all submissions and ratings,
  click "Generate Aggregate Report" for a synthesised narrative

---

## Customising the program name

Open `public/index.html` and `public/admin.html` in a text editor and search for
"Transformation Program" to update the name to your specific program.

---

## Costs

| Service | Free tier | Likely cost for 20 participants |
|---|---|---|
| Vercel | 100GB bandwidth/month | Free |
| Upstash | 10,000 commands/day | Free |
| Anthropic API | Pay per use | ~$0.50–$2.00 total |

Total expected cost: under $2 for a 20-person diagnostic.
