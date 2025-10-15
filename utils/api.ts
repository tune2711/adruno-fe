export async function apiFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  // Always read token fresh from localStorage in case it changed during the session
  let token: string | null = null;
  try {
    const stored = localStorage.getItem('user');
    if (stored) {
      const u = JSON.parse(stored);
      token = u?.token ?? null;
    }
  } catch (e) {
    // ignore parse errors
    token = null;
  }

  const headers = new Headers(init?.headers ?? {});
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(input, { ...(init ?? {}), headers });

  // If unauthorized, notify app so AuthProvider can react (logout/redirect)
  if (response.status === 401) {
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
    } catch (e) {
      // ignore
    }
    // dispatch an event so AuthContext can logout centrally
    try { window.dispatchEvent(new CustomEvent('auth:unauthorized')); } catch (e) { /* ignore */ }
  }

  return response;
}

export default apiFetch;
