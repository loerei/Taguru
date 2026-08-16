import React, { useEffect, useRef } from 'react';
import { SavedGroup } from '../types';

interface SaveGroupPopoverProps {
  groups: SavedGroup[];
  onSaveAsNew: () => void;
  onAddToGroup: (groupId: string) => void;
  onClose: () => void;
}

export const SaveGroupPopover: React.FC<SaveGroupPopoverProps> = ({
  groups,
  onSaveAsNew,
  onAddToGroup,
  onClose
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="save-group-popover" ref={popoverRef} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="popover-action-item popover-item-primary"
        onClick={() => {
          onSaveAsNew();
          onClose();
        }}
      >
        <svg className="svg-icon" viewBox="0 0 24 24">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span>Save as New Group</span>
      </button>

      {groups.length > 0 && (
        <>
          <div className="popover-divider" />
          <div className="popover-section-label">Add to existing group:</div>
          <div className="popover-group-list">
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                className="popover-group-item"
                onClick={() => {
                  onAddToGroup(g.id);
                  onClose();
                }}
              >
                <svg className="svg-icon" viewBox="0 0 24 24">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span className="popover-group-name" title={g.name}>
                  {g.name}
                </span>
                <span className="popover-group-meta">{g.tabs.length} tabs</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
