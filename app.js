const I18N = {
  en: {
    title: "Followed Artists Playlist",
    intro: "Collect all tracks from artists you follow and create a playlist in your account",
    login: "Log in to Spotify",
    logout: "Log out",
    public: "Make playlist public",
    chronological: "Add in chronological order",
    singles: "Singles only",
    build: "Build and create playlist",
    logTitle: "Log",
    scopes: "Requires scopes: ",
    placeholder: "followed artists: all tracks",
    loggedInAs: "logged in as:",
    ready: "ready — click 'build and create playlist'",
    selectAll: "Select all artists",
    selectArtists: "Select artists",
    searchArtists: "Search artists...",
    selectedCount: "Selected: {n}"
  },
  ru: {
    title: "Плейлист из подписанных артистов",
    intro: "Соберите все треки только от артистов, на которых вы подписаны, и создайте плейлист",
    login: "Войти в Spotify",
    logout: "Выйти",
    public: "Сделать плейлист публичным",
    chronological: "Добавлять в хронологическом порядке",
    singles: "Только синглы",
    build: "Собрать и создать плейлист",
    logTitle: "Лог",
    scopes: "Требуются разрешения: ",
    placeholder: "подписанные артисты: все треки",
    loggedInAs: "вы вошли как:",
    ready: "готово — жмите 'собрать и создать плейлист'",
    selectAll: "Выбрать всех артистов",
    selectArtists: "Выбрать артистов",
    searchArtists: "Поиск артистов...",
    selectedCount: "Выбрано: {n}"
  },
  uk: {
    title: "Плейлист із підписаних артистів",
    intro: "Зберіть усі треки лише від артистів, на яких ви підписані, і створіть плейлист",
    login: "Увійти в Spotify",
    logout: "Вийти",
    public: "Зробити плейлист публічним",
    chronological: "Додавати в хронологічному порядку",
    singles: "Лише сингли",
    build: "Зібрати та створити плейлист",
    logTitle: "Лог",
    scopes: "Потрібні дозволи: ",
    placeholder: "підписані артисти: всі треки",
    loggedInAs: "увійшли як:",
    ready: "готово — натисніть 'зібрати та створити плейлист'",
    selectAll: "Вибрати всіх артистів",
    selectArtists: "Вибрати артистів",
    searchArtists: "Пошук артистів...",
    selectedCount: "Вибрано: {n}"
  },
  emoji: {
    title: "🐈🎧📜",
    intro: "🐈🧲🎵 -> 📝📻",
    login: "🐈🔑",
    logout: "🚪👈🏻🐈",
    public: "🐈🌐🐈‍⬛",
    chronological: "🗓️",
    singles: "🐈🎯",
    build: "🐈⚙️✅",
    logTitle: "🐱📒",
    scopes: "🐈🔐: ",
    placeholder: "🐈🎵:",
    loggedInAs: "🐈(YOU)",
    ready: "ok — tap on 🐈⚙️✅",
    selectAll: "🐈✅🎤",
    selectArtists: "🐈🎤✅",
    searchArtists: "🔎🎤...",
    selectedCount: "✅ {n}"
  }
};

const placeholderAvatar = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <rect width="100%" height="100%" fill="#ddd"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-size="12" fill="#999">♪</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
})();

function applyI18n(lang) {
  const dict = I18N[lang] || I18N.en;
  const fmt = (key, params = {}) => {
    let s = dict[key] || I18N.en[key] || "";
    Object.keys(params).forEach(k => {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), params[k]);
    });
    return s;
  };

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const k = el.getAttribute("data-i18n");
    if (k === "selectedCount") {
      const n = el.getAttribute("data-i18n-arg-n") || "0";
      el.textContent = fmt(k, { n });
    } else if (dict[k]) {
      el.textContent = dict[k];
    }
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const k = el.getAttribute("data-i18n-placeholder");
    if (dict[k]) el.setAttribute("placeholder", dict[k]);
  });
  const inp = document.getElementById("playlistName");
  if (inp && (!inp.value || inp.value === inp.getAttribute("data-prev"))) {
    inp.value = dict.placeholder;
  }
  if (inp) {
    inp.placeholder = dict.placeholder;
    inp.setAttribute("data-prev", dict.placeholder);
  }
  document.documentElement.setAttribute("lang", lang);
  const sel = document.getElementById("lang");
  if (sel && sel.value !== lang) sel.value = lang;
  localStorage.setItem("lang", lang);
}

