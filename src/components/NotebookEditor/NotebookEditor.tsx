import React, { useState, useRef, useEffect } from 'react';
import { 
  NotebookData, 
  NotebookCellItem, 
  CellType, 
  CellOutput,
  ProducedFile
} from '../../types';
import { INITIAL_PRODUCED_FILE } from '../../mockData';
import { Plus, X, Sparkles } from 'lucide-react';
import NotebookHeader from './components/NotebookHeader';
import NotebookMenuBar from './components/NotebookMenuBar';
import NotebookToolbar from './components/NotebookToolbar';
import GpuAccessBanner from './components/GpuAccessBanner';
import NotebookCell from './components/NotebookCell';
import AddCellBar from './components/AddCellBar';
import PythonCodeEditor from '../PythonCodeEditor/PythonCodeEditor';

export interface NotebookEditorProps {
  notebook: NotebookData;
  onUpdateNotebook: (updated: NotebookData | ((prev: NotebookData) => NotebookData)) => void;
  onAskAiToAssist?: (prompt: string, targetCellId?: string) => void;
  isAiGenerating?: boolean;
  onStopAiStreaming?: () => void;
  onTriggerAiFix?: () => void;
  isSplitView?: boolean;
  onToggleSplitView?: () => void;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
  isExplorerOpen?: boolean;
  onToggleExplorer?: () => void;
  onShowToast?: (message: string) => void;
  activeTab?: string;
  onSelectTab?: (tabId: string) => void;
  openFiles?: ProducedFile[];
  onCloseFile?: (fileName: string) => void;
  isNotebookOpen?: boolean;
  onCloseNotebook?: () => void;
  onCloseTab?: (tabId: string) => void;
  onUpdateFileContent?: (fileName: string, content: string) => void;
  onCreateNewFile?: () => void;
}

