import React from 'react';
import { ActiveView } from './Navbar';
import { NavSubItem } from '../../config/navigation';

interface SubNavTabsProps {
  items: NavSubItem[];
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
}

export const SubNavTabs: React.FC<SubNavTabsProps> = ({ items, activeView, onNavigate }) => {
  if (items.length <= 1) return null;

  return (
    <div className="sub-nav-tabs">
      <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin px-1">
        {items.map(item => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`sub-nav-tab ${isActive ? 'sub-nav-tab-active' : ''}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
