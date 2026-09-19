import React from 'react';
import { Code2, FileText, Database } from 'lucide-react';
import { CellType } from '../../../types';

interface AddCellBarProps {
  onAddCell: (type: CellType) => void;
}

export const AddCellBar: React.FC<AddCellBarProps> = ({ onAddCell }) => {
  return (
    <div className="flex items-center justify-center gap-2.5 py-6 select-none border-t border-zinc-200/60 mt-6">
      <button
        type="button"
        onClick={() => onAddCell('code')}
        className="flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-900 rounded-md text-xs font-medium shadow-2xs transition-colors cursor-pointer"
      >
        <Code2 className="w-3.5 h-3.5 text-sky-600" />
        <span>+ Add Code</span>
      </button>

      <button
        type="button"
        onClick={() => onAddCell('markdown')}
        className="flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-900 rounded-md text-xs font-medium shadow-2xs transition-colors cursor-pointer"
      >
        <FileText className="w-3.5 h-3.5 text-emerald-600" />
        <span>+ Add Markdown</span>
      </button>

      <button
        type="button"
        onClick={() => onAddCell('sql')}
        className="flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:text-zinc-900 rounded-md text-xs font-medium shadow-2xs transition-colors cursor-pointer"
      >
        <Database className="w-3.5 h-3.5 text-purple-600" />
        <span>+ Add SQL Cell</span>
      </button>
    </div>
  );
};

export default AddCellBar;