export const NotebookEditor: React.FC<NotebookEditorProps> = ({
  notebook,
  onUpdateNotebook,
  onAskAiToAssist,
  isAiGenerating = false,
  onStopAiStreaming,
  onTriggerAiFix,
  isSplitView = true,
  onToggleSplitView,
  onToggleChat,
  isChatOpen = true,
  isExplorerOpen = true,
  onToggleExplorer,
  onShowToast,
  activeTab = 'notebook',
  onSelectTab,
  openFiles = [],
  onCloseFile,
  isNotebookOpen = true,
  onCloseNotebook,
  onCloseTab,
  onUpdateFileContent,
  onCreateNewFile,
}) => {
  const [selectedCellId, setSelectedCellId] = useState<string | null>(notebook.cells[0]?.id || null);
  const [execCounter, setExecCounter] = useState<number>(6);

  // Update cell source code
  const handleUpdateSource = (id: string, newSource: string) => {
    onUpdateNotebook((prev) => ({
      ...prev,
      cells: prev.cells.map((c) => (c.id === id ? { ...c, source: newSource } : c)),
    }));
  };

  // Change cell type
  const handleChangeType = (id: string, newType: CellType) => {
    onUpdateNotebook((prev) => ({
      ...prev,
      cells: prev.cells.map((c) => (c.id === id ? { ...c, type: newType } : c)),
    }));
  };

  // Delete cell
  const handleDeleteCell = (id: string) => {
    onUpdateNotebook((prev) => ({
      ...prev,
      cells: prev.cells.filter((c) => c.id !== id),
    }));
    onShowToast?.('Cell deleted');
  };

  // Move cell up
  const handleMoveUp = (id: string) => {
    onUpdateNotebook((prev) => {
      const idx = prev.cells.findIndex((c) => c.id === id);
      if (idx <= 0) return prev;
      const copy = [...prev.cells];
      const temp = copy[idx - 1];
      copy[idx - 1] = copy[idx];
      copy[idx] = temp;
      return { ...prev, cells: copy };
    });
  };

  // Move cell down
  const handleMoveDown = (id: string) => {
    onUpdateNotebook((prev) => {
      const idx = prev.cells.findIndex((c) => c.id === id);
      if (idx < 0 || idx >= prev.cells.length - 1) return prev;
      const copy = [...prev.cells];
      const temp = copy[idx + 1];
      copy[idx + 1] = copy[idx];
      copy[idx] = temp;
      return { ...prev, cells: copy };
    });
  };

  // Add new cell
  const handleAddCell = (type: CellType) => {
    const newId = `cell-${Date.now()}`;
    const newCell: NotebookCellItem = {
      id: newId,
      type,
      source: type === 'code' ? '# Write python code here\n' : type === 'sql' ? '-- Write SQL query\nSELECT * FROM clinical_cohorts LIMIT 10;' : '### New Section\nDouble click to edit markdown description.',
      executionCount: null,
      status: 'idle',
      outputs: [],
    };

    onUpdateNotebook((prev) => ({
      ...prev,
      cells: [...prev.cells, newCell],
    }));
    setSelectedCellId(newId);
    onShowToast?.(`Added new ${type} cell`);
  };

  // Run a specific cell
  const handleRunCell = (id: string) => {
    const nextCount = execCounter + 1;
    setExecCounter(nextCount);

    onUpdateNotebook((prev) => ({
      ...prev,
      kernelStatus: 'busy',
      cells: prev.cells.map((c) => {
        if (c.id !== id) return c;

        // Check if cell is Cell 13 with uninitialized ROOT
        const isCell13Unfixed = c.source.includes('shutil.rmtree(ROOT)') && !c.source.includes('try:') && !c.source.includes('ROOT =');

        let outputs: CellOutput[] = [];
        let status: 'success' | 'error' = 'success';

        if (isCell13Unfixed) {
          status = 'error';
          outputs = [
            {
              type: 'error',
              ename: 'NameError',
              evalue: "name 'ROOT' is not defined",
              content: "name 'ROOT' is not defined",
              traceback: [
                '---------------------------------------------------------------------------',
                'NameError                                 Traceback (most recent call last)',
                'Cell In[2], line 2',
                '      1 import shutil',
                '----> 2 shutil.rmtree(ROOT)',
                "NameError: name 'ROOT' is not defined",
              ],
            },
          ];
        } else if (c.source.includes('ROOT') && (c.source.includes('try:') || c.source.includes('ROOT ='))) {
          status = 'success';
          outputs = [
            {
              type: 'text',
              content: '✓ Successfully removed test root: run_20260919_043653/\nTemporary cache and session directory cleaned.',
            },
          ];
        } else if (c.source.includes('tree(')) {
          outputs = [
            {
              type: 'text',
              content: 'Setup complete.\nROOT: /home/jovyan/sync_test/run_20260919_043653\n├── cache/\n├── dicoms/\n└── metadata.json',
            },
          ];
        } else if (c.type === 'sql') {
          outputs = [
            {
              type: 'text',
              content: 'Query OK, 10 rows returned (0.004 sec)\ncohort_id | patient_count | modality\nC-01      | 48            | CT\nC-02      | 94            | MRI',
            },
          ];
        } else {
          outputs = [
            {
              type: 'text',
              content: `[Out ${nextCount}]: Cell executed successfully in 0.04s.`,
            },
          ];
        }

        return {
          ...c,
          executionCount: nextCount,
          status,
          outputs,
        };
      }),
    }));

    setTimeout(() => {
      onUpdateNotebook((prev) => ({ ...prev, kernelStatus: 'idle' }));
    }, 400);

    onShowToast?.(`Executed cell [${nextCount}]`);
  };

  // Run all cells
  const handleRunAll = () => {
    let currentCount = execCounter;
    onUpdateNotebook((prev) => ({
      ...prev,
      kernelStatus: 'busy',
      cells: prev.cells.map((c) => {
        if (c.type !== 'code' && c.type !== 'sql') return c;
        currentCount += 1;
        return {
          ...c,
          executionCount: currentCount,
          status: 'success',
          outputs: c.outputs?.length ? c.outputs : [{ type: 'text', content: 'Cell completed.' }],
        };
      }),
    }));
    setExecCounter(currentCount);

    setTimeout(() => {
      onUpdateNotebook((prev) => ({ ...prev, kernelStatus: 'idle' }));
      onShowToast?.('Ran all cells');
    }, 600);
  };

  // Restart kernel
  const handleRestartKernel = () => {
    onUpdateNotebook((prev) => ({
      ...prev,
      kernelStatus: 'restarting',
    }));
    setTimeout(() => {
      onUpdateNotebook((prev) => ({
        ...prev,
        kernelStatus: 'idle',
      }));
      onShowToast?.('Kernel restarted: Python 3');
    }, 700);
  };

  // Clear all outputs
  const handleClearOutputs = () => {
    onUpdateNotebook((prev) => ({
      ...prev,
      cells: prev.cells.map((c) => ({
        ...c,
        executionCount: null,
        outputs: [],
        status: 'idle',
      })),
    }));
    onShowToast?.('Cleared all cell outputs');
  };

  // Ask AI to fix a specific cell
  const handleAskAiToFixCell = (cell: NotebookCellItem) => {
    if (onAskAiToAssist) {
      onAskAiToAssist(`Please fix the ${cell.outputs?.[0]?.ename || 'error'} in this cell: ${cell.source}`, cell.id);
    } else if (onTriggerAiFix) {
      onTriggerAiFix();
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isSmallWidth = containerWidth < 740;
  const totalOpenTabs = (isNotebookOpen ? 1 : 0) + openFiles.length;
  const showTabBar = totalOpenTabs > 1;

  const currentActiveFile = 
    openFiles.find((f) => f.name === activeTab || f.name.toLowerCase() === activeTab?.toLowerCase() || f.path === activeTab) ||
    (activeTab && activeTab !== 'notebook' ? {
      name: activeTab.split('/').pop() || activeTab,
      path: activeTab.startsWith('/') ? activeTab : `/workspace/${activeTab}`,
      size: '3.4 KB',
      language: (activeTab.endsWith('.sh') ? 'bash' : activeTab.endsWith('.json') ? 'json' : 'python') as any,
      content: INITIAL_PRODUCED_FILE.content,
    } : null);

  return (
    <div ref={containerRef} className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#f8fafc] overflow-hidden select-text border-r border-zinc-200 pt-[16px]">
      {/* 0. Editor Tabs Bar - Hidden when only one tab remains per user request */}
      {showTabBar && (
        <div className="h-[34px] bg-[#f1f5f9] border-b border-zinc-200/80 flex items-end justify-between px-3 shrink-0 select-none min-w-0">
          <div className="flex-1 flex items-end gap-1.5 h-full min-w-0 overflow-x-auto no-scrollbar scrollbar-none">
            {/* Active Notebook Tab - Closable */}
            {isNotebookOpen && (
              <div 
                onClick={(e) => {
                  e.preventDefault();
                  onSelectTab?.('notebook');
                }}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-md text-xs font-medium cursor-pointer transition-colors shrink-0 ${
                  activeTab === 'notebook' || !activeTab
                    ? 'bg-white border-t-2 border-t-sky-600 border-x border-zinc-200/80 border-b-0 text-zinc-900 shadow-2xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                }`}
                title="Switch to Jupyter Notebook (test.ipynb)"
              >
                <span className="w-3.5 h-3.5 rounded-xs bg-[#e27300] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                  J
                </span>
                <span className="truncate max-w-[130px]">{notebook.title.endsWith('.ipynb') ? notebook.title : `${notebook.title}.ipynb`}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Kernel Active & Saved" />
                
                {/* Close button for notebook tab */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onCloseNotebook) {
                      onCloseNotebook();
                    } else if (onCloseTab) {
                      onCloseTab('notebook');
                    } else {
                      onCloseFile?.('notebook');
                    }
                  }}
                  className="p-0.5 text-zinc-400 hover:text-zinc-700 rounded hover:bg-zinc-100 transition-colors ml-0.5 opacity-60 group-hover:opacity-100 cursor-pointer"
                  title="Close test.ipynb"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Open Python / Script File Tabs - Closable */}
            {openFiles.map((file) => {
              const isFileActive = activeTab === file.name;
              return (
                <div 
                  key={file.name}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectTab?.(file.name);
                  }}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs transition-colors cursor-pointer shrink-0 ${
                    isFileActive
                      ? 'bg-white border-t-2 border-t-sky-600 border-x border-zinc-200/80 border-b-0 font-medium text-zinc-900 shadow-2xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 font-normal'
                  }`}
                  title={`Switch to ${file.name}`}
                >
                  <span className="w-3.5 h-3.5 rounded-xs bg-[#3776ab] flex items-center justify-center text-white text-[9px] font-bold shrink-0">
                    {file.name.endsWith('.sh') ? 'sh' : file.name.endsWith('.json') ? '{}' : 'py'}
                  </span>
                  <span className="truncate max-w-[130px]">{file.name}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onCloseTab) {
                        onCloseTab(file.name);
                      } else {
                        onCloseFile?.(file.name);
                      }
                    }}
                    className="p-0.5 text-zinc-400 hover:text-zinc-700 rounded hover:bg-zinc-100 transition-colors ml-0.5 opacity-60 group-hover:opacity-100 cursor-pointer"
                    title={`Close ${file.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}

            {/* New Tab Button */}
            <button
              type="button"
              onClick={onCreateNewFile || (() => onShowToast?.('Create new file or notebook'))}
              className="p-1 mb-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/70 rounded transition-colors cursor-pointer ml-0.5 shrink-0"
              title="New File / Script"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick right actions */}
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs shrink-0 pl-2 mb-1">
            <button
              type="button"
              onClick={onToggleChat}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isChatOpen 
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100' 
                  : 'text-zinc-600 hover:bg-zinc-200/70 border border-transparent'
              }`}
              title={isChatOpen ? 'Hide AI Assistant Panel' : 'Show AI Assistant Panel'}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              {!isSmallWidth && <span>AI Assistant</span>}
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Body: Python Code Editor or Jupyter Notebook or Empty Canvas */}
      {totalOpenTabs === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white select-none">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-4 shadow-2xs">
            <span className="w-7 h-7 rounded-xs bg-[#e27300] flex items-center justify-center text-white text-base font-bold shadow-2xs">
              J
            </span>
          </div>
          <h3 className="text-base font-semibold text-zinc-900 mb-1.5">No Open Editor Tabs</h3>
          <p className="text-xs text-zinc-500 max-w-sm mb-6 leading-relaxed">
            All workspace tabs are closed. Open a notebook or Python script from the file explorer or create a new file to resume editing.
          </p>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onSelectTab?.('notebook')}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <span>Open test.ipynb</span>
            </button>
            <button
              type="button"
              onClick={onCreateNewFile || (() => onShowToast?.('Create new file or notebook'))}
              className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Script</span>
            </button>
          </div>
        </div>
      ) : activeTab !== 'notebook' && currentActiveFile ? (
        <PythonCodeEditor
          file={currentActiveFile}
          onUpdateContent={(newContent) => onUpdateFileContent?.(currentActiveFile.name, newContent)}
          onAskAiToAssist={(prompt) => onAskAiToAssist?.(prompt)}
          isSplitView={isSplitView}
          onToggleSplitView={onToggleSplitView}
          onToggleChat={onToggleChat}
          isChatOpen={isChatOpen}
          onShowToast={onShowToast}
          onClose={() => {
            if (onCloseTab) {
              onCloseTab(currentActiveFile.name);
            } else {
              onCloseFile?.(currentActiveFile.name);
            }
          }}
        />
      ) : (
        <>
          {/* 1. Header (home > test, Run all, Python 3, Schedule, Share, Deploy, View switcher) */}
          <NotebookHeader
            notebook={notebook}
            onRunAll={handleRunAll}
            onRestartKernel={handleRestartKernel}
            isAiGenerating={isAiGenerating}
            onTriggerAiFix={onTriggerAiFix}
            isSplitView={isSplitView}
            onToggleSplitView={onToggleSplitView}
            onToggleChat={onToggleChat}
            isChatOpen={isChatOpen}
            isExplorerOpen={isExplorerOpen}
            onToggleExplorer={onToggleExplorer}
            onClose={() => {
              if (onCloseNotebook) {
                onCloseNotebook();
              } else if (onCloseTab) {
                onCloseTab('notebook');
              } else {
                onCloseFile?.('notebook');
              }
            }}
          />

          {/* 2. Menu Bar (File, Edit, View, Run, Kernel, Help) */}
          <NotebookMenuBar
            onSave={() => onShowToast?.('Notebook saved')}
            onAddCodeCell={() => handleAddCell('code')}
            onAddMarkdownCell={() => handleAddCell('markdown')}
            onRunAll={handleRunAll}
            onClearOutputs={handleClearOutputs}
            onRestartKernel={handleRestartKernel}
          />

          {/* 3. Toolbar (Save, Cut, Copy, Paste, Delete, Add, Restart, Fast forward) */}
          <NotebookToolbar
            onSave={() => onShowToast?.('Notebook saved')}
            onAddCodeCell={() => handleAddCell('code')}
            onDeleteSelectedCell={() => selectedCellId && handleDeleteCell(selectedCellId)}
            onRestartKernel={handleRestartKernel}
            onRunAll={handleRunAll}
            onClearOutputs={handleClearOutputs}
            onTriggerAiFix={onTriggerAiFix}
          />

          {/* 4. GPU Banner (GPU: none (CPU only) + REQUEST GPU ACCESS) */}
          <GpuAccessBanner
            currentGpu={notebook.gpu}
            onUpdateGpu={(newGpu) => {
              onUpdateNotebook((prev) => ({ ...prev, gpu: newGpu }));
              onShowToast?.(`GPU configuration updated: ${newGpu}`);
            }}
          />

          {/* 5. Scrollable Cell Canvas */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
            <div className="max-w-4xl mx-auto">
              {notebook.cells.map((cell, idx) => (
                <NotebookCell
                  key={cell.id}
                  cell={cell}
                  cellIndex={idx}
                  isSelected={selectedCellId === cell.id}
                  onSelect={() => setSelectedCellId(cell.id)}
                  onRunCell={handleRunCell}
                  onUpdateSource={handleUpdateSource}
                  onChangeType={handleChangeType}
                  onDeleteCell={handleDeleteCell}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onAskAiToFix={handleAskAiToFixCell}
                  onStopAiStreaming={onStopAiStreaming}
                />
              ))}

              {/* Add Cell Bar at bottom */}
              <AddCellBar onAddCell={handleAddCell} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotebookEditor;
