# Changelog

All notable changes to the Taguru extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - Unreleased

### Added
- **Opening Tab View Persistence**: Saved and restored the user's active view tab (`Groups`, `Domains`, or `Settings`) in `chrome.storage.local` so opening the Popup or Side Panel automatically opens to the user's last visited view.
- **Extension Icon Click Behavior Selector**: Added radio options in `General Settings` to choose whether clicking the extension toolbar icon defaults to opening the compact **Popup (Default)** window or opening the persistent **Side Panel (Sidebar)** via `chrome.sidePanel.setPanelBehavior`.
- **Default Open Keyboard Shortcut (`Ctrl+Shift+E` / `Cmd+Shift+E`)**: Added native `_execute_action` keyboard shortcut in `manifest.json` with an interactive editable shortcut input in `General Settings` (auto-detects OS `Cmd+Shift+E` on Mac / `Ctrl+Shift+E` on Windows, supports Backspace to clear, and resets to default when left empty on blur).
- **Real-Time Tab Position Snapshot Logging**: Added real-time tab layout snapshot logs after every sort, drag, MBD placement, and startup operation.

### Fixed
- **MBD Single-Tab Domain Bypass & Split Domain Prevention**:
  - Fixed single-tab domain bypass in `moveDomainGroupToTabPosition` so 1-tab domains execute inter-domain relocation when dropped into/across another domain.
  - Refined `isContiguous` split domain detection to check if tabs before and after the moved domain belong to the same non-moved domain, preventing target domains from ever being split.

## [1.0.2] - 2026-08-08

### Added
- **Domain Favicon Rendering**: Displayed 18x18 px domain favicon icons on domain cards with automatic SVG globe fallback for missing or broken favicons.
- **Horizontal Compact Domain Card Layout**: Aligned tab counts horizontally on the same line as domain names, reducing domain item vertical card height.
- **Real-Time FSO Domain List Synchronization**: Added Chromium tab event listeners (`onMoved`, `onCreated`, `onRemoved`, `onUpdated`) to sync the `Domains` view order in real-time with actual browser tab bar positions when Auto Sort + FSO is active.
- **Interactive Drag & Drop Domain Re-ordering**: Enabled HTML5 drag-and-drop on domain cards in the `Domains` view when Auto Sort + FSO is active, allowing users to drag domain cards to re-order the actual tab blocks in the browser tab bar in real-time.
- **Move Entire Domain (MBD) as Default Action**: Set `Move Entire Domain (MBD)` as the default drag option in `DEFAULT_SORT_OPTIONS` and positioned it at the top of the drag action radio group in Settings.
- **General Settings Section**: Isolated general mouse shortcuts like `Middle-Click Domain Close` into a dedicated standalone settings card.

### Fixed
- **Windows Middle-Click Autoscroll Suppression**: Added `onMouseDown` `preventDefault()` event handling to suppress Windows native autoscroll cursor wheel icon when middle-clicking domain items.
- **Sub-Radio Group Layout**: Fixed overlapping sub-radio buttons under `WHEN YOU DRAG A TAB` in Auto Sort Settings by enforcing vertical flex-column container styling.

## [1.0.1] - 2026-08-08

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

[1.0.3]: https://github.com/loerei/Taguru/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/loerei/Taguru/releases/tag/v1.0.2
[1.0.1]: https://github.com/loerei/Taguru/releases/tag/v1.0.1
[1.0.0]: https://github.com/loerei/Taguru/releases/tag/v1.0.0
