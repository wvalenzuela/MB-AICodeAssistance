import React from 'react';
import { Terminal } from 'lucide-react';
import { TerminalPosition } from '../../../../types';

interface FloatingTerminalPillProps {
  isOpen: boolean;
  onToggle: () => void;
  position: TerminalPosition;
}

export const FloatingTerminalPill: React.FC<FloatingTerminalPillProps> = ({
  isOpen,
  onToggle,
  position,
}) => {
  return (
    <div className="fixed bottom-3 right-3 z-30 pointer-events-auto">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium rounded-lg border shadow-md backdrop-blur-xs transition-all cursor-pointer ${
          isOpen
            ? 'bg-zinc-900 text-zinc-100 border-zinc-700 ring-2 ring-emerald-500/30'
            : 'bg-zinc-100/90 hover:bg-zinc-200 text-zinc-700 border-zinc-300/90'
        }`}
        title={isOpen ? 'Hide Terminal' : `Open Terminal (${position})`}
      >
        <Terminal className={`w-3.5 h-3.5 ${isOpen ? 'text-emerald-400' : 'text-zinc-600'}`} />
        <span>Terminal</span>
        {isOpen && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
        )}
      </button>
    </div>
  );
};

export default FloatingTerminalPill;
