import React from 'react';
import { 
  Save, 
  Scissors, 
  Copy, 
  Clipboard, 
  Undo, 
  Trash2, 
  Plus, 
  List, 
  RadioTower, 
  RotateCw, 
  FastForward,
  Sparkles
} from 'lucide-react';

interface NotebookToolbarProps {
  onSave?: () => void;
  onAddCodeCell?: () => void;
  onDeleteSelectedCell?: () => void;
  onRestartKernel?: () => void;
  onRunAll?: () => void;
  onClearOutputs?: () => void;
  onTriggerAiFix?: () => void;
}

export const NotebookToolbar: React.FC<NotebookToolbarProps> = ({
  onSave,
  onAddCodeCell,
  onDeleteSelectedCell,
  onRestartKernel,
  onRunAll,
  onClearOutputs,
  onTriggerAiFix,
}) => {
  return (
    <div className="bg-white border-b border-zinc-200 px-4 py-1.5 flex items-center justify-between text-zinc-500 select-none shrink-0 overflow-x-auto gap-1 sm:gap-2">
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Save */}
        <button
          type="button"
          onClick={onSave}
          className="p-1.5 hover:bg-zinc-100 hover:text-zinc-800 rounded transition-colors cursor-pointer"
          title="Save Notebook (Ctrl+S)"
        >
          <Save className="w-4 h-4" />
        </button>

        {/* Cut */}
        <button
          type="button"
          className="p-1.5 hover:bg-zinc-100 hover:text-zinc-800 rounded transition-colors cursor-pointer"
          title="Cut cell (X)"
        >
          <Scissors className="w-4 h-4" />
        </button>

        {/* Copy */}
        <button
          type="button"
          className="p-1.5 hover:bg-zinc-100 hover:text-zinc-800 rounded transition-colors cursor-pointer"
          title="Copy cell (C)"
        >
          <Copy className="w-4 h-4" />
        </button>

        {/* Paste */}
        <button
          type="button"
          className="p-1.5 hover:bg-zinc-100 hover:text-zinc-800 rounded transition-colors cursor-pointer"
          title="Paste cell (V)"
        >
          <Clipboard className="w-4 h-4" />
        </button>

        {/* Undo */}
        <button
          type="button"
          className="p-1.5 hover:bg-zinc-100 hover:text-zinc-800 rounded transition-colors cursor-pointer"
          title="Undo cell action (Z)"
        >
          <Undo className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={onDeleteSelectedCell}
          className="p-1.5 hover:bg-zinc-100 hover:text-red-600 rounded transition-colors cursor-pointer"
          title="Delete cell (D, D)"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-zinc-200 mx-1" />

        {/* Add Cell (+) */}
        <button
          type="button"
          onClick={onAddCodeCell}
          className="p-1.5 hover:bg-zinc-100 hover:text-zinc-800 rounded transition-colors cursor-pointer"
          title="Add Code Cell Below (B)"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Table of contents / list */}
        <button
          type="button"
          className="p-1.5 hover:bg-zinc-100 hover:text-zinc-800 rounded transition-colors cursor-pointer"
          title="Notebook structure & TOC"
        >
          <List className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-zinc-200 mx-1" />

        {/* Interrupt */}
        <button
          type="button"
          className="p-1.5 hover:bg-zinc-100 hover:text-amber-600 rounded transition-colors cursor-pointer"
          title="Interrupt kernel (I, I)"
        >
          <RadioTower className="w-4 h-4" />
        </button>

        {/* Restart Kernel */}
        <button
          type="button"
          onClick={onRestartKernel}
          className="p-1.5 hover:bg-zinc-100 hover:text-zinc-800 rounded transition-colors cursor-pointer"
          title="Restart kernel (0, 0)"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Fast forward (Run all) */}
        <button
          type="button"
          onClick={onRunAll}
          className="p-1.5 hover:bg-zinc-100 hover:text-emerald-700 rounded transition-colors cursor-pointer"
          title="Restart kernel and run all cells"
        >
          <FastForward className="w-4 h-4" />
        </button>
      </div>

      {/* Right side helper button */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onTriggerAiFix}
          className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-violet-700 hover:bg-violet-50 rounded transition-colors cursor-pointer"
          title="Ask AI Chat to generate code into the notebook"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <span className="font-medium hidden lg:inline">AI Code Writer</span>
        </button>
      </div>
    </div>
  );
};

export default NotebookToolbar;
