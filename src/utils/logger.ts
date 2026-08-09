import { getAutoSortOptions, getManualSortOptions } from './storage';

const MAX_LOG_ENTRIES = 1000;

function formatTimestamp(): string {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const padMs = (n: number) => n.toString().padStart(3, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${padMs(d.getMilliseconds())}`;
}

async function saveLogToBuffer(entry: string): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome?.storage?.local) {
    return;
  }
  try {
    const result = await chrome.storage.local.get('debugLogs');
    const logs: string[] = Array.isArray(result.debugLogs) ? result.debugLogs : [];
    logs.push(entry);
    if (logs.length > MAX_LOG_ENTRIES) {
      logs.splice(0, logs.length - MAX_LOG_ENTRIES);
    }
    await chrome.storage.local.set({ debugLogs: logs });
  } catch (_e) {
    // Ignore storage errors
  }
}

export async function devLog(message: string, ...args: any[]): Promise<void> {
  if (import.meta.env?.MODE === 'release') {
    return;
  }

  const timestamp = formatTimestamp();
  const formattedArgs = args.length > 0 ? ' ' + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ') : '';
  const logLine = `[${timestamp}] ${message}${formattedArgs}`;

  if (import.meta.env?.DEV) {
    console.log(`[Taguru DevLog] ${message}`, ...args);
  }

  try {
    const autoOpts = await getAutoSortOptions();
    const manualOpts = await getManualSortOptions();
    if (autoOpts.debugLogging || manualOpts.debugLogging) {
      console.log(`[Taguru DevLog] ${message}`, ...args);
      await saveLogToBuffer(logLine);
    }
  } catch (err) {
    if (err) void 0;
  }
}

export async function logTabPositionsSnapshot(actionTag: string): Promise<void> {
  if (import.meta.env?.MODE === 'release') {
    return;
  }
  if (typeof chrome === 'undefined' || !chrome?.tabs) {
    return;
  }

  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    if (!tabs || tabs.length === 0) return;

    const parseDomain = (rawUrl: string): string => {
      try {
        const urlObj = new URL(rawUrl);
        let domain = urlObj.hostname;
        if (domain.startsWith('www.')) domain = domain.substring(4);
        return domain || 'other';
      } catch {
        return 'other';
      }
    };

    const groups: { domain: string; range: string; tabIds: number[] }[] = [];
    let currentDomain: string | null = null;
    let currentTabIds: number[] = [];
    let startIdx = 0;

    tabs.forEach((tab, idx) => {
      const url = tab.pendingUrl || tab.url || '';
      const domain = parseDomain(url);

      if (currentDomain === null) {
        currentDomain = domain;
        if (tab.id !== undefined) currentTabIds.push(tab.id);
        startIdx = idx;
      } else if (domain === currentDomain) {
        if (tab.id !== undefined) currentTabIds.push(tab.id);
      } else {
        const endIdx = idx - 1;
        const rangeStr = startIdx === endIdx ? `[${startIdx}]` : `[${startIdx}..${endIdx}]`;
        groups.push({ domain: currentDomain, range: rangeStr, tabIds: [...currentTabIds] });

        currentDomain = domain;
        currentTabIds = tab.id !== undefined ? [tab.id] : [];
        startIdx = idx;
      }
    });

    if (currentDomain !== null) {
      const endIdx = tabs.length - 1;
      const rangeStr = startIdx === endIdx ? `[${startIdx}]` : `[${startIdx}..${endIdx}]`;
      groups.push({ domain: currentDomain, range: rangeStr, tabIds: [...currentTabIds] });
    }

    const summaryStr = groups.map((g) => `${g.range} ${g.domain} (ids: [${g.tabIds.join(', ')}])`).join(' | ');
    await devLog(`[Tab Positions Snapshot] after [${actionTag}] -> Total: ${tabs.length} tabs`);
    await devLog(`  -> ${summaryStr}`);
  } catch (_e) {
    // Ignore logging errors
  }
}

export async function getDebugLogs(): Promise<string[]> {
  if (typeof chrome === 'undefined' || !chrome?.storage?.local) {
    return [];
  }
  const result = await chrome.storage.local.get('debugLogs');
  return Array.isArray(result.debugLogs) ? result.debugLogs : [];
}

export async function clearDebugLogs(): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome?.storage?.local) {
    return;
  }
  await chrome.storage.local.remove('debugLogs');
}

export async function exportDebugLogsAsFile(): Promise<void> {
  const logs = await getDebugLogs();
  const content = logs.length > 0 ? logs.join('\n') : 'No log entries recorded.';
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taguru-debug-logs-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function copyDebugLogsToClipboard(): Promise<boolean> {
  const logs = await getDebugLogs();
  const content = logs.length > 0 ? logs.join('\n') : 'No log entries recorded.';
  try {
    await navigator.clipboard.writeText(content);
    return true;
  } catch (err) {
    if (err) void 0;
    return false;
  }
}
