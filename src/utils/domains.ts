import { parseURL } from './sorter';
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

  const newGroup: SavedGroup = {
    id: `group_${now}_${Math.random().toString(36).substring(2, 7)}`,
    name,
    createdAt: now,
    tabs: targetTabs
  };

  const currentGroups = await getGroups();
  await saveGroups([newGroup, ...currentGroups]);
  return newGroup;
}
