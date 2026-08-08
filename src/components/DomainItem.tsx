import React, { useState } from 'react';
import { DomainGroup } from '../utils/domains';

interface DomainItemProps {
  item: DomainGroup;
  isBatchMode: boolean;
  isSelected: boolean;
  closeDomainOnMiddleClick?: boolean;
  onToggleSelect: (domain: string) => void;
  onMoveToNewWindow: (domain: string) => void;
  onSaveAsGroup: (domain: string) => void;
  onDelete: (domain: string) => void;
}

export const DomainItem: React.FC<DomainItemProps> = ({
  item,
  isBatchMode,
  isSelected,
  closeDomainOnMiddleClick = false,
  onToggleSelect,
  onMoveToNewWindow,
  onSaveAsGroup,
  onDelete
}) => {
  const [imgError, setImgError] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const firstFavIcon = item.tabs.find((t) => !!t.favIconUrl)?.favIconUrl;

  const triggerDelete = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onDelete(item.domain);
    }, 220);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 && closeDomainOnMiddleClick) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleAuxClick = (e: React.MouseEvent) => {
    if (e.button === 1 && closeDomainOnMiddleClick) {
      e.preventDefault();
      e.stopPropagation();
      triggerDelete();
    }
  };

  return (
    <div
      className={`group-item domain-item ${isSelected ? 'selected' : ''} ${isExiting ? 'is-exiting' : ''}`}
      onMouseDown={handleMouseDown}
      onAuxClick={handleAuxClick}
    >
      <div className="group-left">
        {isBatchMode && (
          <input
            type="checkbox"
            className="domain-checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(item.domain)}
          />
        )}
        <div className="domain-favicon-container">
          {firstFavIcon && !imgError ? (
            <img
              src={firstFavIcon}
              alt=""
              className="domain-favicon"
              onError={() => setImgError(true)}
            />
          ) : (
            <svg className="svg-icon domain-favicon-fallback" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          )}
        </div>
        <div className="group-title-container">
          <span className="group-name">{item.domain}</span>
          <span className="group-meta">{item.count} tabs</span>
        </div>
      </div>

      <div className="group-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => onMoveToNewWindow(item.domain)}
          title="Move domain tabs to new window"
        >
          <svg className="svg-icon" viewBox="0 0 24 24">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={() => onSaveAsGroup(item.domain)}
          title="Save domain tabs as a group"
        >
          <svg className="svg-icon" viewBox="0 0 24 24">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
        </button>

        <button
          type="button"
          className="icon-btn icon-btn-danger"
          onClick={triggerDelete}
          title="Close domain tabs"
        >
          <svg className="svg-icon" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};
