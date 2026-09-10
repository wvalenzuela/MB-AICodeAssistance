import React from 'react';
import { 
  FolderTree, 
  FileCode2, 
  History, 
  X, 
  Plus, 
  Bug, 
  Play, 
  TerminalSquare, 
  FileText,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ProducedFile } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  producedFiles: ProducedFile[];
  onSelectFile: (file: ProducedFile) => void;
  sessionTitle: string;
  onNewSession: () => void;
  onRunQuickAction: (action: string) => void;
}

class Sidebar extends React.Component<SidebarProps> {
  componentDidMount() {
    document.addEventListener('keydown', this.handleGlobalKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleGlobalKeyDown);
  }

  handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.props.isOpen) {
      this.props.onClose();
    }
  };

  handleClose = () => {
    this.props.onClose();
  };

  handleNewSession = () => {
    this.props.onNewSession();
  };

  handleSelectFile = (file: ProducedFile) => () => {
    this.props.onSelectFile(file);
  };

  handleRunQuickAction = (action: string) => () => {
    this.props.onRunQuickAction(action);
  };

  render() {
    const { isOpen, producedFiles, sessionTitle } = this.props;

    if (!isOpen) return null;

    return (
      <>
        {/* Backdrop to close drawer when clicking outside */}
        <div
          className="fixed inset-0 bg-black/20 z-40 backdrop-blur-xs transition-opacity"
          onClick={this.handleClose}
        />

        {/* Sidebar Drawer */}
        <aside className="fixed top-0 right-0 bottom-0 z-40 w-80 bg-white border-l border-zinc-200/90 shadow-lg flex flex-col transition-all duration-200 animate-in slide-in-from-right">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-200/80 bg-zinc-50/60">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-zinc-800">Workspace & Tools</span>
            </div>
            <button
              type="button"
              onClick={this.handleClose}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs">
            {/* New Session Button */}
            <div>
              <button
                type="button"
                onClick={this.handleNewSession}
                className="w-full py-2 px-3 rounded-lg border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-100/70 text-zinc-700 flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Start New Session</span>
              </button>
            </div>

            {/* Current Session Info */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase text-zinc-400 tracking-wider font-mono">
                Active Session
              </div>
              <div className="p-2.5 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-1">
                <div className="font-semibold text-zinc-800 truncate">{sessionTitle}</div>
                <div className="text-[11px] text-zinc-500">Autonomous Coding Agent v3.8</div>
              </div>
            </div>

            {/* Produced Files Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase text-zinc-400 tracking-wider font-mono">
                  Produced Files ({producedFiles.length})
                </div>
              </div>

              <div className="space-y-1">
                {producedFiles.length > 0 ? (
                  producedFiles.map((file) => (
                    <div
                      key={file.name}
                      onClick={this.handleSelectFile(file)}
                      className="group flex items-center justify-between p-2 rounded-lg hover:bg-zinc-100 border border-transparent hover:border-zinc-200 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCode2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="font-mono text-zinc-800 truncate text-[11px] group-hover:text-blue-600">
                            {file.name}
                          </div>
                          <div className="text-[10px] text-zinc-400 truncate">{file.size}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-700" />
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-zinc-400 text-xs italic">
                    No files generated in this session yet
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase text-zinc-400 tracking-wider font-mono">
                Quick Actions
              </div>
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={this.handleRunQuickAction('Verify all python scripts with flake8')}
                  className="w-full text-left p-2 rounded-lg hover:bg-zinc-100 flex items-center gap-2.5 text-zinc-700 transition-colors cursor-pointer"
                >
                  <Bug className="w-3.5 h-3.5 text-purple-600" />
                  <span>Run Workspace Linter</span>
                </button>
                <button
                  type="button"
                  onClick={this.handleRunQuickAction('Run test suite with pytest')}
                  className="w-full text-left p-2 rounded-lg hover:bg-zinc-100 flex items-center gap-2.5 text-zinc-700 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Run Unit Tests</span>
                </button>
                <button
                  type="button"
                  onClick={this.handleRunQuickAction('Check terminal environment status')}
                  className="w-full text-left p-2 rounded-lg hover:bg-zinc-100 flex items-center gap-2.5 text-zinc-700 transition-colors cursor-pointer"
                >
                  <TerminalSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Inspect Environment</span>
                </button>
              </div>
            </div>

            {/* Recent Sessions list */}
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase text-zinc-400 tracking-wider font-mono">
                Recent Sessions
              </div>
              <div className="space-y-1">
                <div className="p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-blue-900 font-medium">
                  {sessionTitle}
                </div>
                <div className="p-2 rounded-lg hover:bg-zinc-50 text-zinc-500 cursor-pointer flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate">build_index_vector.py optimize</span>
                </div>
                <div className="p-2 rounded-lg hover:bg-zinc-50 text-zinc-500 cursor-pointer flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate">data_preprocessing pipeline</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="p-3 border-t border-zinc-200/80 bg-zinc-50/70 text-[11px] text-zinc-400 flex items-center justify-between">
            <span>Container: Linux x86_64</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Ready
            </span>
          </div>
        </aside>
      </>
    );
  }
}

export default Sidebar;
