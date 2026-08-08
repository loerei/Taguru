import { getAutoSortOptions, getManualSortOptions } from './storage';

export async function devLog(message: string, ...args: any[]): Promise<void> {
  // Completely silence dev logs in Release mode
  if (typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'release') {
    return;
  }

  // Always log in Vite dev server mode
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log(`[Taguru DevLog] ${message}`, ...args);
    return;
  }

  // Otherwise check user's debugLogging flag in storage
  try {
    const autoOpts = await getAutoSortOptions();
    const manualOpts = await getManualSortOptions();
    if (autoOpts.debugLogging || manualOpts.debugLogging) {
      console.log(`[Taguru DevLog] ${message}`, ...args);
    }
  } catch (_e) {
    // Silent fallback
  }
}
