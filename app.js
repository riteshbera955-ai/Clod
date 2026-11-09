const input = document.getElementById("photoInput");
const dropZone = document.getElementById("dropZone");
const chooseBtn = document.getElementById("chooseBtn");
const previewGrid = document.getElementById("previewGrid");
const originalPreview = document.getElementById("originalPreview");
const resultPreview = document.getElementById("resultPreview");
const resultPlaceholder = document.getElementById("resultPlaceholder");
const actions = document.getElementById("actions");
const restoreBtn = document.getElementById("restoreBtn");
const resetBtn = document.getElementById("resetBtn");
const progress = document.getElementById("progress");
const progressText = document.getElementById("progressText");
const errorBox = document.getElementById("errorBox");
const successBox = document.getElementById("successBox");
const downloadBtn = document.getElementById("downloadBtn");
let selectedFile = null;
let originalUrl = null;

document.getElementById("year").textContent = new Date().getFullYear();
chooseBtn.addEventListener("click", () => input.click());
dropZone.addEventListener("click", e => { if (e.target !== chooseBtn) input.click(); });
input.addEventListener("change", () => { if (input.files[0]) setFile(input.files[0]); });
["dragenter","dragover"].forEach(type => dropZone.addEventListener(type, e => { e.preventDefault(); dropZone.classList.add("drag"); }));
["dragleave","drop"].forEach(type => dropZone.addEventListener(type, e => { e.preventDefault(); dropZone.classList.remove("drag"); }));
dropZone.addEventListener("drop", e => { const f=e.dataTransfer.files[0]; if(f) setFile(f); });
resetBtn.addEventListener("click", reset);
restoreBtn.addEventListener("click", restore);

function setFile(file) {
  clearMessages();
  if (!["image/jpeg","image/png","image/webp"].includes(file.type)) return showError("Please select a JPG, PNG or WEBP image.");
  if (file.size > 10*1024*1024) return showError("Image is too large. Maximum size is 10 MB.");
  selectedFile = file;
  if (originalUrl) URL.revokeObjectURL(originalUrl);
  originalUrl = URL.createObjectURL(file);
  originalPreview.src = originalUrl;
  resultPreview.hidden = true;
  resultPlaceholder.hidden = false;
  downloadBtn.hidden = true;
  dropZone.hidden = true;
  previewGrid.hidden = false;
  actions.hidden = false;
}
async function restore() {
  if (!selectedFile) return;
  clearMessages();
  restoreBtn.disabled = true;
  progress.hidden = false;
  progressText.textContent = "Restoring your photo with Gemini… Please keep this page open.";
  try {
    const form = new FormData();
    form.append("photo", selectedFile);
    const response = await fetch("/api/restore", { method:"POST", body:form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Restoration failed. Please try again.");
    resultPreview.src = data.image;
    resultPreview.hidden = false;
    resultPlaceholder.hidden = true;
    downloadBtn.href = data.image;
    downloadBtn.hidden = false;
    successBox.hidden = false;
  } catch (err) {
    showError(err.message || "Something went wrong.");
  } finally {
    progress.hidden = true;
    restoreBtn.disabled = false;
  }
}
function showError(message) { errorBox.textContent = message; errorBox.hidden = false; }
function clearMessages() { errorBox.hidden = true; successBox.hidden = true; }
function reset() {
  selectedFile = null;
  input.value = "";
  if (originalUrl) URL.revokeObjectURL(originalUrl);
  originalUrl = null;
  dropZone.hidden = false;
  previewGrid.hidden = true;
  actions.hidden = true;
  downloadBtn.hidden = true;
  resultPreview.hidden = true;
  clearMessages();
}
