<p align="center">
  <img src="public/logo.svg" width="120" height="120" alt="Taguru Logo" />
</p>

<h1 align="center">Taguru</h1>

<p align="center">
  <b>Automatic Tab Grouping & Domain Sorter for Chromium</b>
</p>

<p align="center">
  <a href="https://github.com/loerei/Taguru"><img src="https://img.shields.io/badge/Manifest-V3-blue?style=flat-square" alt="Manifest V3" /></a>
  <a href="PRIVACY.md"><img src="https://img.shields.io/badge/Privacy-100%25_Offline-emerald?style=flat-square" alt="Privacy First" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-purple?style=flat-square" alt="License" /></a>
</p>

---

Taguru automatically organizes, groups, and sorts your browser tabs by domain and URL structure. Built for power users who want a clean, organized tab bar.

---

## ✨ Features

- 🌐 **Domain Grouping**: Keep tabs from the same website together.
- 📌 **First-Seen Order**: Maintain domains in the order they appeared.
- 🔀 **Move By Domain**: Drag one tab to move all tabs from that domain.
- ⚡ **Auto Sort**: Re-groups tabs automatically as you browse.
- 🔤 **Character Rank**: Optional sorting (Digits → Latin → Kana → Kanji).
- 🔒 **100% Private**: Runs entirely in your browser.

---

## 🚀 Quick Start

### Option A: Install from Chrome Web Store (Recommended)
1. Visit the **Chrome Web Store** page *(Link coming soon)*.
2. Click **Add to Chrome**.

### Option B: Download Pre-built Release (No Node.js Required)
1. Download `taguru-release.zip` from [GitHub Releases](https://github.com/loerei/Taguru/releases).
2. Unzip `taguru-release.zip` to a folder.
3. Open `chrome://extensions` in Chrome, Brave, or Edge.
4. Enable **Developer mode** (top-right toggle).
5. Click **Load unpacked** and select the unzipped folder.

### Option C: Build from Source (For Developers)
1. Clone this repository:
   ```bash
   git clone https://github.com/loerei/Taguru.git
   cd Taguru
   npm install
   npm run build
   ```
2. Open `chrome://extensions` in Chrome, Brave, or Edge.
3. Enable **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the `dist/` directory.

---

## ⚙️ How It Works

Taguru uses a **Two-Tier Sorting Engine**:

```text
Level A: Domain-To-Domain
├── First-Seen Order (Preserves natural domain order)
└── Character Priority Rank (Digits → Latin → Kana → Kanji)

Level B: In-Domain
├── Path Segments (Sorts by URL /path/structure)
└── Query & Hash (Sorts by ?query=1 and #anchor)
```

---

## 🔒 Privacy

Taguru respects your privacy. All processing happens 100% locally on your machine. Read our complete [Privacy Policy](PRIVACY.md).

---

## 📄 License & Changelog

[MIT License](LICENSE) • [Changelog](CHANGELOG.md) © 2026 loerei
