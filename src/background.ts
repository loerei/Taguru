import { sortCurrentWindowTabs, moveDomainGroupToTabPosition } from './utils/sorter';
import { getAutoSortEnabled, getAutoSortOptions } from './utils/storage';
import { SortOptions } from './types';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isSorting = false;

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
      console.log(`[Taguru ServiceWorker] User still dragging, retrying in 300ms... (${retries} retries left)`);
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
      console.log(`[Taguru ServiceWorker] User still dragging, retrying MBD in 300ms... (${retries} retries left)`);
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
    console.log('[Taguru ServiceWorker] Auto Sort is OFF, skipping.');
    return;
  }

  const options = await getAutoSortOptions();

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    try {
      isSorting = true;
      console.log(`[Taguru ServiceWorker] Triggering Auto Sort (reason: ${reason})`, options);
      const count = await attemptSort(windowId, options);
      console.log(`[Taguru ServiceWorker] Sorted ${count} tabs.`);
    } catch (err) {
      console.error('[Taguru ServiceWorker] Sort error:', err);
    } finally {
      setTimeout(() => {
        isSorting = false;
      }, 150);
    }
  }, 250);
}

if (typeof chrome !== 'undefined' && chrome.tabs) {
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
            console.log('[Taguru ServiceWorker] Tab moved, but drag action is OFF. Skipping.');
            return;
          }

          if (debounceTimer) {
            clearTimeout(debounceTimer);
          }

          debounceTimer = setTimeout(async () => {
            try {
              isSorting = true;
              if (mode === 'mbd') {
                console.log(`[Taguru ServiceWorker] Triggering Move By Domain (MBD) for tab ${tabId}`);
                const count = await attemptMoveDomainGroup(moveInfo.windowId, tabId, opts);
                console.log(`[Taguru ServiceWorker] MBD moved ${count} tabs.`);
              } else {
                console.log(`[Taguru ServiceWorker] Triggering Auto Re-FSO for tab ${tabId}`);
                const count = await attemptSort(moveInfo.windowId, opts);
                console.log(`[Taguru ServiceWorker] Re-FSO sorted ${count} tabs.`);
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
