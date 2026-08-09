import React, { useState, useRef, useEffect } from 'react';
import { SavedGroup } from '../types';

interface GroupItemProps {
  group: SavedGroup;
  index: number;
  onLoadCurrent: (group: SavedGroup) => void;
  onLoadNew: (group: SavedGroup) => void;
  onOverwrite: (groupId: string) => void;
  onDelete: (groupId: string) => void;
  onRename: (groupId: string, newName: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragEnter: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
}

export const GroupItem: React.FC<GroupItemProps> = ({
  group,
  index,
  onLoadCurrent,
  onLoadNew,
  onOverwrite,
  onDelete,
  onRename,
  onDragStart,
  onDragEnter,
  onDragEnd
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditName(group.name);
  }, [group.name]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleFinishEditing = () => {
    setIsEditing(false);
    if (editName.trim() && editName.trim() !== group.name) {
      onRename(group.id, editName.trim());
    } else {
      setEditName(group.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFinishEditing();
    } else if (e.key === 'Escape') {
      setEditName(group.name);
      setIsEditing(false);
    }
  };

  const formattedDate = new Date(group.createdAt).toLocaleDateString([], {
    month: 'numeric',
    day: 'numeric'
  });

  return (
    <div
      className="group-item"
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
    >
      <div className="group-left">
        <div className="drag-handle" title="Drag to reorder">
          <svg className="svg-icon" viewBox="0 0 24 24">
            <circle cx="9" cy="6" r="1" />
            <circle cx="15" cy="6" r="1" />
            <circle cx="9" cy="12" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="9" cy="18" r="1" />
            <circle cx="15" cy="18" r="1" />
          </svg>
        </div>

        <div className="group-title-container">
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              className="group-name-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleFinishEditing}
              onKeyDown={handleKeyDown}
            />
          ) : (
            <button
              type="button"
              className="group-name-btn"
              onClick={() => setIsEditing(true)}
              title="Click to rename"
            >
              {group.name}
            </button>
          )}
          <span className="group-meta">
            {group.tabs.length} tabs • {formattedDate}
          </span>
        </div>
      </div>

      <div className="group-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => onLoadCurrent(group)}
          title="Load in current window"
        >
          <svg className="svg-icon" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        <button
          type="button"
          className="icon-btn"
          onClick={() => onLoadNew(group)}
          title="Load in new window"
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
          onClick={() => onOverwrite(group.id)}
          title="Overwrite with current window tabs"
        >
          <svg className="svg-icon" viewBox="0 0 24 24">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        </button>

        <button
          type="button"
          className="icon-btn icon-btn-danger"
          onClick={() => onDelete(group.id)}
          title="Delete group"
        >
          <svg className="svg-icon" viewBox="0 0 24 24">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
};
