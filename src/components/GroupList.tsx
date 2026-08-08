import React, { useRef } from 'react';
import { SavedGroup } from '../types';
import { GroupItem } from './GroupItem';

interface GroupListProps {
  groups: SavedGroup[];
  onLoadCurrent: (group: SavedGroup) => void;
  onLoadNew: (group: SavedGroup) => void;
  onOverwrite: (groupId: string) => void;
  onDelete: (groupId: string) => void;
  onRename: (groupId: string, newName: string) => void;
  onReorder: (reorderedGroups: SavedGroup[]) => void;
}

export const GroupList: React.FC<GroupListProps> = ({
  groups,
  onLoadCurrent,
  onLoadNew,
  onOverwrite,
  onDelete,
  onRename,
  onReorder
}) => {
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (_e: React.DragEvent, index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (_e: React.DragEvent, index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (
      dragItem.current !== null &&
      dragOverItem.current !== null &&
      dragItem.current !== dragOverItem.current
    ) {
      const copy = [...groups];
      const draggedGroup = copy[dragItem.current];
      copy.splice(dragItem.current, 1);
      copy.splice(dragOverItem.current, 0, draggedGroup);
      onReorder(copy);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  if (groups.length === 0) {
    return (
      <div className="empty-state">
        <svg className="svg-icon" viewBox="0 0 24 24" style={{ width: 32, height: 32, opacity: 0.4 }}>
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
        </svg>
        <span>No saved tab groups</span>
      </div>
    );
  }

  return (
    <div className="group-list">
      {groups.map((group, index) => (
        <GroupItem
          key={group.id}
          group={group}
          index={index}
          onLoadCurrent={onLoadCurrent}
          onLoadNew={onLoadNew}
          onOverwrite={onOverwrite}
          onDelete={onDelete}
          onRename={onRename}
          onDragStart={handleDragStart}
          onDragEnter={handleDragEnter}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
};
