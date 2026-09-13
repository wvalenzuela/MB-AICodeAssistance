import React, { useState } from 'react';
import { 
  Terminal, 
  ChevronDown, 
  X, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Play,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

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
  outputLines: initialOutputLines = DEFAULT_TERMINAL_OUTPUT,
}) => {
  const [lines, setLines] = useState<string[]>(initialOutputLines);
  const [inputValue, setInputValue] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'output' | 'debug'>('terminal');

  const handleClear = () => {
    setLines(['Console cleared. Ready for commands.']);
  };

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const cmd = inputValue.trim();
    const newLines = [...lines, `anonymous@mb-sandbox:~$ ${cmd}`];

    if (cmd === 'clear') {
      setLines([]);
    } else if (cmd === 'pwd') {
      newLines.push('/Users/waldo/Documents/AnonymousData');
      setLines(newLines);
    } else if (cmd === 'ls' || cmd === 'ls -la') {
      newLines.push('total 48');
      newLines.push('-rw-r--r-- 1 waldo staff  3412 Sep 10 11:42 search_tree.py');
      newLines.push('-rw-r--r-- 1 waldo staff  1890 Sep 10 10:15 data_preprocessing_pipeline.py');
      newLines.push('-rw-r--r-- 1 waldo staff   450 Sep 10 09:30 requirements.txt');
      setLines(newLines);
    } else if (cmd === 'python -V' || cmd === 'python --version') {
      newLines.push('Python 3.10.12 (GCC 11.4.0, 64-bit)');
      setLines(newLines);
    } else if (cmd === 'nvidia-smi') {
      newLines.push('+-----------------------------------------------------------------------------+');
      newLines.push('| NVIDIA-SMI 535.104.05   Driver Version: 535.104.05   CUDA Version: 12.2     |');
      newLines.push('| GPU  Name: NVIDIA A100-SXM4-80GB   Persistence-M: On   Memory: 12400MiB/81920MiB |');
      newLines.push('+-----------------------------------------------------------------------------+');
      setLines(newLines);
    } else {
      newLines.push(`[executed]: ${cmd} (exit code 0)`);
      setLines(newLines);
    }

    setInputValue('');
  };

  return (
    <>
      {/* Bottom Docked Terminal Panel */}
      {isOpen && (
        <div 
          className={`w-full bg-[#0d1117] border-t border-zinc-800 text-zinc-300 font-mono text-xs flex flex-col shrink-0 z-30 select-text transition-all duration-200 ${
            isMaximized ? 'h-96' : 'h-64 sm:h-72'
          }`}
        >
          {/* Terminal Title Bar */}
          <div className="h-9 px-3 bg-[#161b22] border-b border-zinc-800 flex items-center justify-between text-zinc-400 select-none shrink-0">
            {/* Left: Tabs & Status */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('terminal')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-sans transition-colors cursor-pointer ${
                    activeTab === 'terminal' 
                      ? 'bg-zinc-800 text-zinc-100 font-semibold' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Terminal (Workspace)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('output')}
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
                  onClick={() => setActiveTab('debug')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-sans transition-colors cursor-pointer ${
                    activeTab === 'debug' 
                      ? 'bg-zinc-800 text-zinc-100 font-semibold' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <span>Debug Console</span>
                </button>
              </div>

              <div className="hidden md:flex items-center gap-2 text-[11px] text-zinc-500 font-sans border-l border-zinc-800 pl-3">
                <span className="text-zinc-400">/Users/waldo/Documents/AnonymousData</span>
                <span className="text-zinc-600">•</span>
                <span className="text-emerald-500 flex items-center gap-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Connected (bash 5.2)
                </span>
              </div>
            </div>

            {/* Right: Quick actions & Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                title="Clear Terminal Output"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                title={isMaximized ? 'Restore Terminal' : 'Maximize Terminal'}
              >
                {isMaximized ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={onToggle}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer ml-1"
                title="Close Terminal Dock"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Terminal Content Screen */}
          <div className="flex-1 p-3 overflow-y-auto space-y-1 text-emerald-400 text-[11px] leading-relaxed select-text font-mono">
            {activeTab === 'terminal' && (
              <>
                {lines.map((line, idx) => (
                  <div key={idx} className="break-all whitespace-pre-wrap">
                    {line}
                  </div>
                ))}

                {/* Interactive Command Input Line */}
                <form onSubmit={handleCommandSubmit} className="flex items-center gap-2 mt-2 pt-1">
                  <span className="text-emerald-300 shrink-0 select-none">
                    anonymous@mb-sandbox:~$
                  </span>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type bash command (e.g. ls, pwd, python -V)..."
                    className="flex-1 bg-transparent border-none text-emerald-200 focus:outline-hidden font-mono text-[11px] placeholder:text-zinc-600"
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

          {/* Terminal Quick Prompt Bar */}
          <div className="px-3 py-1.5 bg-[#161b22] border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 select-none shrink-0 font-sans">
            <div className="flex items-center gap-2">
              <span className="font-mono text-zinc-400">bash 5.2.15 • utf-8</span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">Node v20.18 • Python 3.10</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLines((prev) => [...prev, '>>> nvidia-smi: A100-SXM4-80GB (99% idle, 42C)'])}
                className="hover:text-zinc-300 cursor-pointer text-[10px] px-1.5 py-0.5 bg-zinc-800/80 rounded"
              >
                nvidia-smi
              </button>
              <button
                type="button"
                onClick={() => setLines((prev) => [...prev, '>>> pip list | grep torch: torch==2.1.2+cu121'])}
                className="hover:text-zinc-300 cursor-pointer text-[10px] px-1.5 py-0.5 bg-zinc-800/80 rounded"
              >
                torch status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating "Terminal" Pill Button in bottom-right corner (matches screenshot) */}
      <div className="fixed bottom-3 right-3 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={onToggle}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-sans font-medium rounded-lg border shadow-md backdrop-blur-xs transition-all cursor-pointer ${
            isOpen
              ? 'bg-zinc-900 text-zinc-100 border-zinc-700 ring-2 ring-emerald-500/30'
              : 'bg-zinc-100/90 hover:bg-zinc-200 text-zinc-700 border-zinc-300/90'
          }`}
          title={isOpen ? 'Hide Terminal' : 'Open Bottom Terminal'}
        >
          <Terminal className={`w-3.5 h-3.5 ${isOpen ? 'text-emerald-400' : 'text-zinc-600'}`} />
          <span>Terminal</span>
          {isOpen && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          )}
        </button>
      </div>
    </>
  );
};

export default TerminalDock;
