# Taguru 🏷️

> **Automatic Tab Grouping & Domain Sorter for Chromium**

Taguru automatically organizes, groups, and sorts your browser tabs by domain and URL structure. Built for power users who want a clean, organized tab bar.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue?style=flat-square)
![Privacy First](https://img.shields.io/badge/Privacy-100%25_Offline-emerald?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)

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

### Option B: Load Unpacked (Developer Mode)
1. Clone or download this repository:
   ```bash
   git clone https://github.com/sayus/Taguru.git
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

## 📄 License

[MIT License](LICENSE) © 2026 Taguru
