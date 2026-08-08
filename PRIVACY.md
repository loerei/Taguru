# Privacy Policy for Taguru

**Effective Date:** August 8, 2026

Taguru ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how Taguru handles your data when you use our browser extension.

---

## 1. Privacy-First Architecture (100% Local Execution)

Taguru is engineered with a **zero-telemetry, privacy-first architecture**:
- **No Data Collection:** We do not collect, transmit, store, or monitor any personal data, browsing history, URLs, tab content, or usage analytics.
- **100% Local Processing:** All tab grouping and sorting calculations occur strictly inside your local browser instance.
- **No External Servers:** Taguru does not connect to any remote server or external third-party API.

---

## 2. Browser Storage & Data Usage

Taguru utilizes Chrome's `chrome.storage.local` API solely to store your sorting preferences:
- Manual Sort options (Grouping by Domain, Domain Order Strategy, Path Segments, Query & Hash).
- Auto Sort options and drag-and-drop actions (Auto Re-FSO, Move By Domain).

This configuration data remains strictly on your local machine and is never shared, synced externally, or analyzed.

---

## 3. Chrome Extension Permissions Justifications

Taguru requests only the minimum required permissions to function:

| Permission | Purpose & Justification |
| :--- | :--- |
| `tabs` | Required to query open tab URLs and titles, and rearrange tab index positions within your active browser window. |
| `storage` | Required to persist your custom sorting preferences locally across browser sessions. |
| `sidePanel` | Required to render Taguru's sidebar user interface in supported Chromium browsers. |

---

## 4. Third-Party Services

Taguru contains no third-party SDKs, tracking pixels, advertisement networks, or external script dependencies.

---

## 5. Contact & Questions

If you have any questions or feedback regarding this Privacy Policy, please open an issue on our GitHub repository:  
[https://github.com/loerei/Taguru/issues](https://github.com/loerei/Taguru/issues)
