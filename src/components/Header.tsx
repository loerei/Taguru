import React from 'react';

interface HeaderProps {
  activeView: 'groups' | 'domains' | 'settings';
  onViewChange: (view: 'groups' | 'domains' | 'settings') => void;
  isAutoSort: boolean;
  onToggleAutoSort: () => void;
  onSort: () => void;
  onSaveWindow: () => void;
  isSidePanel?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  isAutoSort,
  onToggleAutoSort,
  onSort,
  onSaveWindow,
  isSidePanel = false
}) => {
  const handleOpenSidePanel = () => {
    if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.windows) {
      chrome.windows.getCurrent((win) => {
        if (win?.id !== undefined) {
          chrome.sidePanel.open({ windowId: win.id });
          window.close();
        }
      });
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="brand">
          <svg className="brand-icon" viewBox="0 0 600 600" style={{ width: '26px', height: '26px' }}>
            <g transform="translate(0, 0)">
              <polygon points="30,30 360,30 440,110 570,110 570,390 30,390" fill="#475569" />
              <polygon points="80,120 410,120 480,190 570,190 570,470 80,470" fill="#94A3B8" />
              <polygon points="130,210 460,210 520,270 570,270 570,560 130,560" fill="#FFFFFF" />
            </g>
          </svg>
          <span>Taguru</span>
        </div>

        <div className="view-segmented-control">
          <button
            type="button"
            className={`view-tab ${activeView === 'groups' ? 'active' : ''}`}
            onClick={() => onViewChange('groups')}
          >
            Groups
          </button>
          <button
            type="button"
            className={`view-tab ${activeView === 'domains' ? 'active' : ''}`}
            onClick={() => onViewChange('domains')}
          >
            Domains
          </button>
          <button
            type="button"
            className={`view-tab ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => onViewChange('settings')}
            title="Settings"
          >
            Settings
          </button>
        </div>
      </div>

      <div className="header-actions">
        <button
          type="button"
          className={`btn ${isAutoSort ? 'btn-primary' : ''}`}
          onClick={onToggleAutoSort}
          title="Toggle Auto Sort (automatically sorts tabs on open/update)"
        >
          Auto
        </button>

        <button type="button" className="btn" onClick={onSort} title="Sort current window tabs">
          <svg className="svg-icon" viewBox="0 0 24 24">
            <path d="M3 6h18M6 12h12M9 18h6" />
          </svg>
          Sort
        </button>

        <button type="button" className="btn btn-primary" onClick={onSaveWindow} title="Save current window as group">
          <svg className="svg-icon" viewBox="0 0 24 24">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Save
        </button>

        {!isSidePanel && typeof chrome !== 'undefined' && chrome.sidePanel && (
          <button
            type="button"
            className="btn btn-icon-only"
            onClick={handleOpenSidePanel}
            title="Open Side Panel"
          >
            <svg className="svg-icon" viewBox="0 0 24 24">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <line x1="15" y1="4" x2="15" y2="20" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};
