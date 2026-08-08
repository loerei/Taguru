import React from 'react';
import { SortOptions } from '../types';

interface SortOptionsCardProps {
  idPrefix: string;
  title: string;
  description: string;
  options: SortOptions;
  onChange: (updated: SortOptions) => void;
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
  const isReleaseMode = typeof import.meta !== 'undefined' && import.meta.env?.MODE === 'release';
  const currentDragMode = options.dragMode ?? (options.autoReFso === false ? 'off' : 'reFso');

  return (
    <div className="settings-card">
      <div className="settings-card-header">
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

              {/* Sub-selector ONLY for Auto Sort Settings under FSO */}
              {isAutoSortCard && !options.sortByCharRank && (
                <div className={`radio-group-container ${isSubOptionsDisabled ? 'is-unavailable' : ''}`} style={{ marginTop: '8px', marginLeft: '14px' }}>
                  <span className="radio-group-title">When You Drag a Tab</span>
                  <div className="radio-options">
                    <div className={`radio-option ${currentDragMode !== 'reFso' ? 'is-unselected' : ''} ${isSubOptionsDisabled ? 'is-unavailable' : ''}`}>
                      <label className="radio-label" htmlFor={`${idPrefix}-drag-refso`}>
                        <input
                          id={`${idPrefix}-drag-refso`}
                          type="radio"
                          name={`${idPrefix}-dragAction`}
                          checked={currentDragMode === 'reFso'}
                          disabled={isSubOptionsDisabled}
                          onChange={() => handleDragModeChange('reFso')}
                        />
                        <span className="radio-text">Re-Group Domain (Default)</span>
                      </label>
                      <span className="radio-subtext">Pull misplaced tab back to its domain</span>
                    </div>

                    <div className={`radio-option ${currentDragMode !== 'mbd' ? 'is-unselected' : ''} ${isSubOptionsDisabled ? 'is-unavailable' : ''}`}>
                      <label className="radio-label" htmlFor={`${idPrefix}-drag-mbd`}>
                        <input
                          id={`${idPrefix}-drag-mbd`}
                          type="radio"
                          name={`${idPrefix}-dragAction`}
                          checked={currentDragMode === 'mbd'}
                          disabled={isSubOptionsDisabled}
                          onChange={() => handleDragModeChange('mbd')}
                        />
                        <span className="radio-text">Move Entire Domain (MBD)</span>
                      </label>
                      <span className="radio-subtext">Move all tabs from that domain to the new position</span>
                    </div>

                    <div className={`radio-option ${currentDragMode !== 'off' ? 'is-unselected' : ''} ${isSubOptionsDisabled ? 'is-unavailable' : ''}`}>
                      <label className="radio-label" htmlFor={`${idPrefix}-drag-off`}>
                        <input
                          id={`${idPrefix}-drag-off`}
                          type="radio"
                          name={`${idPrefix}-dragAction`}
                          checked={currentDragMode === 'off'}
                          disabled={isSubOptionsDisabled}
                          onChange={() => handleDragModeChange('off')}
                        />
                        <span className="radio-text">Disabled</span>
                      </label>
                      <span className="radio-subtext">Don't auto-sort when dragging tabs</span>
                    </div>
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
      <div className={`settings-level-group ${isSubOptionsDisabled ? 'is-unavailable level-disabled' : ''}`}>
        <h4 className="level-group-title">
          B. In-Domain {isSubOptionsDisabled && <span className="disabled-badge">(Requires Grouping by Domain enabled)</span>}
        </h4>
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

      {/* Dev Options */}
      {!isReleaseMode && (
        <div className="settings-level-group" style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
          <h4 className="level-group-title">Developer Options</h4>
          <div className={`toggle-row ${!options.debugLogging ? 'is-unselected' : ''}`}>
            <label className="toggle-label" htmlFor={`${idPrefix}-debugLogging`}>
              <input
                id={`${idPrefix}-debugLogging`}
                type="checkbox"
                checked={!!options.debugLogging}
                onChange={() => handleToggle('debugLogging')}
              />
              <span className="toggle-text">Enable Debug Logs</span>
            </label>
            <span className="toggle-subtext">Print verbose sorting and drag event logs to Developer Tools console</span>
          </div>
        </div>
      )}
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
    </div>
  );
};
