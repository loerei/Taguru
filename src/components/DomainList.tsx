import React, { useState } from 'react';
import { DomainGroup, reorderDomainBlock } from '../utils/domains';
import { DomainItem } from './DomainItem';
import { compareCustomStrings } from '../utils/sorter';

interface DomainListProps {
  domains: DomainGroup[];
  isAutoSortFSO?: boolean;
  closeDomainOnMiddleClick?: boolean;
  onMoveToNewWindow: (domains: string[]) => void;
  onSaveAsGroup: (domains: string[]) => void;
  onDelete: (domains: string[]) => void;
}

export const DomainList: React.FC<DomainListProps> = ({
  domains,
  isAutoSortFSO = false,
  closeDomainOnMiddleClick = false,
  onMoveToNewWindow,
  onSaveAsGroup,
  onDelete
}) => {
  const [sortOrder, setSortOrder] = useState<'alpha' | 'count'>('alpha');
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
  const [draggedDomain, setDraggedDomain] = useState<string | null>(null);
  const [dragOverTarget, setDragOverTarget] = useState<{ domain: string; position: 'before' | 'after' } | null>(null);

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

  const handleDragStart = (e: React.DragEvent, domain: string) => {
    setDraggedDomain(domain);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', domain);
  };

  const handleDragOver = (e: React.DragEvent, targetDomain: string) => {
    e.preventDefault();
    if (!draggedDomain || draggedDomain === targetDomain) return;
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const position: 'before' | 'after' = offsetY < rect.height / 2 ? 'before' : 'after';

    if (dragOverTarget?.domain !== targetDomain || dragOverTarget?.position !== position) {
      setDragOverTarget({ domain: targetDomain, position });
    }
  };

  const handleDragLeave = () => {
    // Left drag area
  };

  const handleDrop = async (e: React.DragEvent, targetDomain: string) => {
    e.preventDefault();
    const dragged = draggedDomain || e.dataTransfer.getData('text/plain');
    if (!dragged || dragged === targetDomain || !dragOverTarget) {
      setDraggedDomain(null);
      setDragOverTarget(null);
      return;
    }

    const draggedGroup = domains.find((d) => d.domain === dragged);
    const targetGroup = domains.find((d) => d.domain === targetDomain);

    if (draggedGroup && targetGroup) {
      await reorderDomainBlock(draggedGroup, targetGroup, dragOverTarget.position);
    }

    setDraggedDomain(null);
    setDragOverTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedDomain(null);
    setDragOverTarget(null);
  };

  const sortedDomains = [...domains].sort((a, b) => {
    if (sortOrder === 'count') {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
    }
    if (isAutoSortFSO && sortOrder === 'alpha') {
      return 0;
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
        {selectedDomains.size === 0 ? (
          <>
            <div className="toolbar-left">
              <span className="meta-tag">{domains.length} domains</span>
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
            </div>
          </>
        ) : (
          <>
            <div className="toolbar-left">
              <span className="meta-tag font-semibold">{selectedDomains.size} selected</span>
              <button type="button" className="btn-link" onClick={handleSelectAll}>
                {selectedDomains.size === domains.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="toolbar-actions">
              <button
                type="button"
                className="btn btn-xs"
                onClick={() => {
                  onMoveToNewWindow(selectedList);
                  setSelectedDomains(new Set());
                }}
                title="Move selected domains to new window"
              >
                Move
              </button>
              <button
                type="button"
                className="btn btn-xs btn-primary"
                onClick={() => {
                  onSaveAsGroup(selectedList);
                  setSelectedDomains(new Set());
                }}
                title="Save selected domains as a group"
              >
                Save
              </button>
              <button
                type="button"
                className="btn btn-xs btn-danger"
                onClick={() => {
                  onDelete(selectedList);
                  setSelectedDomains(new Set());
                }}
                title="Close selected domains tabs"
              >
                Delete
              </button>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSelectedDomains(new Set())}
                title="Clear selection"
              >
                <svg className="svg-icon" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      <div className="group-list">
        {sortedDomains.map((item) => (
          <DomainItem
            key={item.domain}
            item={item}
            isSelected={selectedDomains.has(item.domain)}
            isAutoSortFSO={isAutoSortFSO}
            closeDomainOnMiddleClick={closeDomainOnMiddleClick}
            onToggleSelect={handleToggleSelect}
            onMoveToNewWindow={(d) => onMoveToNewWindow([d])}
            onSaveAsGroup={(d) => onSaveAsGroup([d])}
            onDelete={(d) => onDelete([d])}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            dragOverPosition={dragOverTarget?.domain === item.domain ? dragOverTarget.position : null}
            isDraggingThis={draggedDomain === item.domain}
          />
        ))}
      </div>
    </div>
  );
};
