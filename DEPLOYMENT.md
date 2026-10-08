# Pashyanti 3.0 • Cloudflare D1 & Worker Deployment Guide

This guide walks you through deploying the **Pashyanti 3.0** Cloudflare Worker backend with **Cloudflare D1 Database** and **Google Authentication** for real-time multi-device synchronization.

---

## 1. Prerequisites

1. A [Cloudflare Account](https://dash.cloudflare.com/) (Free tier works completely).
2. [Node.js](https://nodejs.org/) installed (v18 or newer).
3. Cloudflare Wrangler CLI (already configured in `package.json`).

---

## 2. Cloudflare D1 Database Setup

### Step A: Authenticate Wrangler
Run the following command in your terminal to log in to your Cloudflare account:
```bash
npx wrangler login
```

### Step B: Create your Production D1 Database
Create the database on Cloudflare:
```bash
npx wrangler d1 create pashyanti-db
```

This will print an output similar to:
```toml
[[d1_databases]]
binding = "DB"
database_name = "pashyanti-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### Step C: Update `wrangler.toml`
Open `wrangler.toml` and update the `database_id` with the ID generated in Step B:
```toml
[[d1_databases]]
binding = "DB"
database_name = "pashyanti-db"
database_id = "YOUR_D1_DATABASE_ID_FROM_STEP_B"
```

### Step D: Initialize D1 Database Schema
Apply the tables and indexes to your remote Cloudflare D1 database:
```bash
npm run d1:init:remote
```
*(Or locally for testing: `npm run d1:init:local`)*

---

## 3. Google OAuth 2.0 Credentials (Google Sign-In)

To allow users to sign in with their Google accounts:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `Pashyanti Japa`).
3. Navigate to **APIs & Services > OAuth consent screen**:
   - User Type: **External**
   - Fill in App name (`Pashyanti 3.0`), User support email, and Developer contact.
4. Navigate to **APIs & Services > Credentials**:
   - Click **Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized JavaScript origins**:
     - `http://localhost:5180` (for local development)
     - `http://localhost:8787`
     - Your production domain (e.g. `https://pashyanti.pages.dev` or `https://yourdomain.com`).
5. Copy your **Client ID** (it looks like `123456789-xxxxxxxx.apps.googleusercontent.com`).
6. Set this Client ID in `wrangler.toml` or in the Pashyanti Settings modal.
   - For Worker secret in Cloudflare:
     ```bash
     npx wrangler secret put GOOGLE_CLIENT_ID
     ```
   - For JWT session signing secret:
     ```bash
     npx wrangler secret put JWT_SECRET
     ```

---

## 4. Deploying the Cloudflare Worker

Deploy your worker to Cloudflare's global edge network:
```bash
npm run worker:deploy
```

Cloudflare will give you your live Worker URL (e.g., `https://pashyanti3-worker.<your-subdomain>.workers.dev`).

---

## 5. Deploying the Frontend (Cloudflare Pages or GitHub Pages)

### Option 1: Cloudflare Pages (Recommended)
1. In Cloudflare Dashboard, go to **Workers & Pages > Create > Pages > Connect to Git**.
2. Select repository: `mriitianiitk-tech/Pashyanti3.0`.
3. Build Settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. In Pages Project Settings > **Functions / Variables**, add your Worker route or proxy `/api/*` to your Worker, or enter the Worker URL in the Pashyanti Settings view.

### Option 2: Deploy Static Bundle
You can also deploy the contents of the `dist/` directory to any static hosting service (Netlify, Vercel, Firebase Hosting, or GitHub Pages).

---

## 6. Testing & Verifying Multi-Device Sync

1. Open Pashyanti 3.0 on Device 1 (e.g., PC).
2. Tap the **Sync Cloud** button in the header.
3. Sign in with Google (or tap **Instant Devotee Login** to test).
4. Chant mantras or import your favourite stotras.
5. Open Pashyanti 3.0 on Device 2 (e.g., Android phone).
6. Sign in with the same account — all your mantras, custom stotras, and chant counts will automatically synchronize from Cloudflare D1!
