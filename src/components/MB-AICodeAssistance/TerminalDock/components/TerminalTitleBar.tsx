import React from 'react';
import { 
  Terminal, 
  Trash2, 
  Maximize2, 
  Minimize2, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import { TerminalPosition } from '../../../../types';
import { TerminalTab } from '../types';
import PlacementSelector from './PlacementSelector';

interface TerminalTitleBarProps {
  activeTab: TerminalTab;
  onSelectTab: (tab: TerminalTab) => void;
  position: TerminalPosition;
  onChangePosition?: (position: TerminalPosition) => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
  onToggleCollapse: () => void;
  onClear: () => void;
  isPositionMenuOpen: boolean;
  onTogglePositionMenu: () => void;
  onClosePositionMenu: () => void;
  connectedPosition: 'left' | 'right';
  onChangeConnectedPosition: (pos: 'left' | 'right') => void;
}

export const TerminalTitleBar: React.FC<TerminalTitleBarProps> = ({
  activeTab,
  onSelectTab,
  position,
  onChangePosition,
  isMaximized,
  onToggleMaximize,
  onToggleCollapse,
  onClear,
  isPositionMenuOpen,
  onTogglePositionMenu,
  onClosePositionMenu,
  connectedPosition,
  onChangeConnectedPosition,
}) => {
  // Choose appropriate close / collapse chevron icon
  const getCollapseIcon = () => {
    switch (position) {
      case 'top':
        return <ChevronUp className="w-4 h-4" />;
      case 'left':
        return <ChevronLeft className="w-4 h-4" />;
      case 'right':
        return <ChevronRight className="w-4 h-4" />;
      case 'bottom':
      default:
        return <ChevronDown className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-9 px-3 bg-[#161b22] border-b border-zinc-800 flex items-center justify-between text-zinc-400 select-none shrink-0 gap-2">
      {/* Left: Tabs & Status */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab('terminal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-sans transition-colors cursor-pointer ${
              activeTab === 'terminal' 
                ? 'bg-zinc-800 text-zinc-100 font-semibold' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">Terminal</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('output')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-sans transition-colors cursor-pointer ${
              activeTab === 'output' 
                ? 'bg-zinc-800 text-zinc-100 font-semibold' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <span>Output</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('debug')}
            className={`hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-sans transition-colors cursor-pointer ${
              activeTab === 'debug' 
                ? 'bg-zinc-800 text-zinc-100 font-semibold' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <span>Debug</span>
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 text-[11px] text-zinc-500 font-sans border-l border-zinc-800 pl-3 truncate">
          <span className="text-zinc-400 truncate max-w-[220px] xl:max-w-none">/Users/waldo/Documents/AnonymousData</span>
        </div>
      </div>

      {/* Right: Actions, Placement Selector, Maximize & Close */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Placement Position Dropdown Selector */}
        <PlacementSelector
          position={position}
          onChangePosition={onChangePosition}
          isOpen={isPositionMenuOpen}
          onToggleOpen={onTogglePositionMenu}
          onClose={onClosePositionMenu}
          connectedPosition={connectedPosition}
          onChangeConnectedPosition={onChangeConnectedPosition}
        />

        {/* Clear Console */}
        <button
          type="button"
          onClick={onClear}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          title="Clear Terminal Output"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Maximize / Restore */}
        <button
          type="button"
          onClick={onToggleMaximize}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          title={isMaximized ? 'Restore Terminal Size' : 'Expand Terminal Size'}
        >
          {isMaximized ? (
            <Minimize2 className="w-3.5 h-3.5" />
          ) : (
            <Maximize2 className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Minimize / Close Dock */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer ml-0.5"
          title="Collapse Terminal Dock"
        >
          {getCollapseIcon()}
        </button>
      </div>
    </div>
  );
};

export default TerminalTitleBar;
