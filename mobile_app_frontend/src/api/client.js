const API_BASE = process.env.REACT_APP_API_BASE || process.env.REACT_APP_BACKEND_URL || '';
const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

/**
 * PUBLIC_INTERFACE
 * apiFetch
 * Wrapper around fetch that attaches JWT and handles JSON.
 */
export async function apiFetch(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const url = `${API_BASE}${path}`;
  const opts = {
    method,
    headers: { ...DEFAULT_HEADERS, ...headers },
  };
  if (auth) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      opts.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  if (body !== undefined) {
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(url, opts);
    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      throw { status: res.status, data };
    }
    return data;
  } catch (err) {
    // Do not log sensitive info
    throw err;
  }
}

// PUBLIC_INTERFACE
export function getEnv() {
  /** Returns resolved environment URLs for diagnostics. */
  return {
    API_BASE: API_BASE || '(unset)',
    BACKEND_URL: process.env.REACT_APP_BACKEND_URL || '(unset)',
    WS_URL: process.env.REACT_APP_WS_URL || '(unset)',
    NODE_ENV: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV,
  };
}
