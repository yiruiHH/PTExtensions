const qbUrlEl = document.getElementById("qbUrl");
const usernameEl = document.getElementById("username");
const passwordEl = document.getElementById("password");
const savePathEl = document.getElementById("savePath");
const btnSave = document.getElementById("btnSave");
const statusEl = document.getElementById("status");

// Load saved settings
chrome.storage.local.get("settings", (result) => {
  const s = result.settings || {};
  qbUrlEl.value = s.qbUrl || "http://192.168.0.120:30024";
  usernameEl.value = s.username || "";
  passwordEl.value = s.password || "";
  savePathEl.value = s.savePath || "/downloads";
});

btnSave.addEventListener("click", () => {
  const settings = {
    qbUrl: qbUrlEl.value.replace(/\/+$/, ""),
    username: usernameEl.value,
    password: passwordEl.value,
    savePath: savePathEl.value,
  };

  chrome.storage.local.set({ settings }, () => {
    statusEl.textContent = "Settings saved!";
    statusEl.className = "success";
    setTimeout(() => { statusEl.textContent = ""; }, 2000);
  });
});
