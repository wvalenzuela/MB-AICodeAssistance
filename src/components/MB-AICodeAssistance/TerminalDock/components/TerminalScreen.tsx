import React from 'react';
import { TerminalTab } from '../types';

interface TerminalScreenProps {
  activeTab: TerminalTab;
  lines: string[];
  inputValue: string;
  onInputChange: (val: string) => void;
  onCommandSubmit: (e: React.FormEvent) => void;
}

export const TerminalScreen: React.FC<TerminalScreenProps> = ({
  activeTab,
  lines,
  inputValue,
  onInputChange,
  onCommandSubmit,
}) => {
  return (
    <div className="flex-1 p-3 overflow-y-auto space-y-1 text-emerald-400 text-[11px] leading-relaxed select-text font-mono">
      {activeTab === 'terminal' && (
        <>
          {lines.map((line, idx) => (
            <div key={idx} className="break-all whitespace-pre-wrap">
              {line}
            </div>
          ))}

          {/* Interactive Command Input Line */}
          <form onSubmit={onCommandSubmit} className="flex items-center gap-2 mt-2 pt-1">
            <span className="text-emerald-300 shrink-0 select-none">
              anonymous@mb-sandbox:~$
            </span>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder="Type command (e.g. ls, pwd, python -V)..."
              className="flex-1 bg-transparent border-none text-emerald-200 focus:outline-hidden font-mono text-[11px] placeholder:text-zinc-600 min-w-0"
              autoFocus
            />
          </form>
        </>
      )}

      {activeTab === 'output' && (
        <div className="text-zinc-400 space-y-1">
          <div>[build-system] No active build tasks running.</div>
          <div>[linter] Workspace index synced. 0 errors, 0 warnings.</div>
        </div>
      )}

      {activeTab === 'debug' && (
        <div className="text-zinc-400 space-y-1">
          <div>[gdb/lldb] Debug session not started. Click 'Run Unit Tests' in Workflow Panel to attach.</div>
        </div>
      )}
    </div>
  );
};

export default TerminalScreen;
