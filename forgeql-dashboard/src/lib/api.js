const API_BASE = '/api';

function getAuthHeader() {
  const token = sessionStorage.getItem('forge_jwt_token') || 'admin-secret-key';
  const authValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return {
    'Content-Type': 'application/json',
    'Authorization': authValue,
  };
}

export async function executeQuery(payload) {
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function executeRawQuery(bodyStr) {
  let bodyData = bodyStr.trim();
  if (!bodyData.startsWith('{') && !bodyData.startsWith('[')) {
    bodyData = JSON.stringify({ fql: bodyData });
  }
  const res = await fetch(`${API_BASE}/query`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: bodyData,
  });
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/stats`);
  return res.json();
}

export async function getMetrics() {
  const res = await fetch(`${API_BASE}/metrics`);
  return res.json();
}

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return { ok: res.ok, data: await res.json() };
}
