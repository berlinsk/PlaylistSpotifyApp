import { I18N, applyI18n, getPreferredLang } from "./i18n.js";
import { log } from "./util.js";
import { beginLogin, doLogout, handleRedirect } from "./auth.js";
import {
  fetchMe,
  fetchAllFollowedArtists,
  buildAllTrackUris,
  createPlaylist,
  replacePlaylistItems
} from "./spotify.js";
import { renderArtistList, bindArtistCheckboxHandlers, updateSelectedCount } from "./ui.js";
import { setupCountsModal } from "./counts.js";

const loginBtn = document.getElementById("login");
const logoutBtn = document.getElementById("logout");
const whoamiEl = document.getElementById("whoami");
const controlsEl = document.getElementById("controls");
const runBtn = document.getElementById("run");
const publicPl = document.getElementById("publicPl");
const chronological = document.getElementById("chronological");
const singlesOnly = document.getElementById("singlesOnly");
const playlistNameInput = document.getElementById("playlistName");
const artistModalEl = document.getElementById('artistModal');
const artistOkBtn = document.getElementById('artistOk');
const countsModalEl = document.getElementById('countsModal');

function getAccessTokenSync() {
  try { return JSON.parse(localStorage.getItem("sp_token")||"").access_token; } catch { return null; }
}

async function runFlow() {
  try {
    runBtn.disabled = true;
    const me = await fetchMe();
    log(`logged in as: ${me.display_name || me.id} (${me.country})`);

    const selectedIds = Array.from(document.querySelectorAll(".artist-checkbox"))
      .filter(cb => cb.checked).map(cb => cb.value);

    let artists = (window._allArtists || []).filter(a => selectedIds.includes(a.id));
    if (!artists.length) artists = (window._allArtists || []);
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

    const shareContainer = document.getElementById('shareContainer');
    const shareBtn = document.getElementById('shareBtn');
    if (shareContainer && shareBtn) {
      shareBtn.onclick = async () => {
        try {
          if (navigator.share) {
            await navigator.share({ title: name, url });
          } else {
            await navigator.clipboard.writeText(url);
            alert('Link copied to clipboard!');
          }
        } catch (err) {
          console.error('Share failed:', err);
        }
      };
      shareContainer.style.display = 'block';
      shareContainer.offsetHeight;
      shareContainer.classList.add('is-visible');
      shareBtn.classList.remove('shine');
      shareBtn.offsetWidth;
      shareBtn.classList.add('shine');
    }
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

if (artistOkBtn && artistModalEl) {
  artistOkBtn.addEventListener('click', () => {
    const modal = bootstrap.Modal.getOrCreateInstance(artistModalEl);
    modal.hide();
  });
}

setupCountsModal(countsModalEl, singlesOnly);

(async function init() {
  const initialLang = localStorage.getItem("lang") || getPreferredLang();
  applyI18n(initialLang);
  const langSel = document.getElementById("lang");
  if (langSel) {
    langSel.value = initialLang;
    langSel.onchange = e => applyI18n(e.target.value);
  }

  log(`redirect uri: ${location.origin + location.pathname}`);
  await handleRedirect();

  const token = getAccessTokenSync();
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
    if (whoamiImg) {
      whoamiImg.src = avatar || whoamiImg.src;
      whoamiImg.style.display = '';
    }
    whoamiText.innerHTML = `<b>${dict.loggedInAs}</b> ${me.display_name || me.id}`;
    controlsEl.style.display = "";
    log(dict.ready);

    const artists = await fetchAllFollowedArtists();
    if (artists.length) {
      window._allArtists = artists;
      const artistList = document.getElementById("artistList");

      renderArtistList(artistList, artists);

      const selectAllEl = document.getElementById("selectAllArtists");
      if (selectAllEl) {
        selectAllEl.onchange = e => {
          document.querySelectorAll(".artist-checkbox").forEach(cb => cb.checked = e.target.checked);
          updateSelectedCount();
        };
      }

      const searchEl = document.getElementById("artistSearch");
      if (searchEl) {
        searchEl.oninput = () => {
          const q = searchEl.value.trim().toLowerCase();
          const filtered = q ? artists.filter(a => (a.name || "").toLowerCase().includes(q)) : artists;
          renderArtistList(artistList, filtered);
          if (selectAllEl && selectAllEl.checked) {
            document.querySelectorAll(".artist-checkbox").forEach(cb => cb.checked = true);
            updateSelectedCount();
          }
        };
      }
    }
  } else {
    whoamiEl.style.display = "none";
    controlsEl.style.display = "none";
    logoutBtn.style.display = "none";
  }
})();