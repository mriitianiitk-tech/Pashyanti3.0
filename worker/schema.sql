-- =========================================================
-- Pashyanti 3.0 Cloudflare D1 Database Schema
-- Multi-device Sync, Google Authentication & Chanting Vault
-- =========================================================

-- 1. Users Table (Google Authentication & Profiles)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,                       -- Google Subject ID (sub) or unique user ID
    email TEXT UNIQUE NOT NULL,                -- User primary email address
    name TEXT,                                 -- Display name
    picture TEXT,                              -- Google profile avatar image URL
    created_at TEXT NOT NULL,                  -- ISO timestamp of first registration
    last_login_at TEXT NOT NULL                -- ISO timestamp of most recent login
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. User Sync Data (Core state synced across devices)
CREATE TABLE IF NOT EXISTS user_sync_data (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    sadhana_mantras TEXT NOT NULL DEFAULT '[]',     -- JSON: custom & preset mantras, chant counts, targets, malas
    naam_japa_stotras TEXT NOT NULL DEFAULT '[]',   -- JSON: imported stotras, verses, categories
    naam_japa_settings TEXT NOT NULL DEFAULT '{}',  -- JSON: active stotra, mode, randomScope, fontSize, showMeaning
    naam_japa_stats TEXT NOT NULL DEFAULT '{}',     -- JSON: { sessionCount, totalCount }
    preferences TEXT NOT NULL DEFAULT '{}',         -- JSON: { theme, soundEnabled, vibrateEnabled, fontFamily, accentColor }
    revision INTEGER NOT NULL DEFAULT 1,            -- Incremental sync counter for conflict resolution
    client_updated_at TEXT NOT NULL,                -- Last client-side modification timestamp
    server_updated_at TEXT NOT NULL                 -- Timestamp when saved to Cloudflare D1
);

CREATE INDEX IF NOT EXISTS idx_sync_updated_at ON user_sync_data(server_updated_at);

-- 3. Japa Sessions / Daily Log History (Optional multi-device milestones)
CREATE TABLE IF NOT EXISTS japa_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,                             -- 'sadhana' or 'naamjapa'
    item_id TEXT,                                   -- Mantra or Stotra ID
    item_title TEXT,                                -- Mantra name / divine name
    chants_added INTEGER NOT NULL DEFAULT 1,
    date TEXT NOT NULL,                             -- YYYY-MM-DD
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_history_user_date ON japa_history(user_id, date);
