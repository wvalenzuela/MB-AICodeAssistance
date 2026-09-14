import React, { useState } from 'react';
import { TerminalPosition } from '../../../types';
import { TerminalDockProps, TerminalTab } from './types';
import { 
  TerminalTitleBar, 
  TerminalScreen, 
  TerminalStatusBar, 
  FloatingTerminalPill 
} from './components';

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
  position = 'bottom',
  onChangePosition,
}) => {
  const [lines, setLines] = useState<string[]>(initialOutputLines);
  const [inputValue, setInputValue] = useState('');
  const [isMaximized, setIsMaximized] = useState(false);
  const [activeTab, setActiveTab] = useState<TerminalTab>('terminal');
  const [isPositionMenuOpen, setIsPositionMenuOpen] = useState(false);
  const [connectedPosition, setConnectedPosition] = useState<'left' | 'right'>('right');

  const handleClear = () => {
    setLines(['Console cleared. Ready for commands.']);
  };

  const handleQuickCommand = (log: string) => {
    setLines((prev) => [...prev, log]);
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

  return (
    <>
      {/* Docked Terminal Panel */}
      {isOpen && (
        <div 
          className={`bg-[#0d1117] text-zinc-300 font-mono text-xs flex flex-col shrink-0 z-30 select-text transition-all duration-200 ${layoutClasses}`}
        >
          {/* Top Title Bar */}
          <TerminalTitleBar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            position={position}
            onChangePosition={onChangePosition}
            isMaximized={isMaximized}
            onToggleMaximize={() => setIsMaximized(!isMaximized)}
            onToggleCollapse={onToggle}
            onClear={handleClear}
            isPositionMenuOpen={isPositionMenuOpen}
            onTogglePositionMenu={() => setIsPositionMenuOpen(!isPositionMenuOpen)}
            onClosePositionMenu={() => setIsPositionMenuOpen(false)}
            connectedPosition={connectedPosition}
            onChangeConnectedPosition={setConnectedPosition}
          />

          {/* Terminal Screen (Terminal, Output, Debug) */}
          <TerminalScreen
            activeTab={activeTab}
            lines={lines}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onCommandSubmit={handleCommandSubmit}
          />

          {/* Bottom Status Bar (Browser Console style) */}
          <TerminalStatusBar
            connectedPosition={connectedPosition}
            onToggleConnectedPosition={() => setConnectedPosition(prev => prev === 'right' ? 'left' : 'right')}
            onQuickCommand={handleQuickCommand}
          />
        </div>
      )}

      {/* Floating Pill Button in bottom-right corner */}
      <FloatingTerminalPill
        isOpen={isOpen}
        onToggle={onToggle}
        position={position}
      />
    </>
  );
};

export default TerminalDock;
