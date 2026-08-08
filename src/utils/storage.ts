import { SavedGroup, SavedTab, SortOptions } from '../types';

const STORAGE_KEY = 'taguru_groups';
const AUTO_SORT_KEY = 'taguru_auto_sort';
const AUTO_SORT_LEVEL_KEY = 'taguru_auto_sort_level';
const MANUAL_SORT_OPTIONS_KEY = 'taguru_manual_sort_options';
const AUTO_SORT_OPTIONS_KEY = 'taguru_auto_sort_options';

export const DEFAULT_SORT_OPTIONS: SortOptions = {
  groupByDomain: true,
  sortByCharRank: false,
  sortByPathSegments: false,
  sortByQueryAndHash: false,
  autoReFso: true,
  dragMode: 'mbd',
  closeDomainOnMiddleClick: false,
  debugLogging: false
};

export const DEFAULT_DOMAIN_ONLY_SORT_OPTIONS: SortOptions = {
  groupByDomain: true,
  sortByCharRank: false,
  sortByPathSegments: false,
  sortByQueryAndHash: false
};

export async function getGroups(): Promise<SavedGroup[]> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY] || []);
    });
  });
}

export async function saveGroups(groups: SavedGroup[]): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: groups }, () => {
      resolve();
    });
  });
}

export async function saveCurrentWindowAsGroup(customName?: string): Promise<SavedGroup | null> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    return null;
  }

  const tabs = await chrome.tabs.query({ currentWindow: true });
  if (!tabs || tabs.length === 0) {
    return null;
  }

  const savedTabs: SavedTab[] = tabs
    .map((t) => {
      const url = t.pendingUrl || t.url || '';
      return {
        url,
        title: t.title || url || 'Untitled',
        favIconUrl: t.favIconUrl
      };
    })
    .filter((t) => t.url && !t.url.startsWith('chrome://newtab'));

  if (savedTabs.length === 0) {
    return null;
  }

  const now = Date.now();
  const dateStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const defaultName = customName?.trim() || `Group - ${dateStr} (${savedTabs.length} tabs)`;

  const newGroup: SavedGroup = {
    id: `group_${now}_${Math.random().toString(36).substring(2, 7)}`,
    name: defaultName,
    createdAt: now,
    tabs: savedTabs
  };

  const currentGroups = await getGroups();
  const updatedGroups = [newGroup, ...currentGroups];
  await saveGroups(updatedGroups);
  return newGroup;
}

export async function overwriteGroup(groupId: string): Promise<SavedGroup | null> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    return null;
  }

  const tabs = await chrome.tabs.query({ currentWindow: true });
  if (!tabs || tabs.length === 0) {
    return null;
  }

  const savedTabs: SavedTab[] = tabs
    .map((t) => {
      const url = t.pendingUrl || t.url || '';
      return {
        url,
        title: t.title || url || 'Untitled',
        favIconUrl: t.favIconUrl
      };
    })
    .filter((t) => t.url && !t.url.startsWith('chrome://newtab'));

  const currentGroups = await getGroups();
  let updatedGroup: SavedGroup | null = null;

  const updatedGroups = currentGroups.map((group) => {
    if (group.id === groupId) {
      updatedGroup = { ...group, tabs: savedTabs };
      return updatedGroup;
    }
    return group;
  });

  if (updatedGroup) {
    await saveGroups(updatedGroups);
  }
  return updatedGroup;
}

export async function deleteGroup(groupId: string): Promise<void> {
  const currentGroups = await getGroups();
  const updatedGroups = currentGroups.filter((g) => g.id !== groupId);
  await saveGroups(updatedGroups);
}

export async function updateGroupName(groupId: string, newName: string): Promise<void> {
  const currentGroups = await getGroups();
  const updatedGroups = currentGroups.map((g) => {
    if (g.id === groupId) {
      return { ...g, name: newName.trim() || g.name };
    }
    return g;
  });
  await saveGroups(updatedGroups);
}

export async function loadGroupInCurrentWindow(group: SavedGroup): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    return;
  }
  for (const tab of group.tabs) {
    await chrome.tabs.create({ url: tab.url, active: false });
  }
}

export async function loadGroupInNewWindow(group: SavedGroup): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.windows) {
    return;
  }
  const urls = group.tabs.map((t) => t.url);
  if (urls.length > 0) {
    await chrome.windows.create({ url: urls });
  }
}

export async function getAutoSortEnabled(): Promise<boolean> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return localStorage.getItem(AUTO_SORT_KEY) === 'true';
  }
  return new Promise((resolve) => {
    chrome.storage.local.get([AUTO_SORT_KEY], (res) => {
      resolve(!!res[AUTO_SORT_KEY]);
    });
  });
}

export async function setAutoSortEnabled(enabled: boolean): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    localStorage.setItem(AUTO_SORT_KEY, String(enabled));
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.local.set({ [AUTO_SORT_KEY]: enabled }, () => {
      resolve();
    });
  });
}

