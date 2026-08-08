# Changelog

All notable changes to the Taguru extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - Unreleased

### Added
- **Middle-Click Domain Close**: Added optional toggle (`closeDomainOnMiddleClick`, default OFF) allowing users to middle-click any domain card in Taguru to close all tabs from that website.

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
