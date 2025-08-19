import { log } from "./util.js";

const MAX_BYTES = 256 * 1024;

let currentDataUrl = null;

function fileToImage(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = fr.result;
    };
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
}

function urlToImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function imageToJpegDataUrl(img, maxBytes = MAX_BYTES) {
  const side = Math.min(1024, Math.max(256, Math.min(img.width, img.height)));
  const canvas = document.createElement("canvas");
  canvas.width = side;
  canvas.height = side;
  const ctx = canvas.getContext("2d");

  const s = Math.min(img.width, img.height);
  const sx = (img.width - s) / 2;
  const sy = (img.height - s) / 2;
  ctx.drawImage(img, sx, sy, s, s, 0, 0, side, side);

  let q = 0.92;
  let dataUrl = canvas.toDataURL("image/jpeg", q);
  while (dataUrl.length * 0.75 > maxBytes && q > 0.4) {
    q -= 0.07;
    dataUrl = canvas.toDataURL("image/jpeg", q);
  }
  if (dataUrl.length * 0.75 > maxBytes) {
    let cur = side;
    while (dataUrl.length * 0.75 > maxBytes && cur > 256) {
      cur = Math.floor(cur * 0.85);
      canvas.width = canvas.height = cur;
      ctx.drawImage(img, sx, sy, s, s, 0, 0, cur, cur);
      dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    }
  }
  return dataUrl;
}

export function setupCoverModal() {
  const fileEl = document.getElementById("coverFile");
  const urlEl = document.getElementById("coverUrl");
  const loadUrlBtn = document.getElementById("coverLoadUrl");
  const previewEl = document.getElementById("coverPreview");
  const applyBtn = document.getElementById("coverApply");
  const removeBtn = document.getElementById("coverRemove");
  const chooseBtn = document.getElementById("coverChooseBtn");
  chooseBtn.onclick = () => fileEl.click();

  const showPreview = (dataUrl) => {
    currentDataUrl = dataUrl;
    previewEl.src = dataUrl;
    previewEl.style.display = "block";
    previewEl.classList.add("is-visible");
  };

  fileEl.onchange = async () => {
    const f = fileEl.files && fileEl.files[0];
    if (!f) return;
    try {
      const img = await fileToImage(f);
      const dataUrl = imageToJpegDataUrl(img);
      showPreview(dataUrl);
    } catch (e) {
      log("cover: failed to load file");
      console.error(e);
    }
  };

  loadUrlBtn.onclick = async () => {
    const url = (urlEl.value || "").trim();
    if (!url) return;
    try {
      const img = await urlToImage(url);
      const dataUrl = imageToJpegDataUrl(img);
      showPreview(dataUrl);
    } catch (e) {
      log("cover: failed to load URL (CORS?)");
      console.error(e);
    }
  };

  applyBtn.onclick = () => {};

  removeBtn.onclick = () => {
    currentDataUrl = null;
    previewEl.src = "";
    previewEl.classList.remove("is-visible");
    fileEl.value = "";
    urlEl.value = "";
  };
}

export function getCoverDataUrl() {
  return currentDataUrl;
}