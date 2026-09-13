import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  ChevronDown, 
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Maximize2, 
  Minimize2, 
  Trash2,
  PanelBottom,
  PanelTop,
  PanelLeft,
  PanelRight,
  Check
} from 'lucide-react';
import { TerminalPosition } from '../../types';

export interface TerminalDockProps {
  isOpen: boolean;
  onToggle: () => void;
  outputLines?: string[];
  position?: TerminalPosition;
  onChangePosition?: (position: TerminalPosition) => void;
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

const POSITION_OPTIONS: { id: TerminalPosition; label: string; subLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'bottom', label: 'Bottom (Down)', subLabel: 'Default', icon: PanelBottom },
  { id: 'top', label: 'Top (Up)', subLabel: 'Above Chat', icon: PanelTop },
  { id: 'left', label: 'Left', subLabel: 'Beside Chat', icon: PanelLeft },
  { id: 'right', label: 'Right', subLabel: 'Beside Chat', icon: PanelRight },
];

export const TerminalDock: React.FC<TerminalDockProps> = ({
  isOpen,
  onToggle,
  outputLines: initialOutputLines = DEFAULT_TERMINAL_OUTPUT,
  position = 'bottom',
  onChangePosition,
}) => {
  const [lines, setLines] = useState<string[]>(initialOutputLines);
  const [inputValue, setInputValue] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'output' | 'debug'>('terminal');
  const [isPositionMenuOpen, setIsPositionMenuOpen] = useState(false);
  const [connectedPosition, setConnectedPosition] = useState<'left' | 'right'>('right');
  const positionDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        positionDropdownRef.current &&
        !positionDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPositionMenuOpen(false);
      }
    };
    if (isPositionMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPositionMenuOpen]);

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

  // Determine sizing and borders depending on placement position
  let layoutClasses = '';
  if (position === 'bottom') {
    layoutClasses = `w-full border-t border-zinc-800 ${isMaximized ? 'h-96' : 'h-64 sm:h-72'} order-2`;
  } else if (position === 'top') {
    layoutClasses = `w-full border-b border-zinc-800 ${isMaximized ? 'h-96' : 'h-64 sm:h-72'} order-1`;
  } else if (position === 'left') {
    layoutClasses = `h-full border-r border-zinc-800 ${isMaximized ? 'w-[520px]' : 'w-80 md:w-96 lg:w-[420px]'} order-1`;
  } else if (position === 'right') {
    layoutClasses = `h-full border-l border-zinc-800 ${isMaximized ? 'w-[520px]' : 'w-80 md:w-96 lg:w-[420px]'} order-2`;
  }

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

  // Choose icon for current position
  const CurrentPositionIcon = 
    position === 'bottom' ? PanelBottom :
    position === 'top' ? PanelTop :
    position === 'left' ? PanelLeft : PanelRight;

  return (
    <>
      {/* Docked Terminal Panel */}
      {isOpen && (
        <div 
          className={`bg-[#0d1117] text-zinc-300 font-mono text-xs flex flex-col shrink-0 z-30 select-text transition-all duration-200 ${layoutClasses}`}
        >
          {/* Terminal Title Bar */}
          <div className="h-9 px-3 bg-[#161b22] border-b border-zinc-800 flex items-center justify-between text-zinc-400 select-none shrink-0 gap-2">
            {/* Left: Tabs & Status */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex items-center gap-1 shrink-0">
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
                  <span className="truncate">Terminal</span>
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
              <div ref={positionDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsPositionMenuOpen(!isPositionMenuOpen)}
                  className="flex items-center gap-1.5 px-2 py-1 bg-zinc-800/70 hover:bg-zinc-800 border border-zinc-700/70 rounded text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer text-[11px] font-sans"
                  title={`Terminal Placement: ${position.toUpperCase()} (Click to place Left, Right, Up/Top, or Down/Bottom)`}
                  aria-label="Select Terminal Placement"
                >
                  <CurrentPositionIcon className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="capitalize text-[11px] font-medium hidden sm:inline">{position}</span>
                  <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isPositionMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isPositionMenuOpen && (
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
                            setIsPositionMenuOpen(false);
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
                          onClick={() => setConnectedPosition('left')}
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
                          onClick={() => setConnectedPosition('right')}
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

              {/* Clear Console */}
              <button
                type="button"
                onClick={handleClear}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                title="Clear Terminal Output"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Maximize / Restore */}
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
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
                onClick={onToggle}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer ml-0.5"
                title="Collapse Terminal Dock"
              >
                {getCollapseIcon()}
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

          {/* Terminal Bottom Status Bar (Browser Console style) */}
          <div className="h-8 px-3 bg-[#161b22] border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 select-none shrink-0 font-sans gap-2">
            {/* Left side */}
            <div className="flex items-center gap-2.5 truncate min-w-0">
              {connectedPosition === 'left' && (
                <>
                  <button
                    type="button"
                    onClick={() => setConnectedPosition('right')}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-400 font-sans text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                    title="Container Status: Connected (Click to move to Bottom Right)"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span>Connected</span>
                  </button>
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
                  onClick={() => setLines((prev) => [...prev, '>>> nvidia-smi: A100-SXM4-80GB (99% idle, 42C)'])}
                  className="hover:text-zinc-200 text-zinc-400 cursor-pointer text-[10px] px-1.5 py-0.5 bg-zinc-800/80 hover:bg-zinc-800 rounded font-mono transition-colors"
                >
                  nvidia-smi
                </button>
                <button
                  type="button"
                  onClick={() => setLines((prev) => [...prev, '>>> pip list | grep torch: torch==2.1.2+cu121'])}
                  className="hover:text-zinc-200 text-zinc-400 cursor-pointer text-[10px] px-1.5 py-0.5 bg-zinc-800/80 hover:bg-zinc-800 rounded font-mono transition-colors"
                >
                  torch
                </button>
              </div>

              {connectedPosition === 'right' && (
                <>
                  <span className="text-zinc-700 hidden xs:inline">|</span>
                  <button
                    type="button"
                    onClick={() => setConnectedPosition('left')}
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-400 font-sans text-[11px] font-medium transition-colors cursor-pointer shrink-0"
                    title="Container Status: Connected (Click to move to Bottom Left)"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span>Connected</span>
                  </button>
                </>
              )}
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
          title={isOpen ? 'Hide Terminal' : `Open Terminal (${position})`}
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
