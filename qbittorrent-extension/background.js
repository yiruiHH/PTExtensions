const DEFAULT_SETTINGS = {
  qbUrl: "http://192.168.0.120:30024",
  username: "",
  password: "",
  savePath: "/downloads",
};

async function getSettings() {
  const result = await chrome.storage.local.get("settings");
  return { ...DEFAULT_SETTINGS, ...result.settings };
}

async function loginToQBittorrent(settings) {
  const response = await fetch(`${settings.qbUrl}/api/v2/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${encodeURIComponent(settings.username)}&password=${encodeURIComponent(settings.password)}`,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const text = await response.text();
  if (text !== "Ok.") {
    throw new Error("Login failed: invalid credentials");
  }
}

async function addTorrentToQBittorrent(torrentBlob, filename, settings) {
  await loginToQBittorrent(settings);

  const formData = new FormData();
  formData.append("torrents", torrentBlob, filename);
  formData.append("savepath", settings.savePath);

  const response = await fetch(`${settings.qbUrl}/api/v2/torrents/add`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to add torrent: ${response.status}`);
  }

  return true;
}

// Listen for downloads and intercept .torrent files
chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
  const filename = downloadItem.filename || "";
  const url = downloadItem.url || "";
  const mime = downloadItem.mime || "";

  const isTorrent =
    filename.endsWith(".torrent") ||
    mime === "application/x-bittorrent" ||
    url.includes(".torrent");

  if (!isTorrent) {
    return;
  }

  // Store the download info for the confirm dialog
  const torrentInfo = {
    downloadId: downloadItem.id,
    filename: filename,
    url: downloadItem.url,
    fileSize: downloadItem.fileSize,
  };

  chrome.storage.local.set({ pendingTorrent: torrentInfo });

  // Open the confirm dialog
  chrome.windows.create({
    url: "confirm.html",
    type: "popup",
    width: 460,
    height: 320,
    focused: true,
  });

  // Let the download continue so we can read the file
  suggest({ filename: downloadItem.filename });
});

// Handle messages from the confirm dialog
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getPendingTorrent") {
    chrome.storage.local.get("pendingTorrent", (result) => {
      sendResponse(result.pendingTorrent || null);
    });
    return true;
  }

  if (message.action === "sendToQBittorrent") {
    handleSendToQBittorrent(message.torrentInfo)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (message.action === "cancelTorrent") {
    chrome.storage.local.remove("pendingTorrent");
    sendResponse({ success: true });
    return true;
  }
});

async function handleSendToQBittorrent(torrentInfo) {
  const settings = await getSettings();

  if (!settings.username || !settings.password) {
    return { success: false, error: "Please configure credentials in the extension popup." };
  }

  try {
    // Fetch the .torrent file content from the download URL
    const response = await fetch(torrentInfo.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch torrent file: ${response.status}`);
    }
    const blob = await response.blob();

    await addTorrentToQBittorrent(blob, torrentInfo.filename, settings);

    // Cancel the browser download since we've sent it to qBittorrent
    chrome.downloads.cancel(torrentInfo.downloadId, () => {
      chrome.downloads.erase({ id: torrentInfo.downloadId });
    });

    chrome.storage.local.remove("pendingTorrent");

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
