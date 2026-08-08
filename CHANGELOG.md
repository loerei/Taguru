# Changelog

All notable changes to the Taguru extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - Unreleased

### Added
- **Middle-Click Domain Close**: Added optional toggle (`closeDomainOnMiddleClick`, default OFF) allowing users to middle-click any domain card in Taguru to close all tabs from that website.
- **Enable Debug Logs & Log Controls**: Added developer logging utility (`devLog()`) with timestamp buffering in `chrome.storage.local`. Added **Clear Logs**, **Export Logs (.txt)**, and **Copy Logs** buttons (without emojis) in Developer Options.
- **Refined Move By Domain (MBD) Placement Rules**:
  - Implemented middle-tab threshold positioning: Dropping a tab at ≥ 50% of target domain C's space places the entire moved domain G after C (`ABCGD`), while dropping at < 50% places G before C (`ABGCD`).
  - Implemented adjacent domain swap rule: Dragging a tab from domain G upwards into an adjacent domain C unconditionally swaps their domain block order (`ABGC`), preventing domain C tabs from ever being split.
- **Startup RAM Cache Warm-Up**: Added `initDomainOrderCache()` in ServiceWorker startup, `onInstalled`, and `onStartup` to pre-warm `domainOrderCache` in RAM before the first drag action.

### Fixed
- **RAM Cache Sync on Internal Drag**: Fixed RAM Cache stale order bug by forcing immediate `updateDomainOrderCache(targetTabs)` sync when tabs are re-ordered internally within a domain, preserving manual internal tab order across subsequent inter-domain drags.

## [1.0.0] - 2026-08-08

### Added
- **Two-Tier Sorting Engine**: Separated sorting rules into independent Level A (Domain-To-Domain) and Level B (In-Domain) configurations.
- **First-Seen Order (FSO)**: Preserves initial domain appearance order when grouping tabs.
- **Character Priority Rank**: Optional sorting strategy by character class (Digits → Latin → Kana → Kanji).
- **Move By Domain (MBD)**: Dragging a single tab cohesively relocates all tabs belonging to that domain.
- **In-Memory RAM Cache (`domainOrderCache`)**: Tracks domain tab order in memory to preserve internal relative tab positions during inter-domain drags.
- **Drag Contiguity Check**: Distinguishes between internal tab re-ordering (no-op) vs inter-domain drags (cohesive block relocation).
- **Auto-Sort on Drag & Drop**: Immediate tab re-grouping via Chromium `chrome.tabs.onMoved` listener with automatic 300ms retry loops for drag completion.
- **Custom Dark Scrollbar Skin**: Applied sleek dark theme scrollbar styling across all sidepanel, popup, and options views.
- **Two-Tiered Grayed-Out Settings UI**: Visual distinction between unselected options (interactive input, dimmed text) vs unavailable options (fully grayed out, disabled pointer events).
- **Documentation & Legal Assets**: Generated `README.md`, `PRIVACY.md`, and `LICENSE` (MIT).

[1.0.1]: https://github.com/loerei/Taguru/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/loerei/Taguru/releases/tag/v1.0.0
