import { log } from "./util.js";

export const CLIENT_ID = "046448f805d547e7b5fdee809c88561c";
export const REDIRECT_URI = (() => {
  const { hostname } = window.location;
  if (hostname === "127.0.0.1" || hostname === "localhost") {
    return "http://127.0.0.1:8080/";
  }
  return "https://berlinsk.github.io/PlaylistSpotifyApp/";
})();
export const SCOPES = [
  "user-follow-read",
  "playlist-modify-private",
  "playlist-modify-public"
].join(" ");

function base64urlencode(a) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(a)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function sha256(s) {
  const buf = new TextEncoder().encode(s);
  return await crypto.subtle.digest("SHA-256", buf);
}
function randomString(len=64) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = ''; for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function saveToken(t) { localStorage.setItem("sp_token", JSON.stringify(t)); }
function loadToken() { try { return JSON.parse(localStorage.getItem("sp_token")||""); } catch { return null; } }
export function clearToken() { localStorage.removeItem("sp_token"); }

export async function refreshAccessToken() {
  const tok = loadToken();
  if (!tok || !tok.refresh_token) return null;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: tok.refresh_token,
    client_id: CLIENT_ID
  });
  const r = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!r.ok) { clearToken(); return null; }
  const j = await r.json();
  const now = Math.floor(Date.now()/1000);
  const next = {
    access_token: j.access_token,
    refresh_token: j.refresh_token || tok.refresh_token,
    expires_at: now + (j.expires_in || 3600)
  };
  saveToken(next);
  return next.access_token;
}

export async function getAccessToken() {
  let tok = loadToken();
  const now = Math.floor(Date.now()/1000);
  if (tok && tok.expires_at && tok.expires_at - 30 > now) return tok.access_token;
  if (tok && tok.refresh_token) return await refreshAccessToken();
  return null;
}

export async function beginLogin() {
  const codeVerifier = randomString(64);
  const codeChallenge = base64urlencode(await sha256(codeVerifier));
  sessionStorage.setItem("pkce_verifier", codeVerifier);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    show_dialog: "true"
  });
  location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function handleRedirect() {
  const params = new URLSearchParams(location.search);
  const code = params.get("code");
  const error = params.get("error");
  if (error) { log("auth error: " + error); return; }
  if (!code) return;

  const verifier = sessionStorage.getItem("pkce_verifier");
  sessionStorage.removeItem("pkce_verifier");
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: verifier
  });
  const r = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
  if (!r.ok) { log("cannot exchange code for token"); return; }
  const j = await r.json();
  const now = Math.floor(Date.now()/1000);
  localStorage.setItem("sp_token", JSON.stringify({
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: now + (j.expires_in || 3600)
  }));
  history.replaceState({}, "", REDIRECT_URI);
}

export function doLogout() { clearToken(); location.reload(); }