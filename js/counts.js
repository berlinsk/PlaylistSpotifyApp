import { I18N, getPreferredLang } from "./i18n.js";
import { createSafeImg } from "./util.js";
import { fetchAllAlbums, fetchAlbumTracks, fetchTopTracks } from "./spotify.js";

const countsCache = { true: new Map(), false: new Map() };
let countsAbortCtrl = null;

async function computeTrackCounts(artists, opts, onUpdate) {
  const signal = opts && opts.signal ? opts.signal : undefined;
  for (const a of artists) {
    if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');

    const albums = await fetchAllAlbums(a.id, !!opts.singlesOnly, signal);
    if (!albums.length) {
      const tracks = await fetchTopTracks(a.id, signal);
      onUpdate(a.id, tracks.length);
      continue;
    }

    const seen = new Set();
    for (const alb of albums) {
      const tracks = await fetchAlbumTracks(alb.id, signal);
      for (const t of tracks) {
        const ids = new Set((t.artists || []).map(z => z.id));
        if (!ids.has(a.id)) continue;
        if (seen.has(t.id)) continue;
        seen.add(t.id);
      }
      onUpdate(a.id, seen.size);
      if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
    }
    onUpdate(a.id, seen.size);
  }
}

export function setupCountsModal(countsModalEl, singlesOnlyCheckbox) {
  if (!countsModalEl) return;

  countsModalEl.addEventListener('shown.bs.modal', async () => {
    const countsList = document.getElementById('countsList');
    const countsProgress = document.getElementById('countsProgress');
    countsList.innerHTML = '';

    const selectedIds = Array.from(document.querySelectorAll(".artist-checkbox"))
      .filter(cb => cb.checked).map(cb => cb.value);
    const artists = (window._allArtists || []).filter(a => selectedIds.includes(a.id));

    const lang = localStorage.getItem("lang") || getPreferredLang();
    const dict = I18N[lang] || I18N.en;

    const cacheMap = countsCache[singlesOnlyCheckbox.checked ? true : false];

    artists.forEach(a => {
      const label = document.createElement('label');
      label.className = 'artist-item';

      const imgUrl = (a.images && a.images[0] && a.images[0].url) ? a.images[0].url : '';
      const img = createSafeImg(imgUrl, '', 'artist-avatar');

      const name = document.createElement('span');
      name.className = 'artist-name';
      name.textContent = a.name || '';

      const badge = document.createElement('span');
      badge.className = 'badge bg-secondary';
      badge.setAttribute('data-artist-id', a.id);
      badge.textContent = cacheMap.has(a.id) ? String(cacheMap.get(a.id)) : '0';

      label.append(img, name, badge);
      countsList.appendChild(label);
    });

    const missing = artists.filter(a => !cacheMap.has(a.id));
    if (missing.length === 0) { countsProgress.textContent = ''; return; }

    countsProgress.textContent = dict.calculating || "Calculating";

    countsAbortCtrl = new AbortController();
    try {
      await computeTrackCounts(
        missing,
        { singlesOnly: singlesOnlyCheckbox.checked, signal: countsAbortCtrl.signal },
        (artistId, count) => {
          const badge = countsList.querySelector(`.badge[data-artist-id="${artistId}"]`);
          if (badge) badge.textContent = String(count);
          cacheMap.set(artistId, count);
        }
      );
    } catch (err) {
      if (!(err && err.name === 'AbortError')) {
        console.error('count error:', err);
      }
    } finally {
      countsProgress.textContent = '';
    }
  });

  countsModalEl.addEventListener('hide.bs.modal', () => {
    if (countsAbortCtrl) {
      countsAbortCtrl.abort();
      countsAbortCtrl = null;
    }
  });
}