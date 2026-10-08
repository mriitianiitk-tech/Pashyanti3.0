/**
 * Pashyanti 3.0 - Cloudflare Worker Backend
 * Powered by Cloudflare D1 Database & Web Crypto
 * Features:
 * - Google Identity Services (GIS) ID Token verification
 * - Seamless Multi-device 2-Way State Sync (Sadhana Mantras, Naam Japa, Counters, Preferences)
 * - Conflict-free Smart Merge strategy across phones, tablets & desktop
 * - Secure HMAC-SHA256 JWT sessions
 * - Demo / Test authentication fallback for instant verification
 */

// Simple base64url utilities for Web Crypto JWT
function base64UrlEncode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Generate HMAC-SHA256 JWT
async function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret || 'pashyanti-sacred-vault-secret-key-3.0'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const signatureBytes = new Uint8Array(signature);
  let signatureBinary = '';
  for (let i = 0; i < signatureBytes.byteLength; i++) {
    signatureBinary += String.fromCharCode(signatureBytes[i]);
  }
  const encodedSignature = btoa(signatureBinary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return `${data}.${encodedSignature}`;
}

// Verify HMAC-SHA256 JWT
async function verifyJwt(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;
    const data = `${headerB64}.${payloadB64}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret || 'pashyanti-sacred-vault-secret-key-3.0'),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    let base64Sig = sigB64.replace(/-/g, '+').replace(/_/g, '/');
    while (base64Sig.length % 4) {
      base64Sig += '=';
    }
    const sigBinary = atob(base64Sig);
    const sigBytes = new Uint8Array(sigBinary.length);
    for (let i = 0; i < sigBinary.length; i++) {
      sigBytes[i] = sigBinary.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(data));
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

// CORS headers response builder
function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };
}

function jsonResponse(data, status = 200, origin = '*') {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
    },
  });
}

// Extract bearer token from Authorization header
function getAuthToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  return authHeader.substring(7).trim();
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';

    // Handle preflight OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    const pathname = url.pathname;
    const secret = env.JWT_SECRET || 'pashyanti-sacred-vault-secret-key-3.0';

    try {
      // ----------------------------------------------------
      // 1. Health check & database verification
      // ----------------------------------------------------
      if (pathname === '/api/health') {
        let dbOk = false;
        let dbInfo = 'No D1 binding';
        if (env.DB) {
          try {
            const res = await env.DB.prepare('SELECT 1 as ok').first();
            dbOk = res?.ok === 1;
            dbInfo = dbOk ? 'D1 connected' : 'D1 query failed';
          } catch (e) {
            dbInfo = 'D1 error: ' + e.message;
          }
        }
        return jsonResponse({
          status: 'ok',
          service: 'Pashyanti 3.0 Cloudflare Worker',
          timestamp: new Date().toISOString(),
          database: { connected: dbOk, info: dbInfo }
        }, 200, origin);
      }

      // ----------------------------------------------------
      // 2. Google OAuth Authentication: POST /api/auth/google
      // ----------------------------------------------------
      if (pathname === '/api/auth/google' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const credential = body.credential;

        if (!credential) {
          return jsonResponse({ error: 'Missing Google credential token' }, 400, origin);
        }

        // Validate Google token with Google's tokeninfo API
        let googleUser = null;
        try {
          const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
          const verifyRes = await fetch(verifyUrl);
          if (!verifyRes.ok) {
            const errText = await verifyRes.text();
            return jsonResponse({ error: 'Invalid Google token', details: errText }, 401, origin);
          }
          googleUser = await verifyRes.json();
        } catch (e) {
          return jsonResponse({ error: 'Failed to verify with Google: ' + e.message }, 500, origin);
        }

        // Verify audience if GOOGLE_CLIENT_ID is provided
        if (env.GOOGLE_CLIENT_ID && googleUser.aud !== env.GOOGLE_CLIENT_ID) {
          return jsonResponse({ error: 'Google Client ID mismatch' }, 401, origin);
        }

        const userId = googleUser.sub;
        const email = googleUser.email;
        const name = googleUser.name || email.split('@')[0];
        const picture = googleUser.picture || '';
        const now = new Date().toISOString();

        // Upsert user in Cloudflare D1
        if (env.DB) {
          await env.DB.prepare(`
            INSERT INTO users (id, email, name, picture, created_at, last_login_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              picture = excluded.picture,
              last_login_at = excluded.last_login_at
          `).bind(userId, email, name, picture, now, now).run();
        }

        // Issue Pashyanti JWT (valid for 90 days)
        const exp = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60);
        const sessionToken = await signJwt({ sub: userId, email, name, picture, exp }, secret);

        return jsonResponse({
          token: sessionToken,
          user: { id: userId, email, name, picture }
        }, 200, origin);
      }

      // ----------------------------------------------------
      // 3. Demo / Test User Login: POST /api/auth/demo
      // ----------------------------------------------------
      if (pathname === '/api/auth/demo' && request.method === 'POST') {
        const body = await request.json().catch(() => ({}));
        const demoEmail = body.email || 'bhakt@pashyanti.org';
        const demoName = body.name || 'Sadhak Devotee';
        const userId = 'demo-' + btoa(demoEmail).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16);
        const picture = 'https://api.dicebear.com/7.x/bottts/svg?seed=PashyantiSadhak';
        const now = new Date().toISOString();

        if (env.DB) {
          await env.DB.prepare(`
            INSERT INTO users (id, email, name, picture, created_at, last_login_at)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              picture = excluded.picture,
              last_login_at = excluded.last_login_at
          `).bind(userId, demoEmail, demoName, picture, now, now).run();
        }

        const exp = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60);
        const sessionToken = await signJwt({ sub: userId, email: demoEmail, name: demoName, picture, exp }, secret);

        return jsonResponse({
          token: sessionToken,
          user: { id: userId, email: demoEmail, name: demoName, picture, isDemo: true }
        }, 200, origin);
      }

      // ----------------------------------------------------
      // Protected Routes Middleware: Check JWT session
      // ----------------------------------------------------
      const token = getAuthToken(request);
      let sessionUser = null;
      if (token) {
        sessionUser = await verifyJwt(token, secret);
      }

      // ----------------------------------------------------
      // 4. Current User Info: GET /api/auth/me
      // ----------------------------------------------------
      if (pathname === '/api/auth/me') {
        if (!sessionUser) {
          return jsonResponse({ error: 'Unauthorized' }, 401, origin);
        }

        let userRecord = sessionUser;
        if (env.DB) {
          const dbUser = await env.DB.prepare('SELECT id, email, name, picture, created_at, last_login_at FROM users WHERE id = ?')
            .bind(sessionUser.sub).first();
          if (dbUser) userRecord = dbUser;
        }

        return jsonResponse({ user: userRecord }, 200, origin);
      }

      // ----------------------------------------------------
      // 5. Cloud D1 Multi-Device Sync: GET /api/sync
      // ----------------------------------------------------
      if (pathname === '/api/sync' && request.method === 'GET') {
        if (!sessionUser) {
          return jsonResponse({ error: 'Unauthorized: login required to sync' }, 401, origin);
        }

        if (!env.DB) {
          return jsonResponse({ error: 'D1 database not bound' }, 500, origin);
        }

        const row = await env.DB.prepare(`
          SELECT * FROM user_sync_data WHERE user_id = ?
        `).bind(sessionUser.sub).first();

        if (!row) {
          return jsonResponse({ exists: false, message: 'No cloud data yet for user' }, 200, origin);
        }

        return jsonResponse({
          exists: true,
          data: {
            sadhanaMantras: JSON.parse(row.sadhana_mantras || '[]'),
            naamJapaStotras: JSON.parse(row.naam_japa_stotras || '[]'),
            naamJapaSettings: JSON.parse(row.naam_japa_settings || '{}'),
            naamJapaStats: JSON.parse(row.naam_japa_stats || '{}'),
            preferences: JSON.parse(row.preferences || '{}'),
          },
          revision: row.revision,
          clientUpdatedAt: row.client_updated_at,
          serverUpdatedAt: row.server_updated_at,
        }, 200, origin);
      }

      // ----------------------------------------------------
      // 6. Cloud D1 Multi-Device Sync: POST /api/sync (Smart 2-Way Merge)
      // ----------------------------------------------------
      if (pathname === '/api/sync' && request.method === 'POST') {
        if (!sessionUser) {
          return jsonResponse({ error: 'Unauthorized: login required to sync' }, 401, origin);
        }

        if (!env.DB) {
          return jsonResponse({ error: 'D1 database not bound' }, 500, origin);
        }

        const payload = await request.json().catch(() => ({}));
        const {
          sadhanaMantras = [],
          naamJapaStotras = [],
          naamJapaSettings = {},
          naamJapaStats = {},
          preferences = {},
          clientUpdatedAt = new Date().toISOString(),
          forceOverwrite = false
        } = payload;

        const userId = sessionUser.sub;
        const now = new Date().toISOString();

        // Retrieve existing cloud data for this user
        const existing = await env.DB.prepare(`
          SELECT * FROM user_sync_data WHERE user_id = ?
        `).bind(userId).first();

        let mergedSadhanaMantras = sadhanaMantras;
        let mergedNaamJapaStotras = naamJapaStotras;
        let mergedNaamJapaStats = naamJapaStats;
        let mergedNaamJapaSettings = naamJapaSettings;
        let mergedPreferences = preferences;
        let newRevision = 1;

        if (existing && !forceOverwrite) {
          newRevision = (existing.revision || 1) + 1;
          const serverSadhana = JSON.parse(existing.sadhana_mantras || '[]');
          const serverStotras = JSON.parse(existing.naam_japa_stotras || '[]');
          const serverStats = JSON.parse(existing.naam_japa_stats || '{}');
          const serverSettings = JSON.parse(existing.naam_japa_settings || '{}');
          const serverPrefs = JSON.parse(existing.preferences || '{}');

          // SMART MERGE: Sadhana Mantras
          // Match by id. Retain higher chant count so progress is never lost across devices.
          const mantraMap = new Map();
          for (const m of serverSadhana) {
            if (m.id) mantraMap.set(m.id, { ...m });
          }
          for (const m of sadhanaMantras) {
            if (!m.id) continue;
            if (mantraMap.has(m.id)) {
              const prev = mantraMap.get(m.id);
              const bestChants = Math.max(prev.chants || 0, m.chants || 0);
              const bestMalas = Math.max(prev.malas || 0, m.malas || 0);
              mantraMap.set(m.id, {
                ...prev,
                ...m,
                chants: bestChants,
                malas: bestMalas,
              });
            } else {
              mantraMap.set(m.id, m);
            }
          }
          mergedSadhanaMantras = Array.from(mantraMap.values());

          // SMART MERGE: Naam Japa Stotras (Union by ID)
          const stotraMap = new Map();
          for (const s of serverStotras) {
            if (s.id) stotraMap.set(s.id, s);
          }
          for (const s of naamJapaStotras) {
            if (s.id) stotraMap.set(s.id, s);
          }
          mergedNaamJapaStotras = Array.from(stotraMap.values());

          // SMART MERGE: Naam Japa Counters (Keep highest count)
          mergedNaamJapaStats = {
            totalCount: Math.max(serverStats.totalCount || 0, naamJapaStats.totalCount || 0),
            sessionCount: Math.max(serverStats.sessionCount || 0, naamJapaStats.sessionCount || 0)
          };

          // Merge Settings & Preferences (client changes override if passed)
          mergedNaamJapaSettings = { ...serverSettings, ...naamJapaSettings };
          mergedPreferences = { ...serverPrefs, ...preferences };
        } else if (existing && forceOverwrite) {
          newRevision = (existing.revision || 1) + 1;
        }

        // Save consolidated merged state to D1
        await env.DB.prepare(`
          INSERT INTO user_sync_data (
            user_id,
            sadhana_mantras,
            naam_japa_stotras,
            naam_japa_settings,
            naam_japa_stats,
            preferences,
            revision,
            client_updated_at,
            server_updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id) DO UPDATE SET
            sadhana_mantras = excluded.sadhana_mantras,
            naam_japa_stotras = excluded.naam_japa_stotras,
            naam_japa_settings = excluded.naam_japa_settings,
            naam_japa_stats = excluded.naam_japa_stats,
            preferences = excluded.preferences,
            revision = excluded.revision,
            client_updated_at = excluded.client_updated_at,
            server_updated_at = excluded.server_updated_at
        `).bind(
          userId,
          JSON.stringify(mergedSadhanaMantras),
          JSON.stringify(mergedNaamJapaStotras),
          JSON.stringify(mergedNaamJapaSettings),
          JSON.stringify(mergedNaamJapaStats),
          JSON.stringify(mergedPreferences),
          newRevision,
          clientUpdatedAt,
          now
        ).run();

        return jsonResponse({
          success: true,
          revision: newRevision,
          serverUpdatedAt: now,
          data: {
            sadhanaMantras: mergedSadhanaMantras,
            naamJapaStotras: mergedNaamJapaStotras,
            naamJapaSettings: mergedNaamJapaSettings,
            naamJapaStats: mergedNaamJapaStats,
            preferences: mergedPreferences,
          }
        }, 200, origin);
      }

      // Default fallback
      return jsonResponse({ error: 'Endpoint not found', path: pathname }, 404, origin);

    } catch (err) {
      console.error('Pashyanti Worker Error:', err);
      return jsonResponse({ error: 'Internal Server Error', message: err.message }, 500, origin);
    }
  }
};
