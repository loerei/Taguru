import { devLog } from './logger';

export interface UpdateCheckResult {
  hasUpdate: boolean;
  latestVersion: string;
  releaseUrl: string;
}

interface ReleaseCache {
  version: string;
  url: string;
  checkedAt: number;
}

const CACHE_KEY = 'taguru_latest_release_cache';
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours cache

function parseSemver(ver: string): number[] {
  return ver.replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
}

export function isNewerVersion(currentVersion: string, latestVersion: string): boolean {
  const current = parseSemver(currentVersion);
  const latest = parseSemver(latestVersion);

  const maxLength = Math.max(current.length, latest.length);
  for (let i = 0; i < maxLength; i += 1) {
    const c = current[i] ?? 0;
    const l = latest[i] ?? 0;
    if (l > c) return true;
    if (l < c) return false;
  }
  return false;
}

export async function checkLatestRelease(): Promise<UpdateCheckResult> {
  const currentVersion = chrome.runtime.getManifest().version;
  const defaultUrl = 'https://github.com/loerei/Taguru/releases/latest';

  try {
    const stored = await chrome.storage.local.get(CACHE_KEY);
    const cache = stored[CACHE_KEY] as ReleaseCache | undefined;
    const now = Date.now();

    if (cache && now - cache.checkedAt < CACHE_DURATION_MS) {
      const hasUpdate = isNewerVersion(currentVersion, cache.version);
      devLog(`[UpdateChecker] Using cached release info: ${cache.version} (hasUpdate: ${hasUpdate})`);
      return {
        hasUpdate,
        latestVersion: cache.version,
        releaseUrl: cache.url || defaultUrl
      };
    }

    devLog('[UpdateChecker] Fetching latest release from GitHub API...');
    const response = await fetch('https://api.github.com/repos/loerei/Taguru/releases/latest', {
      headers: { Accept: 'application/vnd.github.v3+json' }
    });

    if (!response.ok) {
      devLog(`[UpdateChecker] GitHub API returned status ${response.status}`);
      if (cache) {
        return {
          hasUpdate: isNewerVersion(currentVersion, cache.version),
          latestVersion: cache.version,
          releaseUrl: cache.url || defaultUrl
        };
      }
      return { hasUpdate: false, latestVersion: currentVersion, releaseUrl: defaultUrl };
    }

    const data = await response.json();
    const latestVersion = (data.tag_name || '').replace(/^v/, '');
    const releaseUrl = data.html_url || defaultUrl;

    const newCache: ReleaseCache = {
      version: latestVersion,
      url: releaseUrl,
      checkedAt: now
    };
    await chrome.storage.local.set({ [CACHE_KEY]: newCache });

    const hasUpdate = isNewerVersion(currentVersion, latestVersion);
    devLog(`[UpdateChecker] Latest release fetched: v${latestVersion} (hasUpdate: ${hasUpdate})`);

    return {
      hasUpdate,
      latestVersion,
      releaseUrl
    };
  } catch (error) {
    devLog(`[UpdateChecker] Error checking update: ${String(error)}`);
    return { hasUpdate: false, latestVersion: currentVersion, releaseUrl: defaultUrl };
  }
}
