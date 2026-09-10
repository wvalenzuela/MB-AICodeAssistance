import React from 'react';
import { Terminal, ChevronRight, X, Play, RefreshCw } from 'lucide-react';

interface TerminalDockProps {
  isOpen: boolean;
  onToggle: () => void;
  outputLines?: string[];
}

const DEFAULT_TERMINAL_OUTPUT = [
  'MB-Container: ready on workspace /Users/waldo/Documents/AnonymousData',
  'Unit: UNIT-MD-08 | Project: PRJ-NEUROSCAN-2026',
  'Python 3.10.12 (main, Nov 20 2025, 15:14:05) [GCC 11.4.0] on linux',
  'Type "help", "copyright", "credits" or "license" for more information.',
  '>>> import torch; print("PyTorch CUDA available:", torch.cuda.is_available())',
  'PyTorch CUDA available: True (A100-SXM4-80GB)',
  '>>> [ai-agent] connected to session follow stream (seq: 42)',
  '>>> [ai-agent] status: idle waiting for input',
];

export const TerminalDock: React.FC<TerminalDockProps> = ({
  isOpen,
  onToggle,
  outputLines = DEFAULT_TERMINAL_OUTPUT,
}) => {
  return (
    <>
      {/* Docked Terminal Panel on the right */}
      {isOpen && (
        <div className="w-80 md:w-96 h-full bg-[#0d1117] border-l border-zinc-800 text-zinc-300 font-mono text-xs flex flex-col shrink-0 z-20 select-text animate-in slide-in-from-right duration-150">
          {/* Terminal Title Bar */}
          <div className="h-9 px-3 bg-[#161b22] border-b border-zinc-800 flex items-center justify-between text-zinc-400 select-none">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] font-semibold text-zinc-200">Terminal (Workspace)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggle}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors"
                title="Minimize Terminal"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Terminal Content Screen */}
          <div className="flex-1 p-3 overflow-y-auto space-y-1 text-emerald-400 text-[11px] leading-relaxed">
            {outputLines.map((line, idx) => (
              <div key={idx} className="break-all whitespace-pre-wrap">
                {line}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-emerald-300 mt-2">
              <span>anonymous@mb-sandbox:~$</span>
              <span className="w-2 h-3.5 bg-emerald-400 inline-block animate-pulse" />
            </div>
          </div>

          {/* Terminal Quick Prompt Bar */}
          <div className="p-2 bg-[#161b22] border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
            <span>bash 5.2.15 • utf-8</span>
            <span className="text-emerald-500 font-medium">● Connected</span>
          </div>
        </div>
      )}

      {/* Floating "Terminal" Pill Button in bottom-right corner (matches screenshot) */}
      <div className="fixed bottom-2.5 right-2.5 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100/90 hover:bg-zinc-200 text-zinc-700 text-xs font-sans font-medium rounded-lg border border-zinc-300/90 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
          title="Toggle Terminal"
        >
          <Terminal className="w-3.5 h-3.5 text-zinc-600" />
          <span>Terminal</span>
        </button>
      </div>
    </>
  );
};

export default TerminalDock;
