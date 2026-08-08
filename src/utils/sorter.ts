import { SortOptions } from '../types';

export const DEFAULT_SORT_OPTIONS: SortOptions = {
  groupByDomain: true,
  sortByCharRank: false,
  sortByPathSegments: false,
  sortByQueryAndHash: false
};

function normalizeOptions(options?: SortOptions | 'domain' | 'full'): SortOptions {
  if (!options) {
    return DEFAULT_SORT_OPTIONS;
  }
  if (typeof options === 'string') {
    if (options === 'domain') {
      return {
        groupByDomain: true,
        sortByCharRank: true,
        sortByPathSegments: false,
        sortByQueryAndHash: false
      };
    }
    return DEFAULT_SORT_OPTIONS;
  }
  return options;
}

export function getCharCategoryRank(char: string): number {
  const code = char.codePointAt(0) ?? 0;

  // 1. Digits (0-9)
  if (code >= 0x30 && code <= 0x39) {
    return 1;
  }
  // 2. Latin & Symbols (ASCII + Extended ASCII: 0x20-0x7E except digits, plus 0x80-0xFF)
  if ((code >= 0x20 && code <= 0x7e) || (code >= 0x80 && code <= 0xff)) {
    return 2;
  }
  // 3. Kana (Hiragana: 0x3040-0x309F, Katakana: 0x30A0-0x30FF)
  if (code >= 0x3040 && code <= 0x30ff) {
    return 3;
  }
  // 4. Kanji / CJK Ideographs
  if (
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0x20000 && code <= 0x2a6df)
  ) {
    return 4;
  }
  return 5;
}

export function compareCustomStrings(a: string, b: string, useCharRank = true): number {
  if (!useCharRank) {
    return a.localeCompare(b);
  }
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const charA = a[i];
    const charB = b[i];
    const rankA = getCharCategoryRank(charA);
    const rankB = getCharCategoryRank(charB);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    if (rankA === 2) {
      const baseA = charA.normalize('NFD')[0].toLowerCase();
      const baseB = charB.normalize('NFD')[0].toLowerCase();

      if (baseA !== baseB) {
        const baseCodeA = baseA.codePointAt(0) ?? 0;
        const baseCodeB = baseB.codePointAt(0) ?? 0;
        return baseCodeA - baseCodeB;
      }
    }

    const codeA = charA.codePointAt(0) ?? 0;
    const codeB = charB.codePointAt(0) ?? 0;
    if (codeA !== codeB) {
      return codeA - codeB;
    }
  }
  return a.length - b.length;
}

export interface ParsedURL {
  domain: string;
  pathSegments: string[];
  queryAndHash: string;
}

