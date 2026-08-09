import React, { useState, useEffect, useCallback } from 'react';
import { SavedGroup, SortOptions } from './types';
import { sortCurrentWindowTabs } from './utils/sorter';
import {
  getGroups,
  saveGroups,
  saveCurrentWindowAsGroup,
  overwriteGroup,
  deleteGroup,
  updateGroupName,
  loadGroupInCurrentWindow,
  loadGroupInNewWindow,
  getAutoSortEnabled,
  setAutoSortEnabled,
  getManualSortOptions,
  setManualSortOptions,
  getAutoSortOptions,
  setAutoSortOptions,
  getActiveView,
  setActiveViewStorage,
  DEFAULT_SORT_OPTIONS
} from './utils/storage';
import {
  DomainGroup,
  getDomainsInCurrentWindow,
  closeDomainTabs,
  moveDomainTabsToNewWindow,
  saveDomainAsGroup
} from './utils/domains';
import { Header } from './components/Header';
import { GroupList } from './components/GroupList';
import { DomainList } from './components/DomainList';
import { SettingsView } from './components/SettingsView';
import { checkLatestRelease, UpdateCheckResult } from './utils/updateChecker';

interface AppProps {
  isSidePanel?: boolean;
}

export const App: React.FC<AppProps> = ({ isSidePanel = false }) => {
  const [activeView, setActiveView] = useState<'groups' | 'domains' | 'settings'>('groups');
  const [isAutoSort, setIsAutoSort] = useState<boolean>(false);
  const [manualSortOptions, setManualSortOptionsState] = useState<SortOptions>(DEFAULT_SORT_OPTIONS);
  const [autoSortOptions, setAutoSortOptionsState] = useState<SortOptions>(DEFAULT_SORT_OPTIONS);
  const [groups, setGroups] = useState<SavedGroup[]>([]);
  const [domains, setDomains] = useState<DomainGroup[]>([]);
  const [status, setStatus] = useState<string>('');
  const [updateInfo, setUpdateInfo] = useState<UpdateCheckResult | null>(null);

  const refreshGroups = useCallback(async () => {
    const loaded = await getGroups();
    setGroups(loaded);
  }, []);

  const refreshDomains = useCallback(async () => {
    const loaded = await getDomainsInCurrentWindow();
    setDomains(loaded);
  }, []);

  useEffect(() => {
    getActiveView().then(setActiveView);
    refreshGroups();
    refreshDomains();
    getAutoSortEnabled().then(setIsAutoSort);
    getManualSortOptions().then(setManualSortOptionsState);
    getAutoSortOptions().then(setAutoSortOptionsState);
    checkLatestRelease().then(setUpdateInfo);
  }, [refreshGroups, refreshDomains]);

  const handleViewChange = (view: 'groups' | 'domains' | 'settings') => {
    setActiveView(view);
    setActiveViewStorage(view);
  };

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.tabs) return;

    const handleTabChange = () => {
      refreshDomains();
    };

    chrome.tabs.onMoved?.addListener(handleTabChange);
    chrome.tabs.onCreated?.addListener(handleTabChange);
    chrome.tabs.onRemoved?.addListener(handleTabChange);
    chrome.tabs.onUpdated?.addListener(handleTabChange);

    return () => {
      chrome.tabs.onMoved?.removeListener(handleTabChange);
      chrome.tabs.onCreated?.removeListener(handleTabChange);
      chrome.tabs.onRemoved?.removeListener(handleTabChange);
      chrome.tabs.onUpdated?.removeListener(handleTabChange);
    };
  }, [refreshDomains]);

  const showStatus = (msg: string) => {
    setStatus(msg);
    setTimeout(() => {
      setStatus('');
    }, 2000);
  };

  const handleToggleAutoSort = async () => {
    const next = !isAutoSort;
    setIsAutoSort(next);
    await setAutoSortEnabled(next);
    showStatus(next ? 'Auto Sort ON' : 'Auto Sort OFF');
  };

  const handleManualOptionsChange = async (options: SortOptions) => {
    setManualSortOptionsState(options);
    await setManualSortOptions(options);
    showStatus('Sort Button options saved');
  };

  const handleAutoOptionsChange = async (options: SortOptions) => {
    setAutoSortOptionsState(options);
    await setAutoSortOptions(options);
    showStatus('Auto Sort options saved');
  };

  const handleSortTabs = async () => {
    const count = await sortCurrentWindowTabs(undefined, manualSortOptions);
    await refreshDomains();
    showStatus(`Sorted ${count} tabs`);
  };

  const handleSaveWindow = async () => {
    const newGroup = await saveCurrentWindowAsGroup();
    if (newGroup) {
      await refreshGroups();
      showStatus('Window saved');
    }
  };

  const handleLoadCurrent = async (group: SavedGroup) => {
    await loadGroupInCurrentWindow(group);
    await refreshDomains();
    showStatus('Tabs loaded');
  };

  const handleLoadNew = async (group: SavedGroup) => {
    await loadGroupInNewWindow(group);
    showStatus('Opened in new window');
  };

  const handleOverwrite = async (groupId: string) => {
    const updated = await overwriteGroup(groupId);
    if (updated) {
      await refreshGroups();
      showStatus('Group overwritten');
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    await deleteGroup(groupId);
    await refreshGroups();
    showStatus('Group deleted');
  };

  const handleRenameGroup = async (groupId: string, newName: string) => {
    await updateGroupName(groupId, newName);
    await refreshGroups();
  };

  const handleReorderGroups = async (reordered: SavedGroup[]) => {
    setGroups(reordered);
    await saveGroups(reordered);
  };

  // Domain Actions
  const handleDomainMoveToNewWindow = async (targetDomains: string[]) => {
    await moveDomainTabsToNewWindow(targetDomains);
    await refreshDomains();
    showStatus(`Moved ${targetDomains.length} domains`);
  };

  const handleDomainSaveAsGroup = async (targetDomains: string[]) => {
    const saved = await saveDomainAsGroup(targetDomains);
    if (saved) {
      await refreshGroups();
      showStatus('Domain tabs saved');
    }
  };

  const handleDomainDelete = async (targetDomains: string[]) => {
    await closeDomainTabs(targetDomains);
    await refreshDomains();
    showStatus(`Closed ${targetDomains.length} domains`);
  };

  const getFooterLeftText = () => {
    if (activeView === 'groups') return `${groups.length} saved groups`;
    if (activeView === 'domains') return `${domains.length} active domains`;
    return `Auto Sort: ${isAutoSort ? 'ON' : 'OFF'}`;
  };

  return (
    <div className="app-container">
      <Header
        activeView={activeView}
        onViewChange={handleViewChange}
        isAutoSort={isAutoSort}
        onToggleAutoSort={handleToggleAutoSort}
        onSort={handleSortTabs}
        onSaveWindow={handleSaveWindow}
        isSidePanel={isSidePanel}
      />

      <main className="content-area">
        {activeView === 'groups' && (
          <GroupList
            groups={groups}
            onLoadCurrent={handleLoadCurrent}
            onLoadNew={handleLoadNew}
            onOverwrite={handleOverwrite}
            onDelete={handleDeleteGroup}
            onRename={handleRenameGroup}
            onReorder={handleReorderGroups}
          />
        )}
        {activeView === 'domains' && (
          <DomainList
            domains={domains}
            isAutoSortFSO={isAutoSort && autoSortOptions.groupByDomain && !autoSortOptions.sortByCharRank}
            closeDomainOnMiddleClick={manualSortOptions.closeDomainOnMiddleClick}
            onMoveToNewWindow={handleDomainMoveToNewWindow}
            onSaveAsGroup={handleDomainSaveAsGroup}
            onDelete={handleDomainDelete}
          />
        )}
        {activeView === 'settings' && (
          <SettingsView
            manualSortOptions={manualSortOptions}
            autoSortOptions={autoSortOptions}
            onManualOptionsChange={handleManualOptionsChange}
            onAutoOptionsChange={handleAutoOptionsChange}
          />
        )}
      </main>

      <footer className="footer">
        <span>{getFooterLeftText()}</span>
        <span>
          {updateInfo?.hasUpdate ? (
            <a
              href={updateInfo.releaseUrl}
              target="_blank"
              rel="noreferrer"
              className="footer-update-link"
              title={`New version v${updateInfo.latestVersion} available on GitHub`}
            >
              Update v{updateInfo.latestVersion} ↗
            </a>
          ) : (
            status
          )}
        </span>
      </footer>
    </div>
  );
};
