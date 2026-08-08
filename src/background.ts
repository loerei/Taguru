import { sortCurrentWindowTabs, moveDomainGroupToTabPosition, updateDomainOrderCache } from './utils/sorter';
import { getAutoSortEnabled, getAutoSortOptions } from './utils/storage';
import { devLog, logTabPositionsSnapshot } from './utils/logger';
import { SortOptions } from './types';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isSorting = false;

async function initDomainOrderCache() {
  if (typeof chrome === 'undefined' || !chrome.tabs) return;
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    if (tabs && tabs.length > 0) {
      updateDomainOrderCache(tabs);
      devLog(`Warmed up RAM domainOrderCache on startup with ${tabs.length} tabs.`);
      await logTabPositionsSnapshot('Startup Warm-Up');
    }
  } catch (_e) {
    // Ignore query error on startup
  }
}

// Warm up RAM cache on ServiceWorker execution
initDomainOrderCache();

async function attemptSort(
  windowId?: number,
  options?: SortOptions,
  retries = 3
): Promise<number> {
  try {
    return await sortCurrentWindowTabs(windowId, options);
  } catch (err: any) {
    const isDragError =
      err?.message?.includes('user may be dragging a tab') ||
      (typeof err === 'string' && (err as string).includes('user may be dragging a tab'));
    if (retries > 0 && isDragError) {
      devLog(`User still dragging, retrying in 300ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return attemptSort(windowId, options, retries - 1);
    }
    throw err;
  }
}

async function attemptMoveDomainGroup(
  windowId: number | undefined,
  movedTabId: number,
  options?: SortOptions,
  retries = 3
): Promise<number> {
  try {
    return await moveDomainGroupToTabPosition(windowId, movedTabId, options);
  } catch (err: any) {
    const isDragError =
      err?.message?.includes('user may be dragging a tab') ||
      (typeof err === 'string' && (err as string).includes('user may be dragging a tab'));
    if (retries > 0 && isDragError) {
      devLog(`User still dragging, retrying MBD in 300ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return attemptMoveDomainGroup(windowId, movedTabId, options, retries - 1);
    }
    throw err;
  }
}

async function triggerAutoSort(windowId?: number, reason = 'unknown') {
  if (isSorting) {
    return;
  }

  const isEnabled = await getAutoSortEnabled();
  if (!isEnabled) {
    devLog('Auto Sort is OFF, skipping.');
    return;
  }

  const options = await getAutoSortOptions();

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    try {
      isSorting = true;
      devLog(`Triggering Auto Sort (reason: ${reason})`, options);
      const count = await attemptSort(windowId, options);
      devLog(`Sorted ${count} tabs.`);
    } catch (err) {
      console.error('[Taguru ServiceWorker] Sort error:', err);
    } finally {
      setTimeout(() => {
        isSorting = false;
      }, 150);
    }
  }, 250);
}

if (typeof chrome !== 'undefined') {
  if (chrome.runtime) {
    chrome.runtime.onInstalled?.addListener(() => initDomainOrderCache());
    chrome.runtime.onStartup?.addListener(() => initDomainOrderCache());
  }

  if (chrome.tabs) {
    chrome.tabs.onCreated.addListener((tab) => {
      triggerAutoSort(tab.windowId, 'tab-created');
    });

    chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
      if (changeInfo.url || changeInfo.status === 'complete') {
        triggerAutoSort(tab.windowId, 'tab-updated');
      }
    });

    chrome.tabs.onMoved.addListener((tabId, moveInfo) => {
      if (!isSorting) {
        getAutoSortEnabled().then((isEnabled) => {
          if (!isEnabled) return;
          getAutoSortOptions().then((opts) => {
            const mode: 'reFso' | 'mbd' | 'off' =
              opts.dragMode ?? (opts.autoReFso === false ? 'off' : 'reFso');
            if (mode === 'off') {
              devLog('Tab moved, but drag action is OFF. Skipping.');
              return;
            }

            if (debounceTimer) {
              clearTimeout(debounceTimer);
            }

            debounceTimer = setTimeout(async () => {
              try {
                isSorting = true;
                if (mode === 'mbd') {
                  devLog(`Triggering Move By Domain (MBD) for tab ${tabId}`);
                  const count = await attemptMoveDomainGroup(moveInfo.windowId, tabId, opts);
                  devLog(`MBD moved ${count} tabs.`);
                } else {
                  devLog(`Triggering Auto Re-FSO for tab ${tabId}`);
                  const count = await attemptSort(moveInfo.windowId, opts);
                  devLog(`Re-FSO sorted ${count} tabs.`);
                }
              } catch (err) {
                console.error('[Taguru ServiceWorker] Drag action error:', err);
              } finally {
                setTimeout(() => {
                  isSorting = false;
                }, 150);
              }
            }, 250);
          });
        });
      }
    });
  }
}
