import { getAutoSortOptions, getManualSortOptions } from './storage';

export async function devLog(message: string, ...args: any[]): Promise<void> {
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
    console.log(`[Taguru DevLog] ${message}`, ...args);
    return;
  }

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
