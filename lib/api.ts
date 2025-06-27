// API base URL
export const API_URL = 'http://127.0.0.1:8000';

// Register a new user
export async function register({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
    credentials: 'include', // allow cookies if set
  });
  return res.json();
}

// Login user (returns access_token and refresh_token)
export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('username', username);
  params.append('password', password);
  params.append('scope', '');
  params.append('client_id', 'string');
  params.append('client_secret', '');

  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
    credentials: 'include', // allow cookies for refresh_token
  });
  return res.json();
}

// Get current user (requires access token)
export async function getCurrentUser(token: string) {
  const res = await fetch(`${API_URL}/current_user`, {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  return res.json();
}

// Refresh token (uses refresh_token cookie, returns new access token)
export async function refreshToken() {
  const res = await fetch(`${API_URL}/refresh`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
    },
    credentials: 'include', // send cookies
  });
  return res.json();
}

// Logout (invalidates tokens, uses access_token and refresh_token cookie)
export async function logout(token: string) {
  const res = await fetch(`${API_URL}/logout`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include', // send cookies for refresh_token
  });
  return res.json();
}

// Validate token (checks if access token is valid)
export async function validate(token: string) {
  const res = await fetch(`${API_URL}/validate`, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  return res.json();
}

// Google Auth Login (returns Google OAuth URL, should be used for redirect)
export function getGoogleAuthLoginUrl() {
  return `${API_URL}/auth/google/login`;
}

// Google Auth Callback (exchange code for app tokens)
export async function googleAuthCallback(code: string) {
  const res = await fetch(
    `${API_URL}/auth/google/callback?code=${encodeURIComponent(code)}`,
    {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
      credentials: 'include', // set refresh_token cookie
    }
  );
  return res.json();
}
