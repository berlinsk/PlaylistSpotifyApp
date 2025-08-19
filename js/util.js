export const logEl = document.getElementById("log");

export function log(msg) {
  logEl.textContent += msg + "\n";
  logEl.scrollTop = logEl.scrollHeight;
}

export const placeholderAvatar = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
    <rect width="100%" height="100%" fill="#ddd"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-size="12" fill="#999">♪</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
})();

export function createSafeImg(src, alt = '', className = '') {
  const img = document.createElement('img');
  img.className = className;
  img.alt = alt;
  const ph = placeholderAvatar;
  img.src = src || ph;
  img.onerror = () => { img.onerror = null; img.src = ph; };
  return img;
}