# Pashyanti 3.0 (पश्यन्ती) • Sacred Sadhana & Cloud Japa PWA

> **A Sacred Space for Mindful Chanting, Stotras, Sahasranamas and Cloud-Synced Naam Japa**  
> Powered by React, Vite, Tailwind CSS, Cloudflare Workers & Cloudflare D1 Database.

[![PWA Ready](https://img.shields.io/badge/PWA-Installable-orange?style=flat-square&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Database](https://img.shields.io/badge/Database-Cloudflare_D1-f38020?style=flat-square&logo=cloudflare)](https://developers.cloudflare.com/d1/)
[![Auth](https://img.shields.io/badge/Auth-Google_OAuth_2.0-4285F4?style=flat-square&logo=google)](https://developers.google.com/identity/gsi/web)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square)](LICENSE)

---

## 🌟 What's New in Pashyanti 3.0

1. **Cloudflare D1 Database Integration**:
   - High-performance, globally distributed SQLite on Cloudflare's edge network.
   - Robust schema with relational indexing for user profiles, chant sync data, and session telemetry.
2. **Google Identity Authentication**:
   - Secure sign-in using Google Identity Services (GIS).
   - Each devotee gets their own private sacred cloud vault.
3. **Seamless Multi-Device 2-Way Sync**:
   - Real-time conflict-free smart merge across Android smartphones, iPhones, tablets, and desktop computers.
   - Preserves highest chant counts and combines custom stotras without data loss.
4. **Offline-First Resilience**:
   - Continue chanting anywhere, even in remote pilgrimages with zero network coverage.
   - Progress queues in `localStorage` and automatically syncs to Cloudflare D1 as soon as connectivity resumes.
5. **Sacred Aesthetics & Acoustics**:
   - Harmonic Tibetan Singing Bowl bell acoustics synthesized with the Web Audio API.
   - Haptic vibration feedback on tap.
   - Devanagari & Sanskrit-tailored typography (Martel, Mukta, Cinzel).
   - Day / Night meditation themes (Sacred Dark & Temple Sandstone Light).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
To run both the Vite frontend and local Cloudflare Worker with D1:

- **Frontend (Vite dev server)**:
  ```bash
  npm run dev
  ```
  Runs at [http://localhost:5180](http://localhost:5180).

- **Cloudflare Worker & Local D1**:
  ```bash
  # Initialize local D1 database tables
  npm run d1:init:local

  # Start Worker dev server with D1 binding
  npm run worker:dev
  ```
  Worker runs at [http://localhost:8787](http://localhost:8787) (proxied automatically via Vite at `/api`).

---

## 📂 Project Architecture

```
Pashyanti3.0/
├── worker/
│   ├── index.js             # Cloudflare Worker API & Smart 2-Way Sync Engine
│   └── schema.sql           # Cloudflare D1 database schema & indexes
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   └── AuthModal.jsx     # Google Sign-In & D1 Sync management
│   │   ├── Header.jsx            # Brand, cloud sync badge, PWA install & controls
│   │   ├── Navigation.jsx        # Desktop top nav & mobile bottom nav
│   │   ├── NaamJapa/             # Sacred Naam Japa chant counter & stotra displays
│   │   ├── Sadhana/              # Custom Sadhana mantras, targets & malas
│   │   ├── Treasury/             # Stotra repository & CSV batch importer
│   │   └── Settings/             # Themes, fonts, audio, D1 sync diagnostics
│   ├── context/
│   │   └── AppContext.jsx        # Central state, debounced cloud sync & auth
│   ├── utils/
│   │   ├── cloudSync.js          # API client for Cloudflare Worker & D1
│   │   ├── audio.js              # Synthesized Tibetan Singing Bowl acoustics
│   │   └── csvParser.js          # Stotra CSV parsing & validation
│   └── App.jsx
├── wrangler.toml            # Cloudflare Worker & D1 binding configuration
├── vite.config.js           # Vite dev server with /api proxy to Worker
├── push.sh                  # One-click Git push automation (macOS/Linux)
├── push.bat                 # One-click Git push automation (Windows)
└── DEPLOYMENT.md            # Comprehensive Cloudflare & Google OAuth guide
```

---

## ☁️ Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions for Cloudflare Pages, Cloudflare Workers, and Google OAuth credentials.

---

## 📜 Repository
GitHub: [https://github.com/mriitianiitk-tech/Pashyanti3.0.git](https://github.com/mriitianiitk-tech/Pashyanti3.0.git)
