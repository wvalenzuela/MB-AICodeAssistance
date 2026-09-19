import React, { useState, useRef, useEffect } from 'react';

interface NotebookMenuBarProps {
  onSave?: () => void;
  onAddCodeCell?: () => void;
  onAddMarkdownCell?: () => void;
  onRunAll?: () => void;
  onClearOutputs?: () => void;
  onRestartKernel?: () => void;
}

export const NotebookMenuBar: React.FC<NotebookMenuBarProps> = ({
  onSave,
  onAddCodeCell,
  onAddMarkdownCell,
  onRunAll,
  onClearOutputs,
  onRestartKernel,
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const menus: Record<string, { label: string; action: () => void; shortcut?: string }[]> = {
    File: [
      { label: 'Save Notebook', action: () => onSave?.(), shortcut: 'Ctrl+S' },
      { label: 'Export as .ipynb', action: () => onSave?.() },
      { label: 'Export as Python script (.py)', action: () => onSave?.() },
      { label: 'Revert to Checkpoint', action: () => {} },
    ],
    Edit: [
      { label: 'Insert Cell Above', action: () => onAddCodeCell?.(), shortcut: 'A' },
      { label: 'Insert Cell Below', action: () => onAddCodeCell?.(), shortcut: 'B' },
      { label: 'Delete Selected Cell', action: () => {} },
      { label: 'Undo Cell Operation', action: () => {}, shortcut: 'Ctrl+Z' },
    ],
    View: [
      { label: 'Toggle Line Numbers', action: () => {}, shortcut: 'Shift+L' },
      { label: 'Toggle Cell Outputs', action: () => {} },
      { label: 'Collapse All Sections', action: () => {} },
    ],
    Run: [
      { label: 'Run Selected Cell', action: () => onRunAll?.(), shortcut: 'Shift+Enter' },
      { label: 'Run All Cells', action: () => onRunAll?.(), shortcut: 'Ctrl+F9' },
      { label: 'Clear All Outputs', action: () => onClearOutputs?.() },
    ],
    Kernel: [
      { label: 'Interrupt Kernel', action: () => {} },
      { label: 'Restart Kernel', action: () => onRestartKernel?.() },
      { label: 'Restart & Clear Outputs', action: () => { onRestartKernel?.(); onClearOutputs?.(); } },
      { label: 'Restart & Run All', action: () => { onRestartKernel?.(); onRunAll?.(); } },
    ],
    Help: [
      { label: 'Keyboard Shortcuts', action: () => {}, shortcut: 'H' },
      { label: 'Medical-Blocks Python SDK Docs', action: () => {} },
      { label: 'PyTorch & CUDA Diagnostics', action: () => {} },
    ],
  };

  return (
    <div ref={barRef} className="bg-white border-b border-zinc-200 px-4 py-1 flex items-center text-xs text-zinc-600 select-none shrink-0 gap-1 font-sans">
      {Object.keys(menus).map((menuKey) => {
        const isOpen = openMenu === menuKey;
        return (
          <div key={menuKey} className="relative">
            <button
              type="button"
              onClick={() => setOpenMenu(isOpen ? null : menuKey)}
              className={`px-2 py-0.5 rounded hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer ${isOpen ? 'bg-zinc-100 text-zinc-900 font-medium' : ''}`}
            >
              {menuKey}
            </button>

            {isOpen && (
              <div className="absolute left-0 mt-1 w-56 bg-white border border-zinc-200 rounded-md shadow-xl py-1 z-50 text-xs text-zinc-700 animate-in fade-in duration-75">
                {menus[menuKey].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      item.action();
                      setOpenMenu(null);
                    }}
                    className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-zinc-100 hover:text-zinc-900 text-left cursor-pointer"
                  >
                    <span>{item.label}</span>
                    {item.shortcut && (
                      <span className="text-[10px] text-zinc-400 font-mono ml-3">{item.shortcut}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default NotebookMenuBar;