export async function getAutoSortLevel(): Promise<'domain' | 'full'> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    const raw = localStorage.getItem(AUTO_SORT_LEVEL_KEY);
    return (raw as 'domain' | 'full') || 'full';
  }
  return new Promise((resolve) => {
    chrome.storage.local.get([AUTO_SORT_LEVEL_KEY], (res) => {
      resolve(res[AUTO_SORT_LEVEL_KEY] === 'domain' ? 'domain' : 'full');
    });
  });
}

export async function setAutoSortLevel(level: 'domain' | 'full'): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    localStorage.setItem(AUTO_SORT_LEVEL_KEY, level);
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.local.set({ [AUTO_SORT_LEVEL_KEY]: level }, () => {
      resolve();
    });
  });
}



function parseSortOptions(raw: any, legacyLevel?: string): SortOptions {
  if (raw && typeof raw === 'object') {
    const dragModeVal: 'reFso' | 'mbd' | 'off' =
      raw.dragMode ?? (raw.autoReFso === false ? 'off' : 'reFso');
    return {
      groupByDomain: raw.groupByDomain ?? true,
      sortByCharRank: raw.sortByCharRank ?? false,
      sortByPathSegments: raw.sortByPathSegments ?? false,
      sortByQueryAndHash: raw.sortByQueryAndHash ?? false,
      autoReFso: dragModeVal !== 'off',
      dragMode: dragModeVal,
      closeDomainOnMiddleClick: raw.closeDomainOnMiddleClick ?? false,
      debugLogging: raw.debugLogging ?? false
    };
  }
  if (legacyLevel === 'full') {
    return {
      groupByDomain: true,
      sortByCharRank: true,
      sortByPathSegments: true,
      sortByQueryAndHash: true
    };
  }
  return { ...DEFAULT_SORT_OPTIONS };
}

export async function getManualSortOptions(): Promise<SortOptions> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    const raw = localStorage.getItem(MANUAL_SORT_OPTIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parseSortOptions(parsed);
  }
  return new Promise((resolve) => {
    chrome.storage.local.get([MANUAL_SORT_OPTIONS_KEY], (res) => {
      resolve(parseSortOptions(res[MANUAL_SORT_OPTIONS_KEY]));
    });
  });
}

export async function setManualSortOptions(options: SortOptions): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    localStorage.setItem(MANUAL_SORT_OPTIONS_KEY, JSON.stringify(options));
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.local.set({ [MANUAL_SORT_OPTIONS_KEY]: options }, () => {
      resolve();
    });
  });
}

export async function getAutoSortOptions(): Promise<SortOptions> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    const raw = localStorage.getItem(AUTO_SORT_OPTIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const legacy = localStorage.getItem(AUTO_SORT_LEVEL_KEY) || undefined;
    return parseSortOptions(parsed, legacy);
  }
  return new Promise((resolve) => {
    chrome.storage.local.get([AUTO_SORT_OPTIONS_KEY, AUTO_SORT_LEVEL_KEY], (res) => {
      resolve(parseSortOptions(res[AUTO_SORT_OPTIONS_KEY], res[AUTO_SORT_LEVEL_KEY]));
    });
  });
}

export async function setAutoSortOptions(options: SortOptions): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    localStorage.setItem(AUTO_SORT_OPTIONS_KEY, JSON.stringify(options));
    return;
  }
  return new Promise((resolve) => {
    chrome.storage.local.set({ [AUTO_SORT_OPTIONS_KEY]: options }, () => {
      resolve();
    });
  });
}

const ACTION_CLICK_BEHAVIOR_KEY = 'taguru_action_click_behavior';

export async function getDefaultClickBehavior(): Promise<'popup' | 'sidepanel'> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    const raw = localStorage.getItem(ACTION_CLICK_BEHAVIOR_KEY);
    return (raw as 'popup' | 'sidepanel') || 'popup';
  }
  return new Promise((resolve) => {
    chrome.storage.local.get([ACTION_CLICK_BEHAVIOR_KEY], (res) => {
      resolve(res[ACTION_CLICK_BEHAVIOR_KEY] === 'sidepanel' ? 'sidepanel' : 'popup');
    });
  });
}

export async function setDefaultClickBehavior(behavior: 'popup' | 'sidepanel'): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    localStorage.setItem(ACTION_CLICK_BEHAVIOR_KEY, behavior);
  } else {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set({ [ACTION_CLICK_BEHAVIOR_KEY]: behavior }, () => {
        resolve();
      });
    });
  }

  if (typeof chrome !== 'undefined' && chrome.sidePanel && typeof chrome.sidePanel.setPanelBehavior === 'function') {
    try {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: behavior === 'sidepanel' });
    } catch (_e) {
      // Ignore sidePanel API errors on unsupported browsers
    }
  }
}