function getPreferredLang() {
  const saved = localStorage.getItem("lang");
  if (saved && I18N[saved]) return saved;
  const nav = (navigator.language || "en").toLowerCase();
  if (nav.startsWith("ru")) return "ru";
  if (nav.startsWith("uk") || nav.startsWith("ua")) return "uk";
  return "en";
}

function createSafeImg(src, alt = '', className = '') {
  const img = document.createElement('img');
  img.className = className;
  img.alt = alt;
  const ph = (typeof placeholderAvatar !== 'undefined' && placeholderAvatar) ? placeholderAvatar : (
    'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
         <rect width="100%" height="100%" fill="#ddd"/>
         <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
           font-size="12" fill="#999">♪</text>
       </svg>`
    )
  );
  img.src = src || ph;
  img.onerror = () => { img.onerror = null; img.src = ph; };
  return img;
}

const CLIENT_ID = "046448f805d547e7b5fdee809c88561c";
const REDIRECT_URI = "https://berlinsk.github.io/PlaylistSpotifyApp/";

const SCOPES = [
  "user-follow-read",
  "playlist-modify-private",
  "playlist-modify-public"
].join(" ");

const logEl = document.getElementById("log");
const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const whoamiEl = document.getElementById("whoami");
const controlsEl = document.getElementById("controls");
const runBtn = document.getElementById("run");
const publicPl = document.getElementById("publicPl");
const chronological = document.getElementById("chronological");
const singlesOnly = document.getElementById("singlesOnly");
const playlistNameInput = document.getElementById("playlistName");

function log(msg) { logEl.textContent += msg + "\n"; logEl.scrollTop = logEl.scrollHeight; }

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
function clearToken() { localStorage.removeItem("sp_token"); }

async function refreshAccessToken() {
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

async function getAccessToken() {
  let tok = loadToken();
  const now = Math.floor(Date.now()/1000);
  if (tok && tok.expires_at && tok.expires_at - 30 > now) return tok.access_token;
  if (tok && tok.refresh_token) return await refreshAccessToken();
  return null;
}

async function api(url, opts={}) {
  for (;;) {
    let at = await getAccessToken();
    if (!at) throw new Error("no token — log in again");
    const r = await fetch(url, {
      ...opts,
      headers: { ...(opts.headers||{}), Authorization: `Bearer ${at}` }
    });
    if (r.status === 401) { await refreshAccessToken(); continue; }
    if (r.status === 429) {
      const retry = parseInt(r.headers.get("Retry-After")||"1", 10);
      log(`rate limited, wait ${retry}s`); await new Promise(res => setTimeout(res, (retry+1)*1000)); continue;
    }
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`api error ${r.status}: ${t}`);
    }
    return r.json();
  }
}

async function beginLogin() {
  const sel = document.getElementById("lang");
  const currentLang = (sel && sel.value) || getPreferredLang();
  localStorage.setItem("lang", currentLang);
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

async function handleRedirect() {
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
  saveToken({
    access_token: j.access_token,
    refresh_token: j.refresh_token,
    expires_at: now + (j.expires_in || 3600)
  });

  history.replaceState({}, "", REDIRECT_URI);
}

function doLogout() { clearToken(); location.reload(); }
async function fetchMe() { return api("https://api.spotify.com/v1/me"); }

async function fetchAllFollowedArtists() {
  log("reading followed artists…");
  let after = null, all = [];
  for (;;) {
    const url = new URL("https://api.spotify.com/v1/me/following");
    url.searchParams.set("type", "artist");
    url.searchParams.set("limit", "50");
    if (after) url.searchParams.set("after", after);
    const j = await api(url.toString());
    const block = j.artists?.items || [];
    all.push(...block);
    const nextAfter = j.artists?.cursors?.after || null;
    if (!nextAfter) break;
    after = nextAfter;
  }
  log(`artists: ${all.length}`);
  return all;
}

async function fetchAllAlbums(artistId, singlesOnly) {
  const out = [];
  let url = new URL(`https://api.spotify.com/v1/artists/${artistId}/albums`);
  url.searchParams.set("limit", "50");
  url.searchParams.set("include_groups", singlesOnly ? "single" : "album,single");
  url.searchParams.set("market", "from_token");
  for (;;) {
    const j = await api(url.toString());
    out.push(...j.items);
    if (!j.next) break;
    url = new URL(j.next);
  }
  return out;
}

async function fetchAlbumTracks(albumId) {
  const out = [];
  let url = new URL(`https://api.spotify.com/v1/albums/${albumId}/tracks`);
  url.searchParams.set("limit", "50");
  url.searchParams.set("market", "from_token");
  for (;;) {
    const j = await api(url.toString());
    out.push(...j.items);
    if (!j.next) break;
    url = new URL(j.next);
  }
  return out;
}

function parseReleaseDate(d, precision) {
  if (!d) return 0;
  if (precision === "year") return Date.parse(`${d}-01-01`);
  if (precision === "month") return Date.parse(`${d}-01`);
  return Date.parse(d);
}

async function fetchTopTracks(artistId) {
  const url = new URL(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`);
  url.searchParams.set("market", "from_token");
  const j = await api(url.toString());
  return j.tracks || [];
}

async function buildAllTrackUris(artists, opts) {
  const seen = new Set();
  const result = [];

  for (let idx = 0; idx < artists.length; idx++) {
    const a = artists[idx];
    log(`(${idx+1}/${artists.length}) ${a.name} — reading releases…`);
    const albums = await fetchAllAlbums(a.id, opts.singlesOnly);

    if (!albums.length) {
      log(`no albums found for ${a.name}, fetching top tracks…`);
      const tracks = await fetchTopTracks(a.id);
      for (const t of tracks) {
        if (seen.has(t.id)) continue;
        seen.add(t.id);
        result.push({
          id: t.id,
          uri: t.uri,
          albumId: null,
          trackNumber: 0,
          albumDate: Date.now()
        });
      }
      continue;
    }

    const albumsNormalized = albums.map(x => ({
      id: x.id,
      name: x.name,
      release_date: parseReleaseDate(x.release_date, x.release_date_precision)
    }));

    if (opts.chronological) {
      albumsNormalized.sort((p, q) => p.release_date - q.release_date);
    }

    for (const alb of albumsNormalized) {
      const tracks = await fetchAlbumTracks(alb.id);
      tracks.sort((p, q) => (p.disc_number - q.disc_number) || (p.track_number - q.track_number));

      for (const t of tracks) {
        const ids = new Set((t.artists || []).map(z => z.id));
        if (!ids.has(a.id)) continue;

        if (seen.has(t.id)) continue;
        seen.add(t.id);
        result.push({
          id: t.id,
          uri: t.uri,
          albumId: alb.id,
          trackNumber: t.track_number,
          albumDate: alb.release_date
        });
      }
    }
  }

  if (opts.chronological) {
    result.sort((p, q) => (p.albumDate - q.albumDate) || (p.trackNumber - q.trackNumber));
  }

  if (result.length > 10000) {
    log(`⚠️ ${result.length} tracks — will cut to 10000`);
    result.length = 10000;
  }

  return result.map(x => x.uri);
}

async function createPlaylist(userId, name, isPublic) {
  const j = await api(`https://api.spotify.com/v1/users/${encodeURIComponent(userId)}/playlists`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      description: "auto: all tracks from artists i follow",
      public: !!isPublic
    })
  });
  return j.id;
}

