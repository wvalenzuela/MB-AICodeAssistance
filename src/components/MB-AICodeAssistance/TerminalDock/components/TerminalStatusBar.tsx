import React from 'react';

interface TerminalStatusBarProps {
  connectedPosition: 'left' | 'right';
  onToggleConnectedPosition: () => void;
  onQuickCommand: (cmd: string) => void;
}

export const TerminalStatusBar: React.FC<TerminalStatusBarProps> = ({
  connectedPosition,
  onToggleConnectedPosition,
  onQuickCommand,
}) => {
  const connectedBadge = (
    <button
      type="button"
      onClick={onToggleConnectedPosition}
      className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-400 font-sans text-[11px] font-medium transition-colors cursor-pointer shrink-0"
      title={`Container Status: Connected (Click to move to Bottom ${connectedPosition === 'right' ? 'Left' : 'Right'})`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
      <span>Connected</span>
    </button>
  );

  return (
    <div className="h-8 px-3 bg-[#161b22] border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 select-none shrink-0 font-sans gap-2">
      {/* Left side */}
      <div className="flex items-center gap-2.5 truncate min-w-0">
        {connectedPosition === 'left' && (
          <>
            {connectedBadge}
            <span className="text-zinc-700 hidden xs:inline">|</span>
          </>
        )}

        <span className="font-mono text-zinc-400 shrink-0">bash 5.2.15 • utf-8</span>
        <span className="text-zinc-700 hidden sm:inline">|</span>
        <span className="text-zinc-400 hidden sm:inline truncate">Node v20.18 • Python 3.10</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onQuickCommand('>>> nvidia-smi: A100-SXM4-80GB (99% idle, 42C)')}
            className="hover:text-zinc-200 text-zinc-400 cursor-pointer text-[10px] px-1.5 py-0.5 bg-zinc-800/80 hover:bg-zinc-800 rounded font-mono transition-colors"
          >
            nvidia-smi
          </button>
          <button
            type="button"
            onClick={() => onQuickCommand('>>> pip list | grep torch: torch==2.1.2+cu121')}
            className="hover:text-zinc-200 text-zinc-400 cursor-pointer text-[10px] px-1.5 py-0.5 bg-zinc-800/80 hover:bg-zinc-800 rounded font-mono transition-colors"
          >
            torch
          </button>
        </div>

        {connectedPosition === 'right' && (
          <>
            <span className="text-zinc-700 hidden xs:inline">|</span>
            {connectedBadge}
          </>
        )}
      </div>
    </div>
  );
};

export default TerminalStatusBar;
