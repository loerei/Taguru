import { sortCurrentWindowTabs, moveDomainGroupToTabPosition, updateDomainOrderCache } from './utils/sorter';
import { getAutoSortEnabled, getAutoSortOptions, getDefaultClickBehavior, setDefaultClickBehavior } from './utils/storage';
import { devLog, logTabPositionsSnapshot } from './utils/logger';
import { SortOptions } from './types';

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let isSorting = false;

async function initActionClickBehavior() {
  try {
    const behavior = await getDefaultClickBehavior();
    await setDefaultClickBehavior(behavior);
  } catch (_e) {
    // Ignore error
  }
}
initActionClickBehavior();

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
  actionTag = 'Manual Sort Button',
  maxWaitMs = 10000
): Promise<number> {
  const startTime = Date.now();
  while (true) {
    try {
      return await sortCurrentWindowTabs(windowId, options, actionTag);
    } catch (err: any) {
      const isDragError =
        err?.message?.includes('user may be dragging a tab') ||
        (typeof err === 'string' && (err as string).includes('user may be dragging a tab'));
      const elapsed = Date.now() - startTime;
      if (isDragError && elapsed < maxWaitMs) {
        devLog(`Tab is being dragged, awaiting drop (${Math.round((maxWaitMs - elapsed) / 1000)}s remaining)...`);
        await new Promise((resolve) => setTimeout(resolve, 200));
        continue;
      }
      throw err;
    }
  }
}

async function attemptMoveDomainGroup(
  windowId: number | undefined,
  movedTabId: number,
  options?: SortOptions,
  maxWaitMs = 10000
): Promise<number> {
  const startTime = Date.now();
  while (true) {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      try {
        const tab = await chrome.tabs.get(movedTabId);
        if (windowId !== undefined && tab.windowId !== windowId) {
          devLog(`Tab ${movedTabId} moved to another window (${tab.windowId} != ${windowId}). Aborting MBD.`);
          return 0;
        }
      } catch (_e) {
        devLog(`Tab ${movedTabId} no longer exists (closed or torn off). Aborting MBD.`);
        return 0;
      }
    }

    try {
      return await moveDomainGroupToTabPosition(windowId, movedTabId, options);
    } catch (err: any) {
      const isDragError =
        err?.message?.includes('user may be dragging a tab') ||
        (typeof err === 'string' && (err as string).includes('user may be dragging a tab'));
      const elapsed = Date.now() - startTime;
      if (isDragError && elapsed < maxWaitMs) {
        devLog(`User still dragging tab ${movedTabId}, awaiting drop (${Math.round((maxWaitMs - elapsed) / 1000)}s remaining)...`);
        await new Promise((resolve) => setTimeout(resolve, 200));
        continue;
      }
      throw err;
    }
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
      const actionTag = `Auto Sort (${reason})`;
      const count = await attemptSort(windowId, options, actionTag);
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
                  await logTabPositionsSnapshot(`MBD Drag Complete (${count} moved)`);
                } else {
                  devLog(`Triggering Auto Re-FSO for tab ${tabId}`);
                  const count = await attemptSort(moveInfo.windowId, opts, 'Auto Re-FSO');
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
