const filenameEl = document.getElementById("filename");
const filesizeEl = document.getElementById("filesize");
const savepathEl = document.getElementById("savepath");
const btnSend = document.getElementById("btnSend");
const btnCancel = document.getElementById("btnCancel");
const statusEl = document.getElementById("status");

let torrentInfo = null;

function formatSize(bytes) {
  if (!bytes || bytes < 0) return "Unknown";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// Load pending torrent info
chrome.runtime.sendMessage({ action: "getPendingTorrent" }, (info) => {
  if (!info) {
    statusEl.textContent = "No pending torrent found.";
    statusEl.className = "error";
    btnSend.disabled = true;
    return;
  }

  torrentInfo = info;
  filenameEl.textContent = info.filename || "Unknown";
  filesizeEl.textContent = formatSize(info.fileSize);

  // Load save path from settings
  chrome.storage.local.get("settings", (result) => {
    const settings = result.settings || {};
    savepathEl.textContent = settings.savePath || "/downloads";
  });
});

btnSend.addEventListener("click", () => {
  if (!torrentInfo) return;

  btnSend.disabled = true;
  btnCancel.disabled = true;
  statusEl.textContent = "Sending to qBittorrent...";
  statusEl.className = "";

  chrome.runtime.sendMessage(
    { action: "sendToQBittorrent", torrentInfo },
    (result) => {
      if (result && result.success) {
        statusEl.textContent = "Torrent added successfully!";
        statusEl.className = "success";
        setTimeout(() => window.close(), 1200);
      } else {
        statusEl.textContent = "Error: " + (result?.error || "Unknown error");
        statusEl.className = "error";
        btnSend.disabled = false;
        btnCancel.disabled = false;
      }
    }
  );
});

btnCancel.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "cancelTorrent" }, () => {
    window.close();
  });
});
