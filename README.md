# qBittorrent Torrent Sender

A Microsoft Edge browser extension that intercepts `.torrent` file downloads and sends them directly to your qBittorrent Web UI with one click.

## Features

- Automatically detects `.torrent` file downloads
- One-click send to your qBittorrent Web UI
- Confirmation popup — choose whether to send or download normally
- Configurable server URL, credentials, and default save path
- Clean, modern dark UI
- All data stored locally — no external servers, no tracking

## Installation

### From Source (Developer Mode)

1. Clone this repository
2. Open `edge://extensions/` in Microsoft Edge
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `qbittorrent-extension` folder

### From Edge Add-ons Store

*(Coming soon)*

## Setup

1. Click the extension icon in the toolbar
2. Enter your qBittorrent Web UI URL (e.g. `http://192.168.0.120:30024`)
3. Enter your username and password
4. Set the default save path (default: `/downloads`)
5. Click **Save Settings**

## How It Works

1. You click a `.torrent` download link as usual
2. The extension detects the download and opens a confirmation popup
3. The popup shows the filename and size
4. Click **Send to qBittorrent** — the torrent is uploaded to your qBittorrent client and the browser download is cancelled
5. Click **Cancel** — the file downloads to your computer normally

## Requirements

- Microsoft Edge (or any Chromium-based browser)
- qBittorrent with Web UI enabled
- Web UI accessible from your browser (local network or VPN)

## Privacy

This extension does not collect or share any data. Your credentials are stored locally on your device and only used to communicate with your own qBittorrent server. See the full [Privacy Policy](https://yiruihh.github.io/PTExtensions/qbittorrent-extension/privacy-policy.html).

## License

MIT
