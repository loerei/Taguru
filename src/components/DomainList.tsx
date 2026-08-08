import React, { useState } from 'react';
import { DomainGroup } from '../utils/domains';
import { DomainItem } from './DomainItem';
import { compareCustomStrings } from '../utils/sorter';

interface DomainListProps {
  domains: DomainGroup[];
  closeDomainOnMiddleClick?: boolean;
  onMoveToNewWindow: (domains: string[]) => void;
  onSaveAsGroup: (domains: string[]) => void;
  onDelete: (domains: string[]) => void;
}

export const DomainList: React.FC<DomainListProps> = ({
  domains,
  closeDomainOnMiddleClick = false,
  onMoveToNewWindow,
  onSaveAsGroup,
  onDelete
}) => {
  const [sortOrder, setSortOrder] = useState<'alpha' | 'count'>('alpha');
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());

  const handleToggleSelect = (domain: string) => {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedDomains.size === domains.length) {
      setSelectedDomains(new Set());
    } else {
      setSelectedDomains(new Set(domains.map((d) => d.domain)));
    }
  };

  const sortedDomains = [...domains].sort((a, b) => {
    if (sortOrder === 'count') {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
    }
    return compareCustomStrings(a.domain, b.domain);
  });

  const selectedList = Array.from(selectedDomains);

  if (domains.length === 0) {
    return (
      <div className="empty-state">
        <svg className="svg-icon" viewBox="0 0 24 24" style={{ width: 32, height: 32, opacity: 0.4 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
        </svg>
        <span>No domains found in current window</span>
      </div>
    );
  }

  return (
    <div className="domain-list-container">
      <div className="domain-toolbar">
        <div className="toolbar-left">
          <span className="meta-tag">{domains.length} domains</span>
          {isBatchMode && (
            <button type="button" className="btn-link" onClick={handleSelectAll}>
              {selectedDomains.size === domains.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        <div className="toolbar-actions">
          <button
            type="button"
            className={`icon-btn ${sortOrder === 'count' ? 'active' : ''}`}
            onClick={() => setSortOrder(sortOrder === 'alpha' ? 'count' : 'alpha')}
            title={sortOrder === 'alpha' ? 'Sort by count' : 'Sort alphabetically'}
          >
            {sortOrder === 'alpha' ? (
              <svg className="svg-icon" viewBox="0 0 24 24">
                <path d="M15 6v12M15 18l4-4M15 6l4 4M4 7h7M4 12h5M4 17h3" />
              </svg>
            ) : (
              <svg className="svg-icon" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h10M4 18h6" />
              </svg>
            )}
          </button>

          <button
            type="button"
            className={`icon-btn ${isBatchMode ? 'active' : ''}`}
            onClick={() => {
              setIsBatchMode(!isBatchMode);
              if (isBatchMode) {
                setSelectedDomains(new Set());
              }
            }}
            title="Toggle batch selection mode"
          >
            <svg className="svg-icon" viewBox="0 0 24 24">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </button>
        </div>
      </div>

      <div className="group-list">
        {sortedDomains.map((item) => (
          <DomainItem
            key={item.domain}
            item={item}
            isBatchMode={isBatchMode}
            isSelected={selectedDomains.has(item.domain)}
            closeDomainOnMiddleClick={closeDomainOnMiddleClick}
            onToggleSelect={handleToggleSelect}
            onMoveToNewWindow={(d) => onMoveToNewWindow([d])}
            onSaveAsGroup={(d) => onSaveAsGroup([d])}
            onDelete={(d) => onDelete([d])}
          />
        ))}
      </div>

      {isBatchMode && selectedDomains.size > 0 && (
        <div className="batch-action-bar">
          <span className="batch-count">{selectedDomains.size} selected</span>
          <div className="batch-buttons">
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => onMoveToNewWindow(selectedList)}
              title="Move selected domains to new window"
            >
              Move
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => onSaveAsGroup(selectedList)}
              title="Save selected domains as a group"
            >
              Save
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => onDelete(selectedList)}
              title="Close selected domains tabs"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