export function parseURL(rawUrl: string): ParsedURL {
  try {
    if (rawUrl.startsWith('file://')) {
      const pathPart = rawUrl.substring(7);
      const segments = pathPart
        .split('/')
        .filter((s) => s.length > 0)
        .map((s) => decodeURIComponent(s));
      return {
        domain: 'file://',
        pathSegments: segments,
        queryAndHash: ''
      };
    }

    if (rawUrl.startsWith('chrome://') || rawUrl.startsWith('edge://')) {
      const scheme = rawUrl.startsWith('chrome://') ? 'chrome://' : 'edge://';
      const rest = rawUrl.substring(scheme.length);
      const parts = rest.split('/').filter((s) => s.length > 0);
      const targetDomain = parts[0] ? `${scheme}${parts[0]}` : scheme;
      return {
        domain: targetDomain,
        pathSegments: parts.slice(1).map((s) => decodeURIComponent(s)),
        queryAndHash: ''
      };
    }

    let cleaned = rawUrl.replace(/^[a-zA-Z]+:\/\//, '');
    if (cleaned.startsWith('www.')) {
      cleaned = cleaned.substring(4);
    }

    const slashIndex = cleaned.indexOf('/');
    let domain = '';
    let rest = '';

    if (slashIndex !== -1) {
      domain = cleaned.substring(0, slashIndex).toLowerCase();
      rest = cleaned.substring(slashIndex);
    } else {
      domain = cleaned.toLowerCase();
      rest = '';
    }

    let queryAndHash = '';
    const queryOrHashIndex = rest.search(/[\?#]/);
    let pathPart = rest;

    if (queryOrHashIndex !== -1) {
      pathPart = rest.substring(0, queryOrHashIndex);
      queryAndHash = rest.substring(queryOrHashIndex);
    }

    const pathSegments = pathPart
      .split('/')
      .filter((segment) => segment.length > 0)
      .map((s) => decodeURIComponent(s));

    return {
      domain: decodeURIComponent(domain) || 'other',
      pathSegments,
      queryAndHash
    };
  } catch {
    return { domain: rawUrl.toLowerCase(), pathSegments: [], queryAndHash: '' };
  }
}

export function compareURLs(
  urlA: string,
  urlB: string,
  options?: SortOptions | 'domain' | 'full'
): number {
  const opts = normalizeOptions(options);
  const parsedA = parseURL(urlA);
  const parsedB = parseURL(urlB);

  // Level A: 1. Compare Domains if groupByDomain is active
  if (opts.groupByDomain) {
    const domainComp = compareCustomStrings(
      parsedA.domain,
      parsedB.domain,
      opts.sortByCharRank
    );
    if (domainComp !== 0) {
      return domainComp;
    }
  }

  // Level B: Options only apply when inside the same domain (or when groupByDomain is true)
  if (opts.groupByDomain) {
    // Level B: 2. Compare Path Segments
    if (opts.sortByPathSegments) {
      const minPathLen = Math.min(
        parsedA.pathSegments.length,
        parsedB.pathSegments.length
      );
      for (let i = 0; i < minPathLen; i += 1) {
        const segComp = compareCustomStrings(
          parsedA.pathSegments[i],
          parsedB.pathSegments[i],
          opts.sortByCharRank
        );
        if (segComp !== 0) {
          return segComp;
        }
      }
      if (parsedA.pathSegments.length !== parsedB.pathSegments.length) {
        return parsedA.pathSegments.length - parsedB.pathSegments.length;
      }
    }

    // Level B: 3. Compare Query & Hash
    if (opts.sortByQueryAndHash) {
      const queryComp = compareCustomStrings(
        parsedA.queryAndHash,
        parsedB.queryAndHash,
        opts.sortByCharRank
      );
      if (queryComp !== 0) {
        return queryComp;
      }
    }
  }

  return 0;
}

export function getTabUrl(tab: { pendingUrl?: string; url?: string }): string {
  return tab.pendingUrl || tab.url || '';
}

export function sortTabList<T extends { pendingUrl?: string; url?: string }>(
  tabs: T[],
  options?: SortOptions | 'domain' | 'full'
): T[] {
  if (tabs.length <= 1) {
    return [...tabs];
  }
  const opts = normalizeOptions(options);

  // First-Occurrence Domain Grouping Strategy (when Grouping is ON but Character Priority Sort is OFF)
  if (opts.groupByDomain && !opts.sortByCharRank) {
    const domainMap = new Map<string, T[]>();
    for (const tab of tabs) {
      const domain = parseURL(getTabUrl(tab)).domain;
      if (!domainMap.has(domain)) {
        domainMap.set(domain, []);
      }
      domainMap.get(domain)!.push(tab);
    }

    const result: T[] = [];
    for (const [, bucket] of domainMap) {
      if (opts.sortByPathSegments || opts.sortByQueryAndHash) {
        bucket.sort((a, b) => compareURLs(getTabUrl(a), getTabUrl(b), opts));
      }
      result.push(...bucket);
    }
    return result;
  }

  // Standard Comparison Sorting
  const sorted = [...tabs];
  sorted.sort((a, b) => compareURLs(getTabUrl(a), getTabUrl(b), opts));
  return sorted;
}

export async function sortCurrentWindowTabs(
  windowId?: number,
  options?: SortOptions | 'domain' | 'full'
): Promise<number> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    return 0;
  }

  const opts = normalizeOptions(options);
  const queryInfo = windowId !== undefined ? { windowId } : { currentWindow: true };
  const tabs = await chrome.tabs.query(queryInfo);
  if (!tabs || tabs.length <= 1) {
    return 0;
  }

  const pinnedTabs = sortTabList(tabs.filter((t) => t.pinned), opts);
  const unpinnedTabs = sortTabList(tabs.filter((t) => !t.pinned), opts);

  const sortedTabs = [...pinnedTabs, ...unpinnedTabs];
  const tabIds = sortedTabs
    .map((t) => t.id)
    .filter((id): id is number => id !== undefined);

  if (tabIds.length > 0) {
    await chrome.tabs.move(tabIds, { index: 0 });
  }

  return sortedTabs.length;
}



export async function moveDomainGroupToTabPosition(
  windowId: number | undefined,
  movedTabId: number,
  options?: SortOptions | 'domain' | 'full'
): Promise<number> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    return 0;
  }

  const opts = normalizeOptions(options);
  const queryInfo = windowId !== undefined ? { windowId } : { currentWindow: true };
  const tabs = await chrome.tabs.query(queryInfo);
  if (!tabs || tabs.length <= 1) {
    return 0;
  }

  const movedTab = tabs.find((t) => t.id === movedTabId);
  if (!movedTab) {
    return 0;
  }

  const isMovedPinned = !!movedTab.pinned;
  const targetTabs = tabs.filter((t) => !!t.pinned === isMovedPinned);

  const movedDomain = parseURL(getTabUrl(movedTab)).domain;
  const domainTabs = targetTabs.filter(
    (t) => parseURL(getTabUrl(t)).domain === movedDomain
  );
  const otherTabs = targetTabs.filter(
    (t) => parseURL(getTabUrl(t)).domain !== movedDomain
  );

  if (domainTabs.length <= 1) {
    return 0;
  }

  const firstIndex = targetTabs.findIndex(
    (t) => parseURL(getTabUrl(t)).domain === movedDomain
  );
  let lastIndex = -1;
  for (let i = targetTabs.length - 1; i >= 0; i -= 1) {
    if (parseURL(getTabUrl(targetTabs[i])).domain === movedDomain) {
      lastIndex = i;
      break;
    }
  }

  let isContiguous = true;
  for (let i = firstIndex; i <= lastIndex; i += 1) {
    if (parseURL(getTabUrl(targetTabs[i])).domain !== movedDomain) {
      isContiguous = false;
      break;
    }
  }

  // Case A: Internal Drag within contiguous domain group
  if (isContiguous) {
    // If Level B sub-path sorting is NOT requested, respect the user's manual internal order
    if (!opts.sortByPathSegments && !opts.sortByQueryAndHash) {
      return 0;
    }
    // If Level B is requested, sort domainTabs internally
    domainTabs.sort((a, b) => compareURLs(getTabUrl(a), getTabUrl(b), opts));
    const newContiguousOrder = [
      ...targetTabs.slice(0, firstIndex),
      ...domainTabs,
      ...targetTabs.slice(lastIndex + 1)
    ];

    const fullSortedTabs = isMovedPinned
      ? [...newContiguousOrder, ...tabs.filter((t) => !t.pinned)]
      : [...tabs.filter((t) => t.pinned), ...newContiguousOrder];

    const tabIds = fullSortedTabs
      .map((t) => t.id)
      .filter((id): id is number => id !== undefined);

    if (tabIds.length > 0) {
      await chrome.tabs.move(tabIds, { index: 0 });
    }
    return tabIds.length;
  }

  // Case B: Inter-Domain Drag across other domains -> Consolidate into a cohesive block at target position
  domainTabs.sort((a, b) =>
    compareURLs(getTabUrl(a), getTabUrl(b), {
      groupByDomain: true,
      sortByCharRank: opts.sortByCharRank,
      sortByPathSegments: true,
      sortByQueryAndHash: true
    })
  );

  const movedIndexInTarget = targetTabs.findIndex((t) => t.id === movedTabId);
  if (movedIndexInTarget === -1) {
    return 0;
  }

  let nonDomainCountBefore = 0;
  for (let i = 0; i < movedIndexInTarget; i += 1) {
    if (parseURL(getTabUrl(targetTabs[i])).domain !== movedDomain) {
      nonDomainCountBefore += 1;
    }
  }

  const newTargetOrder = [
    ...otherTabs.slice(0, nonDomainCountBefore),
    ...domainTabs,
    ...otherTabs.slice(nonDomainCountBefore)
  ];

  const fullSortedTabs = isMovedPinned
    ? [...newTargetOrder, ...tabs.filter((t) => !t.pinned)]
    : [...tabs.filter((t) => t.pinned), ...newTargetOrder];

  const tabIds = fullSortedTabs
    .map((t) => t.id)
    .filter((id): id is number => id !== undefined);

  if (tabIds.length > 0) {
    await chrome.tabs.move(tabIds, { index: 0 });
  }

  return tabIds.length;
}