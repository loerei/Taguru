import { parseURL, updateDomainOrderCache } from './sorter';
import { logTabPositionsSnapshot } from './logger';
import { SavedTab, SavedGroup } from '../types';
import { saveGroups, getGroups } from './storage';

export interface DomainGroup {
  domain: string;
  count: number;
  tabIds: number[];
  tabs: SavedTab[];
}

export async function getDomainsInCurrentWindow(): Promise<DomainGroup[]> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    return [];
  }

  const tabs = await chrome.tabs.query({ currentWindow: true });
  if (!tabs || tabs.length === 0) {
    return [];
  }

  const map = new Map<string, { tabIds: number[]; tabs: SavedTab[] }>();

  for (const tab of tabs) {
    const url = tab.pendingUrl || tab.url;
    if (!url || url.startsWith('chrome://newtab')) {
      continue;
    }
    const parsed = parseURL(url);
    const domain = parsed.domain || 'other';

    if (!map.has(domain)) {
      map.set(domain, { tabIds: [], tabs: [] });
    }
    const item = map.get(domain)!;
    if (tab.id !== undefined) {
      item.tabIds.push(tab.id);
    }
    item.tabs.push({
      url,
      title: tab.title || url,
      favIconUrl: tab.favIconUrl
    });
  }

  const result: DomainGroup[] = [];
  map.forEach((value, domain) => {
    result.push({
      domain,
      count: value.tabs.length,
      tabIds: value.tabIds,
      tabs: value.tabs
    });
  });

  return result;
}

export async function closeDomainTabs(domains: string[]): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    return;
  }
  const allDomains = new Set(domains);
  const currentDomains = await getDomainsInCurrentWindow();
  const targetTabIds: number[] = [];

  for (const d of currentDomains) {
    if (allDomains.has(d.domain)) {
      targetTabIds.push(...d.tabIds);
    }
  }

  if (targetTabIds.length > 0) {
    await chrome.tabs.remove(targetTabIds);
  }
}

export async function moveDomainTabsToNewWindow(domains: string[]): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.windows || !chrome.tabs) {
    return;
  }
  const allDomains = new Set(domains);
  const currentDomains = await getDomainsInCurrentWindow();
  const targetTabs: SavedTab[] = [];
  const targetTabIds: number[] = [];

  for (const d of currentDomains) {
    if (allDomains.has(d.domain)) {
      targetTabs.push(...d.tabs);
      targetTabIds.push(...d.tabIds);
    }
  }

  if (targetTabs.length === 0) {
    return;
  }

  const urls = targetTabs.map((t) => t.url);
  await chrome.windows.create({ url: urls });
  if (targetTabIds.length > 0) {
    await chrome.tabs.remove(targetTabIds);
  }
}

export async function saveDomainAsGroup(domains: string[]): Promise<SavedGroup | null> {
  const allDomains = new Set(domains);
  const currentDomains = await getDomainsInCurrentWindow();
  const targetTabs: SavedTab[] = [];

  for (const d of currentDomains) {
    if (allDomains.has(d.domain)) {
      targetTabs.push(...d.tabs);
    }
  }

  if (targetTabs.length === 0) {
    return null;
  }

  const now = Date.now();
  const domainStr = domains.length === 1 ? domains[0] : `${domains.length} domains`;
  const name = `Group - ${domainStr} (${targetTabs.length} tabs)`;

  const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `group_${now}_${Math.floor(Math.random() * 1000000)}`;

  const newGroup: SavedGroup = {
    id: uniqueId,
    name,
    createdAt: now,
    tabs: targetTabs
  };

  const currentGroups = await getGroups();
  await saveGroups([newGroup, ...currentGroups]);
  return newGroup;
}

export async function addDomainsToExistingGroup(groupId: string, domains: string[]): Promise<SavedGroup | null> {
  const allDomains = new Set(domains);
  const currentDomains = await getDomainsInCurrentWindow();
  const newTabs: SavedTab[] = [];

  for (const d of currentDomains) {
    if (allDomains.has(d.domain)) {
      newTabs.push(...d.tabs);
    }
  }

  if (newTabs.length === 0) {
    return null;
  }

  const currentGroups = await getGroups();
  const targetGroupIndex = currentGroups.findIndex((g) => g.id === groupId);
  if (targetGroupIndex === -1) {
    return null;
  }

  const targetGroup = currentGroups[targetGroupIndex];
  const existingUrls = new Set(targetGroup.tabs.map((t) => t.url));
  const uniqueNewTabs = newTabs.filter((t) => !existingUrls.has(t.url));

  const updatedGroup: SavedGroup = {
    ...targetGroup,
    tabs: [...targetGroup.tabs, ...uniqueNewTabs]
  };

  const updatedGroups = [...currentGroups];
  updatedGroups[targetGroupIndex] = updatedGroup;
  await saveGroups(updatedGroups);

  return updatedGroup;
}

export async function reorderDomainBlock(
  draggedDomain: DomainGroup,
  targetDomain: DomainGroup,
  place: 'before' | 'after' = 'after'
): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    return;
  }

  if (draggedDomain.domain === targetDomain.domain) {
    return;
  }

  const allTabs = await chrome.tabs.query({ currentWindow: true });
  if (!allTabs || allTabs.length === 0) return;

  const targetTabIds = targetDomain.tabIds;
  if (targetTabIds.length === 0) return;

  const targetTabObj = place === 'before'
    ? allTabs.find((t) => t.id === targetTabIds[0])
    : allTabs.find((t) => t.id === targetTabIds[targetTabIds.length - 1]);

  if (targetTabObj?.index === undefined) return;

  let targetIndex = targetTabObj.index;
  if (place === 'after') {
    targetIndex += 1;
  }

  const tabIdsToMove = draggedDomain.tabIds;
  if (tabIdsToMove.length === 0) return;

  await chrome.tabs.move(tabIdsToMove, { index: targetIndex });
  updateDomainOrderCache(draggedDomain.tabs as any);
  await logTabPositionsSnapshot('UI Domain Card Drag');
}
