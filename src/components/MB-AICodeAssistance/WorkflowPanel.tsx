import React from 'react';
import { 
  X, 
  Plus, 
  FileCode2, 
  ChevronRight, 
  Sparkles, 
  Play, 
  Terminal, 
  History,
  Workflow,
  CheckCircle2
} from 'lucide-react';
import { ProducedFile } from '../../types';

export interface WorkflowPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeSessionTitle?: string;
  producedFiles?: ProducedFile[];
  onSelectFile?: (file: ProducedFile) => void;
  onStartNewSession?: () => void;
  onRunAction?: (actionName: string) => void;
  onSelectRecentSession?: (sessionTitle: string) => void;
}

export const WorkflowPanel: React.FC<WorkflowPanelProps> = ({
  isOpen,
  onClose,
  activeSessionTitle = 'hi',
  producedFiles = [
    {
      name: 'search_tree.py',
      path: '/workspace/search_tree.py',
      size: '3.4 KB',
      language: 'python',
      content: `# search_tree.py - Clinical Search Tree Traversal\nimport os\n\ndef traverse():\n    print("Indexed 491 patient cohorts")\n`,
    }
  ],
  onSelectFile,
  onStartNewSession,
  onRunAction,
  onSelectRecentSession,
}) => {
  if (!isOpen) return null;

  const recentSessions = [
    { id: '1', title: 'hi', isActive: true },
    { id: '2', title: 'build_index_vector.py optimize', isActive: false },
    { id: '3', title: 'data_preprocessing_pipeline', isActive: false },
  ];

  return (
    <aside className="w-80 sm:w-88 h-full bg-[#fafbfc] border-l border-zinc-200 flex flex-col shrink-0 select-none z-20 text-zinc-700 font-sans shadow-sm">
      {/* Header: Workspace & Tools with Close X */}
      <div className="h-11 px-4 border-b border-zinc-200/80 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-2 text-zinc-800 font-semibold text-xs">
          <Workflow className="w-4 h-4 text-sky-600" />
          <span>Workspace & Tools</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          title="Close Workspace & Tools"
          aria-label="Close Workspace & Tools"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Body Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
        
        {/* Start New Session Button (Dashed outline matching Image 2) */}
        <button
          type="button"
          onClick={onStartNewSession}
          className="w-full py-2.5 px-3 border border-dashed border-zinc-300 hover:border-zinc-400 rounded-xl bg-white hover:bg-zinc-50/80 text-zinc-700 font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group"
        >
          <Plus className="w-4 h-4 text-zinc-400 group-hover:text-zinc-700" />
          <span>Start New Session</span>
        </button>

        {/* ACTIVE SESSION Section */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Active Session
          </div>
          <div className="p-3 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-0.5">
            <div className="font-semibold text-zinc-900 text-sm">
              {activeSessionTitle}
            </div>
            <div className="text-zinc-500 text-[11px]">
              Autonomous Coding Agent v3.8
            </div>
          </div>
        </div>

        {/* PRODUCED FILES Section */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Produced Files ({producedFiles.length})
          </div>
          <div className="space-y-1">
            {producedFiles.map((file) => (
              <div
                key={file.name}
                onClick={() => onSelectFile?.(file)}
                className="p-2.5 bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-center justify-between cursor-pointer transition-colors group shadow-2xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100 shrink-0">
                    <FileCode2 className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="font-mono text-xs font-medium text-zinc-800 truncate">
                      {file.name}
                    </div>
                    <div className="text-[10px] text-zinc-400">
                      {file.size || '3.4 KB'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* QUICK ACTIONS Section */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Quick Actions
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => onRunAction?.('Run Workspace Linter')}
              className="w-full p-2 bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-center gap-2.5 text-zinc-700 font-medium transition-colors cursor-pointer shadow-2xs text-left"
            >
              <div className="p-1 text-purple-600 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs">Run Workspace Linter</span>
            </button>

            <button
              type="button"
              onClick={() => onRunAction?.('Run Unit Tests')}
              className="w-full p-2 bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-center gap-2.5 text-zinc-700 font-medium transition-colors cursor-pointer shadow-2xs text-left"
            >
              <div className="p-1 text-emerald-600 shrink-0">
                <Play className="w-4 h-4 fill-emerald-600/20" />
              </div>
              <span className="text-xs">Run Unit Tests</span>
            </button>

            <button
              type="button"
              onClick={() => onRunAction?.('Inspect Environment')}
              className="w-full p-2 bg-white hover:bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-center gap-2.5 text-zinc-700 font-medium transition-colors cursor-pointer shadow-2xs text-left"
            >
              <div className="p-1 text-blue-600 shrink-0">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="text-xs">Inspect Environment</span>
            </button>
          </div>
        </div>

        {/* RECENT SESSIONS Section */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            Recent Sessions
          </div>
          <div className="space-y-1">
            {recentSessions.map((session) => (
              <button
                key={session.id}
                type="button"
                onClick={() => onSelectRecentSession?.(session.title)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-2 ${
                  session.isActive
                    ? 'bg-[#e0f2fe] text-[#0369a1] font-medium border border-[#bae6fd]'
                    : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900'
                }`}
              >
                {!session.isActive && (
                  <History className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                )}
                <span className="truncate">{session.title}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Footer Status matching Image 2 */}
      <div className="h-9 px-4 border-t border-zinc-200 bg-white flex items-center justify-between text-[11px] text-zinc-500 shrink-0">
        <span>Container: Linux x86_64</span>
        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Ready
        </span>
      </div>
    </aside>
  );
};

export default WorkflowPanel;
