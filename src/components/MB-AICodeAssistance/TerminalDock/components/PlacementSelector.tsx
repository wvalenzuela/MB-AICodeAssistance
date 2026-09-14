import React, { useRef, useEffect } from 'react';
import { 
  PanelBottom, 
  PanelTop, 
  PanelLeft, 
  PanelRight, 
  ChevronDown, 
  Check 
} from 'lucide-react';
import { TerminalPosition } from '../../../../types';
import { PositionOption } from '../types';

export const POSITION_OPTIONS: PositionOption[] = [
  { id: 'bottom', label: 'Bottom (Down)', subLabel: 'Default', icon: PanelBottom },
  { id: 'top', label: 'Top (Up)', subLabel: 'Above Chat', icon: PanelTop },
  { id: 'left', label: 'Left', subLabel: 'Beside Chat', icon: PanelLeft },
  { id: 'right', label: 'Right', subLabel: 'Beside Chat', icon: PanelRight },
];

interface PlacementSelectorProps {
  position: TerminalPosition;
  onChangePosition?: (position: TerminalPosition) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  onClose: () => void;
  connectedPosition: 'left' | 'right';
  onChangeConnectedPosition: (pos: 'left' | 'right') => void;
}

export const PlacementSelector: React.FC<PlacementSelectorProps> = ({
  position,
  onChangePosition,
  isOpen,
  onToggleOpen,
  onClose,
  connectedPosition,
  onChangeConnectedPosition,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const CurrentPositionIcon = 
    position === 'bottom' ? PanelBottom :
    position === 'top' ? PanelTop :
    position === 'left' ? PanelLeft : PanelRight;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={onToggleOpen}
        className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/70 rounded text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer text-[11px] font-sans"
        title={`Terminal Placement: ${position.toUpperCase()} (Click to place Left, Right, Up/Top, or Down/Bottom)`}
        aria-label="Select Terminal Placement"
      >
        <CurrentPositionIcon className="w-3.5 h-3.5 text-emerald-400" />
        <span className="capitalize text-[11px] font-medium hidden sm:inline">{position}</span>
        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 bg-[#161b22] border border-zinc-700 rounded-xl shadow-2xl py-1.5 z-50 text-xs font-sans text-zinc-300 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80 mb-1">
            Place Terminal Relative to Chat
          </div>

          {POSITION_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = position === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChangePosition?.(opt.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-left transition-colors cursor-pointer hover:bg-zinc-800 ${
                  isSelected 
                    ? 'text-emerald-400 font-medium bg-zinc-800/60' 
                    : 'text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`} />
                  <div>
                    <div className="font-medium leading-snug">{opt.label}</div>
                    <div className="text-[10px] text-zinc-500">{opt.subLabel}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}

          {/* Status Bar "Connected" Position Selector */}
          <div className="px-3 pt-2 pb-1 border-t border-zinc-800/80 mt-1">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold mb-1.5">
              Connected Status Position
            </div>
            <div className="flex items-center gap-1 bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => onChangeConnectedPosition('left')}
                className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors cursor-pointer text-center ${
                  connectedPosition === 'left'
                    ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Bottom Left
              </button>
              <button
                type="button"
                onClick={() => onChangeConnectedPosition('right')}
                className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors cursor-pointer text-center ${
                  connectedPosition === 'right'
                    ? 'bg-zinc-800 text-emerald-400 font-semibold shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Bottom Right
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlacementSelector;
