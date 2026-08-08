import React, { useState } from 'react';
import { SortOptions } from '../types';
import { clearDebugLogs, exportDebugLogsAsFile, copyDebugLogsToClipboard } from '../utils/logger';

interface SortOptionsCardProps {
  idPrefix: string;
  title: string;
  description: string;
  options: SortOptions;
  onChange: (options: SortOptions) => void;
  isAutoSortCard?: boolean;
}

const SortOptionsCard: React.FC<SortOptionsCardProps> = ({
  idPrefix,
  title,
  description,
  options,
  onChange,
  isAutoSortCard = false
}) => {
  const handleToggle = (key: keyof SortOptions) => {
    onChange({
      ...options,
      [key]: !options[key]
    });
  };

  const handleStrategyChange = (useCharRank: boolean) => {
    onChange({
      ...options,
      sortByCharRank: useCharRank
    });
  };

  const handleDragModeChange = (mode: 'reFso' | 'mbd' | 'off') => {
    onChange({
      ...options,
      autoReFso: mode !== 'off',
      dragMode: mode
    });
  };

  const isSubOptionsDisabled = !options.groupByDomain;

  return (
    <div className="settings-card">
      <div className="settings-header">
        <h3 className="settings-title">{title}</h3>
        <p className="settings-desc">{description}</p>
      </div>

      {/* Level A: Domain-To-Domain */}
      <div className="settings-level-group">
        <h4 className="level-group-title">A. Domain-To-Domain</h4>
        <div className={`toggle-row ${!options.groupByDomain ? 'is-unselected' : ''}`}>
          <label className="toggle-label" htmlFor={`${idPrefix}-groupByDomain`}>
            <input
              id={`${idPrefix}-groupByDomain`}
              type="checkbox"
              checked={options.groupByDomain}
              onChange={() => handleToggle('groupByDomain')}
            />
            <span className="toggle-text">Group by Domain</span>
          </label>
          <span className="toggle-subtext">Group tabs from the same website together</span>
        </div>

        <div className={`toggle-row ${!options.closeDomainOnMiddleClick ? 'is-unselected' : ''} ${isSubOptionsDisabled ? 'is-unavailable' : ''}`}>
          <label className="toggle-label" htmlFor={`${idPrefix}-closeDomainOnMiddleClick`}>
            <input
              id={`${idPrefix}-closeDomainOnMiddleClick`}
              type="checkbox"
              checked={!!options.closeDomainOnMiddleClick && !isSubOptionsDisabled}
              disabled={isSubOptionsDisabled}
              onChange={() => handleToggle('closeDomainOnMiddleClick')}
            />
            <span className="toggle-text">Middle-Click Domain Close</span>
          </label>
          <span className="toggle-subtext">Middle-click any domain card in Taguru to close all its tabs</span>
        </div>

        {/* Domain Order Strategy Radio Group */}
        <div className={`radio-group-container ${isSubOptionsDisabled ? 'is-unavailable' : ''}`}>
          <span className="radio-group-title">Domain Order</span>
          <div className="radio-options">
            <div className={`radio-option ${options.sortByCharRank ? 'is-unselected' : ''} ${isSubOptionsDisabled ? 'is-unavailable' : ''}`}>
              <label className="radio-label" htmlFor={`${idPrefix}-strategy-fso`}>
                <input
                  id={`${idPrefix}-strategy-fso`}
                  type="radio"
                  name={`${idPrefix}-domainStrategy`}
                  checked={!options.sortByCharRank}
                  disabled={isSubOptionsDisabled}
                  onChange={() => handleStrategyChange(false)}
                />
                <span className="radio-text">First-Seen Order (Default)</span>
              </label>
              <span className="radio-subtext">Keep domains in the order they first appeared</span>

              {/* Sub-option: WHEN YOU DRAG A TAB (Only in Auto Sort card & when FSO is selected) */}
              {isAutoSortCard && !options.sortByCharRank && (
                <div className={`sub-radio-group ${isSubOptionsDisabled ? 'is-unavailable' : ''}`}>
                  <span className="sub-radio-title">WHEN YOU DRAG A TAB</span>
                  <div className="sub-radio-options">
                    <label className="sub-radio-label" htmlFor={`${idPrefix}-dragMode-reFso`}>
                      <input
                        id={`${idPrefix}-dragMode-reFso`}
                        type="radio"
                        name={`${idPrefix}-dragMode`}
                        checked={(options.dragMode ?? 'reFso') === 'reFso'}
                        disabled={isSubOptionsDisabled}
                        onChange={() => handleDragModeChange('reFso')}
                      />
                      <span className="sub-radio-text">Re-Group Domain (Default)</span>
                    </label>
                    <span className="sub-radio-subtext">Pull misplaced tab back to its domain</span>

                    <label className="sub-radio-label" htmlFor={`${idPrefix}-dragMode-mbd`}>
                      <input
                        id={`${idPrefix}-dragMode-mbd`}
                        type="radio"
                        name={`${idPrefix}-dragMode`}
                        checked={options.dragMode === 'mbd'}
                        disabled={isSubOptionsDisabled}
                        onChange={() => handleDragModeChange('mbd')}
                      />
                      <span className="sub-radio-text">Move Entire Domain (MBD)</span>
                    </label>
                    <span className="sub-radio-subtext">Move all tabs from that domain to the new position</span>

                    <label className="sub-radio-label" htmlFor={`${idPrefix}-dragMode-off`}>
                      <input
                        id={`${idPrefix}-dragMode-off`}
                        type="radio"
                        name={`${idPrefix}-dragMode`}
                        checked={options.dragMode === 'off'}
                        disabled={isSubOptionsDisabled}
                        onChange={() => handleDragModeChange('off')}
                      />
                      <span className="sub-radio-text">Disabled</span>
                    </label>
                    <span className="sub-radio-subtext">Don't auto-sort when dragging tabs</span>
                  </div>
                </div>
              )}
            </div>

            <div className={`radio-option ${!options.sortByCharRank ? 'is-unselected' : ''} ${isSubOptionsDisabled ? 'is-unavailable' : ''}`}>
              <label className="radio-label" htmlFor={`${idPrefix}-strategy-char`}>
                <input
                  id={`${idPrefix}-strategy-char`}
                  type="radio"
                  name={`${idPrefix}-domainStrategy`}
                  checked={options.sortByCharRank}
                  disabled={isSubOptionsDisabled}
                  onChange={() => handleStrategyChange(true)}
                />
                <span className="radio-text">Alphabetical & Character Rank</span>
              </label>
              <span className="radio-subtext">Sort by Digits → Latin → Kana → Kanji</span>
            </div>
          </div>
        </div>
      </div>

      {/* Level B: In-Domain */}
      <div className="settings-level-group">
        <h4 className="level-group-title">B. In-Domain</h4>
        <div className={`toggle-row ${!options.sortByPathSegments ? 'is-unselected' : ''} ${isSubOptionsDisabled ? 'is-unavailable' : ''}`}>
          <label className="toggle-label" htmlFor={`${idPrefix}-sortByPathSegments`}>
            <input
              id={`${idPrefix}-sortByPathSegments`}
              type="checkbox"
              checked={options.sortByPathSegments && !isSubOptionsDisabled}
              disabled={isSubOptionsDisabled}
              onChange={() => handleToggle('sortByPathSegments')}
            />
            <span className="toggle-text">Path Segments</span>
          </label>
          <span className="toggle-subtext">Sort tabs inside a domain by URL path</span>
        </div>

        <div className={`toggle-row ${!options.sortByQueryAndHash ? 'is-unselected' : ''} ${isSubOptionsDisabled ? 'is-unavailable' : ''}`}>
          <label className="toggle-label" htmlFor={`${idPrefix}-sortByQueryAndHash`}>
            <input
              id={`${idPrefix}-sortByQueryAndHash`}
              type="checkbox"
              checked={options.sortByQueryAndHash && !isSubOptionsDisabled}
              disabled={isSubOptionsDisabled}
              onChange={() => handleToggle('sortByQueryAndHash')}
            />
            <span className="toggle-text">Query & Hash</span>
          </label>
          <span className="toggle-subtext">Sort by URL parameters (?key=val, #anchor)</span>
        </div>
      </div>
    </div>
  );
};

interface SettingsViewProps {
  manualSortOptions: SortOptions;
  autoSortOptions: SortOptions;
  onManualOptionsChange: (options: SortOptions) => void;
  onAutoOptionsChange: (options: SortOptions) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  manualSortOptions,
  autoSortOptions,
  onManualOptionsChange,
  onAutoOptionsChange
}) => {
  const isReleaseMode = typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'release';
  const [logStatus, setLogStatus] = useState<string | null>(null);

  const handleToggleDebugLogging = () => {
    onAutoOptionsChange({
      ...autoSortOptions,
      debugLogging: !autoSortOptions.debugLogging
    });
  };

  const handleClearLogs = async () => {
    await clearDebugLogs();
    setLogStatus('Logs cleared');
    setTimeout(() => setLogStatus(null), 3000);
  };

  const handleExportLogs = async () => {
    await exportDebugLogsAsFile();
    setLogStatus('Logs exported');
    setTimeout(() => setLogStatus(null), 3000);
  };

  const handleCopyLogs = async () => {
    const success = await copyDebugLogsToClipboard();
    setLogStatus(success ? 'Logs copied to clipboard' : 'Failed to copy logs');
    setTimeout(() => setLogStatus(null), 3000);
  };

  return (
    <div className="settings-container">
      <SortOptionsCard
        idPrefix="manual-sort"
        title="Sort Button Settings"
        description="Rules applied when clicking the Sort button"
        options={manualSortOptions}
        onChange={onManualOptionsChange}
        isAutoSortCard={false}
      />

      <SortOptionsCard
        idPrefix="auto-sort"
        title="Auto Sort Settings"
        description="Rules applied automatically as tabs open or move"
        options={autoSortOptions}
        onChange={onAutoOptionsChange}
        isAutoSortCard={true}
      />

      {/* Developer Options Section (Hidden only in release build mode) */}
      {!isReleaseMode && (
        <div className="settings-card dev-options-card">
          <div className="settings-header">
            <h3 className="settings-title">Developer Options</h3>
            <p className="settings-desc">Diagnostic logging and dev tools</p>
          </div>
          <div className="settings-level-group">
            <div className={`toggle-row ${!autoSortOptions.debugLogging ? 'is-unselected' : ''}`}>
              <label className="toggle-label" htmlFor="dev-debugLogging">
                <input
                  id="dev-debugLogging"
                  type="checkbox"
                  checked={!!autoSortOptions.debugLogging}
                  onChange={handleToggleDebugLogging}
                />
                <span className="toggle-text">Enable Debug Logs</span>
              </label>
              <span className="toggle-subtext">Print verbose sorting and drag event logs to Developer Tools console</span>

              {autoSortOptions.debugLogging && (
                <div className="log-actions-container" style={{ marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-sm" onClick={handleExportLogs}>
                    Export Logs (.txt)
                  </button>
                  <button type="button" className="btn btn-sm" onClick={handleCopyLogs}>
                    Copy Logs
                  </button>
                  <button type="button" className="btn btn-sm btn-danger" onClick={handleClearLogs}>
                    Clear Logs
                  </button>
                  {logStatus && (
                    <span className="toggle-subtext" style={{ color: 'var(--accent-color)', marginLeft: '4px' }}>
                      {logStatus}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
