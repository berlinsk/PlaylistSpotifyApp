import { I18N, getPreferredLang } from "./i18n.js";
import { createSafeImg } from "./util.js";

export function renderArtistList(artistListEl, artists) {
  artistListEl.innerHTML = '';
  const frag = document.createDocumentFragment();

  artists.forEach(a => {
    const label = document.createElement('label');
    label.className = 'artist-item';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'form-check-input artist-checkbox';
    cb.value = a.id;
    const saved = JSON.parse(localStorage.getItem("selectedArtists") || "[]");
    cb.checked = saved.includes(a.id);

    const imgUrl = (a.images && a.images[0] && a.images[0].url) ? a.images[0].url : '';
    const img = createSafeImg(imgUrl, '', 'artist-avatar');

    const name = document.createElement('span');
    name.className = 'artist-name';
    name.textContent = a.name || '';
    name.title = a.name || '';

    label.append(cb, img, name);
    frag.appendChild(label);
  });

  artistListEl.appendChild(frag);
  bindArtistCheckboxHandlers();
  updateSelectedCount();
  const mainBtn = document.querySelector('[data-i18n="selectArtists"]');
  if (mainBtn) {
    const n = document.querySelectorAll(".artist-checkbox:checked").length;
    const lang = localStorage.getItem("lang") || getPreferredLang();
    const dict = I18N[lang] || I18N.en;
    mainBtn.textContent = (dict.selectedCount || "Selected: {n}").replace("{n}", String(n));
  }
}

export function bindArtistCheckboxHandlers() {
  document.querySelectorAll(".artist-checkbox").forEach(cb => {
    cb.onchange = updateSelectedCount;
  });
}

export function updateSelectedCount() {
  const checkedIds = Array.from(document.querySelectorAll(".artist-checkbox:checked")).map(cb => cb.value);
  localStorage.setItem("selectedArtists", JSON.stringify(checkedIds));

  const n = checkedIds.length;
  const lang = localStorage.getItem("lang") || getPreferredLang();
  const dict = I18N[lang] || I18N.en;
  const text = (dict.selectedCount || "Selected: {n}").replace("{n}", String(n));

  const badge = document.getElementById("artistSelectedCount");
  badge.setAttribute("data-i18n-arg-n", String(n));
  badge.textContent = text;

  const mainBtn = document.querySelector('[data-i18n="selectArtists"]');
  if (mainBtn) mainBtn.textContent = text;
}