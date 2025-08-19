export const I18N = {
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
    selectedCount: "Selected: {n}",
    sharePlaylist: "Share playlist",
    showCounts: "Show track counts",
    countsTitle: "Track counts",
    calculating: "Calculating",
    close: "Close",
    rateLimitWait: "rate limited, wait {n}s",
    coverBtn: "Playlist cover",
    coverTitle: "Playlist cover",
    chooseFile: "Choose from device",
    or: "or",
    pasteUrl: "Paste image URL",
    preview: "Preview",
    apply: "Apply",
    removeImage: "Remove image",
    coverHint: "JPEG up to 256 KB. We will compress automatically if needed."
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
    selectedCount: "Выбрано: {n}",
    sharePlaylist: "Поделиться плейлистом",
    showCounts: "Показать количество треков",
    countsTitle: "Количество треков",
    calculating: "Идёт подсчёт",
    close: "Закрыть",
    rateLimitWait: "Spotify устал, подождите {n} с.",
    coverBtn: "Обложка плейлиста",
    coverTitle: "Обложка плейлиста",
    chooseFile: "Выбрать с устройства",
    or: "или",
    pasteUrl: "Вставьте URL изображения",
    preview: "Предпросмотр",
    apply: "Применить",
    removeImage: "Убрать обложку",
    coverHint: "JPEG до 256 КБ. Мы автоматически сожмём при необходимости."
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
    selectedCount: "Вибрано: {n}",
    sharePlaylist: "Поділитися плейлистом",
    showCounts: "Показати кількість треків",
    countsTitle: "Кількість треків",
    calculating: "Йде підрахунок",
    close: "Закрити",
    rateLimitWait: "Spotify втомився, зачекайте {n} с.",
    coverBtn: "Обкладинка плейлиста",
    coverTitle: "Обкладинка плейлиста",
    chooseFile: "Обрати з пристрою",
    or: "або",
    pasteUrl: "Вставте URL зображення",
    preview: "Попередній перегляд",
    apply: "Застосувати",
    removeImage: "Прибрати обкладинку",
    coverHint: "JPEG до 256 КБ. Ми автоматично стиснемо за потреби."
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
    selectedCount: "✅ {n}",
    sharePlaylist: "⤴️✈️",
    showCounts: "🐈➕🎵",
    countsTitle: "🎤#🎵",
    calculating: "⏳",
    close: "🏁",
    rateLimitWait: "🐌⏳ {n}s",
    coverBtn: "🖼️",
    coverTitle: "🖼️",
    chooseFile: "📱⬆️",
    or: "or",
    pasteUrl: "🌐 URL",
    preview: "👀",
    apply: "✅",
    removeImage: "🗑️",
    coverHint: "JPEG ≤256KB"
  }
};

export function applyI18n(lang) {
  const dict = I18N[lang] || I18N.en;
  const fmt = (key, params = {}) => {
    let s = dict[key] || I18N.en[key] || "";
    Object.keys(params).forEach(k => { s = s.replace(new RegExp(`\\{${k}\\}`, "g"), params[k]); });
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

export function getPreferredLang() {
  const saved = localStorage.getItem("lang");
  if (saved && I18N[saved]) return saved;
  const nav = (navigator.language || "en").toLowerCase();
  if (nav.startsWith("ru")) return "ru";
  if (nav.startsWith("uk") || nav.startsWith("ua")) return "uk";
  return "en";
}