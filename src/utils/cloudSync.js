/**
 * Pashyanti 3.0 Cloud Sync Client
 * Communicates with Cloudflare Worker and D1 Database
 */

export function resolveApiUrl(path, customBase = '') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (customBase && customBase.trim()) {
    const base = customBase.trim().replace(/\/+$/, '');
    return `${base}${cleanPath}`;
  }
  return cleanPath;
}

/**
 * Check Worker and D1 database health
 */
export async function checkCloudHealth(customBase = '') {
  try {
    const url = resolveApiUrl('/api/health', customBase);
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'error', message: err.message, database: { connected: false } };
  }
}

/**
 * Sign in with Google ID token credential
 */
export async function authenticateWithGoogle(credential, customBase = '') {
  const url = resolveApiUrl('/api/auth/google', customBase);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || data.details || 'Failed to authenticate with Google');
  }
  return data; // { token, user }
}

/**
 * Sign in with Demo / Test Devotee profile
 */
export async function authenticateWithDemo(name = 'Sadhak Devotee', email = 'bhakt@pashyanti.org', customBase = '') {
  const url = resolveApiUrl('/api/auth/demo', customBase);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to authenticate demo user');
  }
  return data; // { token, user }
}

/**
 * Fetch current user profile
 */
export async function fetchCurrentUser(token, customBase = '') {
  if (!token) return null;
  const url = resolveApiUrl('/api/auth/me', customBase);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

/**
 * Pull latest state from Cloudflare D1
 */
export async function pullCloudState(token, customBase = '') {
  if (!token) throw new Error('No authentication token provided');
  const url = resolveApiUrl('/api/sync', customBase);
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache',
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to pull cloud sync data');
  }
  return data; // { exists: boolean, data?: {...}, revision, serverUpdatedAt }
}

/**
 * Push local state to Cloudflare D1 (Smart Merge)
 */
export async function pushCloudState(payload, token, customBase = '', forceOverwrite = false) {
  if (!token) throw new Error('No authentication token provided');
  const url = resolveApiUrl('/api/sync', customBase);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...payload,
      forceOverwrite,
      clientUpdatedAt: new Date().toISOString(),
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to push cloud sync data');
  }
  return data; // { success: true, revision, serverUpdatedAt, data: {...merged} }
}
