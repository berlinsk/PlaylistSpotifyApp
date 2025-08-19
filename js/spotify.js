import { log } from "./util.js";
import { I18N, getPreferredLang } from "./i18n.js";
import { getAccessToken, refreshAccessToken } from "./auth.js";

export async function api(url, opts={}) {
  for (;;) {
    let at = await getAccessToken();
    if (!at) throw new Error("no token — log in again");
    const r = await fetch(url, {
      ...opts,
      headers: { ...(opts.headers||{}), Authorization: `Bearer ${at}` }
    });
    if (r.status === 401) { await refreshAccessToken(); continue; }
    if (r.status === 429) {
      const retry = parseInt(r.headers.get("Retry-After") || "1", 10);
      const lang = localStorage.getItem("lang") || getPreferredLang();
      const dict = I18N[lang] || I18N.en;
      const msg = (dict.rateLimitWait || "wait {n}s").replace("{n}", retry);
      log(`${msg} (${url})`);
      await new Promise(res => setTimeout(res, (retry + 1) * 1000));
      continue;
    }
    if (!r.ok) {
      const t = await r.text();
      throw new Error(`api error ${r.status}: ${t}`);
    }
    return r.json();
  }
}

export async function fetchMe() { return api("https://api.spotify.com/v1/me"); }

export async function fetchAllFollowedArtists() {
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

export async function fetchAllAlbums(artistId, singlesOnly, signal) {
  const out = [];
  let url = new URL(`https://api.spotify.com/v1/artists/${artistId}/albums`);
  url.searchParams.set("limit", "50");
  url.searchParams.set("include_groups", singlesOnly ? "single" : "album,single");
  url.searchParams.set("market", "from_token");
  for (;;) {
    const j = await api(url.toString(), { signal });
    out.push(...j.items);
    if (!j.next) break;
    url = new URL(j.next);
  }
  return out;
}

export async function fetchAlbumTracks(albumId, signal) {
  const out = [];
  let url = new URL(`https://api.spotify.com/v1/albums/${albumId}/tracks`);
  url.searchParams.set("limit", "50");
  url.searchParams.set("market", "from_token");
  for (;;) {
    const j = await api(url.toString(), { signal });
    out.push(...j.items);
    if (!j.next) break;
    url = new URL(j.next);
  }
  return out;
}

export function parseReleaseDate(d, precision) {
  if (!d) return 0;
  if (precision === "year") return Date.parse(`${d}-01-01`);
  if (precision === "month") return Date.parse(`${d}-01`);
  return Date.parse(d);
}

export async function fetchTopTracks(artistId, signal) {
  const url = new URL(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`);
  url.searchParams.set("market", "from_token");
  const j = await api(url.toString(), { signal });
  return j.tracks || [];
}

export async function buildAllTrackUris(artists, opts) {
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
        result.push({ id: t.id, uri: t.uri, albumId: null, trackNumber: 0, albumDate: Date.now() });
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
        result.push({ id: t.id, uri: t.uri, albumId: alb.id, trackNumber: t.track_number, albumDate: alb.release_date });
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

export async function setPlaylistCover(playlistId, dataUrl) {
  const base64 = dataUrl.split(",")[1];
  const byteStr = atob(base64);
  const buf = new Uint8Array(byteStr.length);
  for (let i = 0; i < byteStr.length; i++) buf[i] = byteStr.charCodeAt(i);

  const token = await getAccessToken();
  const r = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/images`, {
    method: "PUT",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "image/jpeg"
    },
    body: buf.buffer
  });
  if (r.status !== 202) {
    const txt = await r.text().catch(() => "");
    throw new Error(`cover upload status ${r.status} ${txt}`);
  }
}

export async function createPlaylist(userId, name, isPublic) {
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

export async function replacePlaylistItems(playlistId, uris) {
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