async function replacePlaylistItems(playlistId, uris) {
  await api(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uris: [] })
  });
  for (let i = 0; i < uris.length; i += 100) {
    const chunk = uris.slice(i, i + 100);
    await api(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uris: chunk })
    });
    log(`added ${Math.min(i + 100, uris.length)} / ${uris.length}`);
  }
}

async function runFlow() {
  try {
    runBtn.disabled = true;
    const me = await fetchMe();
    log(`logged in as: ${me.display_name || me.id} (${me.country})`);

    const selectedIds = Array.from(document.querySelectorAll(".artist-checkbox"))
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    let artists = (window._allArtists || []).filter(a => selectedIds.includes(a.id));
    if (!artists.length) {
      artists = (window._allArtists || []);
    }
    if (!artists.length) { log("no selected artists found"); return; }

    const uris = await buildAllTrackUris(artists, {
      chronological: chronological.checked,
      singlesOnly: singlesOnly.checked
    });
    log(`total tracks to add: ${uris.length}`);

    const name = playlistNameInput.value.trim() || "followed artists: all tracks";
    log(`creating playlist "${name}" (${publicPl.checked ? "public" : "private"})…`);
    const plId = await createPlaylist(me.id, name, publicPl.checked);

    await replacePlaylistItems(plId, uris);
    const url = `https://open.spotify.com/playlist/${plId}`;
    log(`done! playlist: ${url}`);
  } catch (e) {
    console.error(e);
    log("error: " + (e?.message || e));
  } finally {
    runBtn.disabled = false;
  }
}

loginBtn.onclick = beginLogin;
logoutBtn.onclick = doLogout;
runBtn.onclick = runFlow;

(async function init() {
  const initialLang = localStorage.getItem("lang") || getPreferredLang();
  applyI18n(initialLang);
  const langSel = document.getElementById("lang");
  if (langSel) {
    langSel.value = initialLang;
    langSel.onchange = e => applyI18n(e.target.value);
  }
  log(`redirect uri: ${REDIRECT_URI}`);
  await handleRedirect();
  const token = await getAccessToken();
  const currentLang = localStorage.getItem("lang") || initialLang;
  applyI18n(currentLang);
  if (langSel) langSel.value = currentLang;
  if (token) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "";
    const me = await fetchMe();
    const dict = I18N[currentLang] || I18N.en;
    whoamiEl.style.display = "";
    const avatar = (me.images && me.images[0] && me.images[0].url) ? me.images[0].url : "";
    const whoamiImg = document.getElementById("whoamiAvatar");
    const whoamiText = document.getElementById("whoamiText");
    const safe = createSafeImg(avatar, '', whoamiImg.className);
    safe.id = 'whoamiAvatar';
    safe.style.cssText = whoamiImg.style.cssText;
    whoamiImg.replaceWith(safe);
    safe.style.display = '';
    whoamiText.innerHTML = `<b>${dict.loggedInAs}</b> ${me.display_name || me.id}`;
    controlsEl.style.display = "";
    log(dict.ready);

    const artists = await fetchAllFollowedArtists();
    if (artists.length) {
      const artistList = document.getElementById("artistList");

      function renderArtistList(list) {
        artistList.innerHTML = '';
        const frag = document.createDocumentFragment();

        list.forEach(a => {
          const label = document.createElement('label');
          label.className = 'artist-item';

          const cb = document.createElement('input');
          cb.type = 'checkbox';
          cb.className = 'form-check-input artist-checkbox';
          cb.value = a.id;
          cb.checked = true;

          const imgUrl = (a.images && a.images[0] && a.images[0].url) ? a.images[0].url : '';
          const img = createSafeImg(imgUrl, '', 'artist-avatar');

          const name = document.createElement('span');
          name.className = 'artist-name';
          name.textContent = a.name || '';
          name.title = a.name || '';

          label.append(cb, img, name);
          frag.appendChild(label);
        });

        artistList.appendChild(frag);
        bindArtistCheckboxHandlers();
        updateSelectedCount();
      }

      function bindArtistCheckboxHandlers() {
        document.querySelectorAll(".artist-checkbox").forEach(cb => {
          cb.onchange = updateSelectedCount;
        });
      }

      function updateSelectedCount() {
        const n = document.querySelectorAll(".artist-checkbox:checked").length;
        const badge = document.getElementById("artistSelectedCount");
        const lang = localStorage.getItem("lang") || getPreferredLang();
        const dict = I18N[lang] || I18N.en;
        badge.setAttribute("data-i18n-arg-n", String(n));
        badge.textContent = (dict.selectedCount || "Selected: {n}").replace("{n}", String(n));
      }

      renderArtistList(artists);

      const selectAllEl = document.getElementById("selectAllArtists");
      selectAllEl.onchange = e => {
        document.querySelectorAll(".artist-checkbox").forEach(cb => cb.checked = e.target.checked);
        updateSelectedCount();
      };

      const searchEl = document.getElementById("artistSearch");
      if (searchEl) {
        searchEl.oninput = () => {
          const q = searchEl.value.trim().toLowerCase();
          const filtered = q
            ? artists.filter(a => (a.name || "").toLowerCase().includes(q))
            : artists;
          renderArtistList(filtered);
          if (selectAllEl.checked) {
            document.querySelectorAll(".artist-checkbox").forEach(cb => cb.checked = true);
            updateSelectedCount();
          }
        };
      }

      window._allArtists = artists;
    }
  } else {
    whoamiEl.style.display = "none";
    controlsEl.style.display = "none";
    logoutBtn.style.display = "none";
  }
})();