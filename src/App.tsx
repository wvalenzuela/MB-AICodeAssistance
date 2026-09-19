import React, { useState, useCallback } from 'react';
import { 
  TopBar, 
  Sidebar, 
  ExplorerBar, 
  MB_AICodeAssistance, 
  NotebookEditor,
  useNotebookAiSimulation,
  type NavItemKey 
} from './components';
import { ProducedFile, NotebookData, ViewLayoutMode } from './types';
import { INITIAL_PRODUCED_FILE } from './mockData';
import { INITIAL_NOTEBOOK } from './mockNotebookData';

const TOAST_DURATION_MS = 2400;

export const App: React.FC = () => {
  // Navigation & Workspace State
  const [isExplorerOpen, setIsExplorerOpen] = useState<boolean>(true);
  const [activeNavItem, setActiveNavItem] = useState<NavItemKey>('tasks');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('waldo.valenzuela.pinilla@gmail.com');
  const [currentUserName, setCurrentUserName] = useState<string>('Waldo Valenzuela');
  const [selectedFile, setSelectedFile] = useState<ProducedFile>(INITIAL_PRODUCED_FILE);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Layout State: Notebook in Middle, AI Code Assistant on Right
  const [viewLayout, setViewLayout] = useState<ViewLayoutMode>('split');
  const [isChatOpen, setIsChatOpen] = useState<boolean>(true);
  const [chatWidth, setChatWidth] = useState<number>(440);

  // Notebook State (Matching Screenshot 1, 2, 3)
  const [notebook, setNotebook] = useState<NotebookData>(INITIAL_NOTEBOOK);

  // Show temporary toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, TOAST_DURATION_MS);
  }, []);

  // AI Simulation Engine: Simulates Chat AI writing code & cells in real-time into the notebook
  const { isAiGenerating, simulateAiWrite, stopStreaming } = useNotebookAiSimulation(
    notebook,
    setNotebook,
    showToast
  );

  const handleToggleExplorer = useCallback(() => {
    setIsExplorerOpen((prev) => !prev);
  }, []);

  // Multi-tab editor workspace state (test.ipynb + Python files like search_tree.py)
  const [openFiles, setOpenFiles] = useState<ProducedFile[]>([INITIAL_PRODUCED_FILE]);
  const [isNotebookOpen, setIsNotebookOpen] = useState<boolean>(true);
  const [activeTabId, setActiveTabId] = useState<string>('notebook');

  const handleSelectTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
    if (tabId === 'notebook') {
      setIsNotebookOpen(true);
      showToast('Switched to test.ipynb');
    } else {
      showToast(`Switched to ${tabId}`);
    }
  }, [showToast]);

  const handleCloseTab = useCallback((tabId: string) => {
    if (tabId === 'notebook') {
      setIsNotebookOpen(false);
      if (activeTabId === 'notebook') {
        if (openFiles.length > 0) {
          setActiveTabId(openFiles[0].name);
        } else {
          setActiveTabId('');
        }
      }
      showToast('Closed test.ipynb');
    } else {
      const remaining = openFiles.filter((f) => f.name !== tabId);
      setOpenFiles(remaining);
      if (activeTabId === tabId) {
        if (isNotebookOpen) {
          setActiveTabId('notebook');
        } else if (remaining.length > 0) {
          setActiveTabId(remaining[0].name);
        } else {
          setActiveTabId('');
        }
      }
      showToast(`Closed ${tabId}`);
    }
  }, [activeTabId, isNotebookOpen, openFiles, showToast]);

  const handleCloseFile = useCallback((fileName: string) => {
    handleCloseTab(fileName);
  }, [handleCloseTab]);

  const handleUpdateFileContent = useCallback((fileName: string, content: string) => {
    setOpenFiles((prev) =>
      prev.map((f) => (f.name === fileName ? { ...f, content } : f))
    );
  }, []);

  const handleCreateNewFile = useCallback(() => {
    const newName = `custom_script_${openFiles.length + 1}.py`;
    const newFile: ProducedFile = {
      name: newName,
      path: `/${newName}`,
      size: '1.2 KB',
      language: 'python',
      content: `# Medical-Blocks Automated Workspace\n# Script: ${newName}\n\nimport os\nimport sys\nimport numpy as np\n\ndef main():\n    print("Executing Medical-Blocks clinical workflow in ${newName}")\n\nif __name__ == '__main__':\n    main()\n`,
    };
    setOpenFiles((prev) => [...prev, newFile]);
    setActiveTabId(newName);
    showToast(`Created and opened ${newName}`);
  }, [openFiles.length, showToast]);

  const handleSelectNavItem = useCallback((item: NavItemKey) => {
    setActiveNavItem(item);
    if (item === 'tasks' || item === 'code') {
      setIsExplorerOpen(true);
    } else {
      showToast(`Switched view to ${item}`);
    }
  }, [showToast]);

  const handleSelectFile = useCallback((fileOrName: ProducedFile | string) => {
    const fileName = typeof fileOrName === 'string' ? fileOrName : fileOrName.name;
    const fileObj: ProducedFile = typeof fileOrName === 'string' 
      ? (openFiles.find((f) => f.name === fileName) || {
          name: fileName,
          path: `/workspace/${fileName}`,
          size: '3.4 KB',
          language: (fileName.endsWith('.sh') ? 'bash' : fileName.endsWith('.json') ? 'json' : 'python') as any,
          content: fileName === 'search_tree.py' ? INITIAL_PRODUCED_FILE.content : `# Medical-Blocks Automated Workspace\n# File: ${fileName}\n\nimport os\nimport sys\n\ndef run():\n    print("Executing Medical-Blocks clinical workflow in ${fileName}")\n\nif __name__ == '__main__':\n    run()\n`,
        })
      : fileOrName;

    setSelectedFile(fileObj);

    // If selecting a notebook file (.ipynb), switch to notebook tab
    if (fileName.endsWith('.ipynb')) {
      const baseName = fileName.replace('.ipynb', '');
      setNotebook((prev) => ({
        ...prev,
        title: baseName,
        path: `home > ${baseName}`,
      }));
      setActiveTabId('notebook');
      showToast(`Loaded notebook: ${fileName}`);
    } else {
      // Add Python script to open files if not present, and switch tab
      setOpenFiles((prev) => {
        if (!prev.some((f) => f.name === fileObj.name)) {
          return [...prev, fileObj];
        }
        return prev;
      });
      setActiveTabId(fileObj.name);
      showToast(`Switched to Python code: ${fileObj.name}`);
    }
  }, [openFiles, showToast]);

  const handleLoginSuccess = useCallback((email: string, displayName: string) => {
    setCurrentUserEmail(email);
    setCurrentUserName(displayName);
    showToast(`Authenticated as ${displayName}`);
  }, [showToast]);

  const handleTriggerAiFix = useCallback(() => {
    simulateAiWrite({
      prompt: "Fix the ROOT error in Cell 13 of the notebook",
      targetCellId: "cell-13-code",
    });
  }, [simulateAiWrite]);

  const currentActiveFileName = activeTabId === 'notebook' 
    ? (notebook.title.endsWith('.ipynb') ? notebook.title : `${notebook.title}.ipynb`)
    : activeTabId;

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f4f7f9] select-none text-zinc-800 font-sans">
      {/* ========================================================================= */}
      {/* 1. TOPBAR */}
      {/* ========================================================================= */}
      <TopBar
        onToggleNav={() => setIsExplorerOpen((prev) => !prev)}
        currentUserEmail={currentUserEmail}
        currentUserName={currentUserName}
        activeFileName={currentActiveFileName}
        onLoginSuccess={handleLoginSuccess}
        onShowToast={showToast}
      />

      {/* Main Work Area: Sidebar + ExplorerBar + Middle Notebook + Right AI Chat */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden pt-2 sm:pt-2.5 bg-[#f0f4f8]">
        
        {/* ========================================================================= */}
        {/* 2. SIDEBAR (Navigation Rail on the left) */}
        {/* ========================================================================= */}
        <Sidebar
          activeItem={activeNavItem}
          onSelectItem={handleSelectNavItem}
          onOpenSettings={() => showToast('Medical-Blocks Settings & Preferences')}
        />

        {/* ========================================================================= */}
        {/* 3. EXPLORERBAR (Explorer with Home, Mounts, Shared, MB-DATA with lock icons) */}
        {/* ========================================================================= */}
        {isExplorerOpen && (
          <div className="h-full rounded-t-lg overflow-hidden border-t border-zinc-200/90 shadow-2xs  pt-[12px]">
            <ExplorerBar
              isOpen={isExplorerOpen}
              onClose={() => setIsExplorerOpen(false)}
              onSelectFile={handleSelectFile}
              producedFiles={openFiles}
              onShowToast={showToast}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. WORKBENCH CONTAINER (Notebook Editor in Middle + AI Assistant on Right) */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-row min-h-0 min-w-0 relative overflow-hidden bg-white rounded-t-lg border-t border-zinc-200/90 shadow-2xs">
          
          {/* Middle: Full Functional Python Notebook Editor (Always directly next to Explorer) */}
          <div className="flex-1 min-w-[360px] h-full flex flex-col overflow-hidden bg-white">
            <NotebookEditor
              notebook={notebook}
              onUpdateNotebook={setNotebook}
              isAiGenerating={isAiGenerating}
              onStopAiStreaming={stopStreaming}
              onTriggerAiFix={handleTriggerAiFix}
              isExplorerOpen={isExplorerOpen}
              onToggleExplorer={handleToggleExplorer}
              isSplitView={isChatOpen}
              onToggleSplitView={() => setIsChatOpen((prev) => !prev)}
              onToggleChat={() => setIsChatOpen((prev) => !prev)}
              isChatOpen={isChatOpen}
              onShowToast={showToast}
              activeTab={activeTabId}
              onSelectTab={handleSelectTab}
              openFiles={openFiles}
              onCloseFile={handleCloseFile}
              isNotebookOpen={isNotebookOpen}
              onCloseTab={handleCloseTab}
              onUpdateFileContent={handleUpdateFileContent}
              onCreateNewFile={handleCreateNewFile}
            />
          </div>

          {/* Resizer Handle between Middle Notebook and Right AI Assistant */}
          {isChatOpen && (
            <div
              className="w-1 hover:w-1.5 bg-zinc-200 hover:bg-sky-500 cursor-col-resize transition-all shrink-0 z-10 select-none"
              title="Drag to resize AI Assistant"
              onMouseDown={(e) => {
                const startX = e.clientX;
                const startWidth = chatWidth;
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const delta = startX - moveEvent.clientX;
                  const newWidth = Math.max(340, Math.min(750, startWidth + delta));
                  setChatWidth(newWidth);
                };
                const handleMouseUp = () => {
                  window.removeEventListener('mousemove', handleMouseMove);
                  window.removeEventListener('mouseup', handleMouseUp);
                };
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
              }}
            />
          )}

          {/* Right: MB-AICodeAssistance (AI Chat & Simulated Code Writer) */}
          {isChatOpen && (
            <div 
              style={{ width: `${chatWidth}px` }}
              className="shrink-0 h-full flex flex-col border-l border-zinc-200/90 bg-white relative overflow-hidden shadow-xs pt-[12px]"
            >
              <MB_AICodeAssistance
                onSelectFile={handleSelectFile}
                onShowToast={showToast}
                notebook={notebook}
                onTriggerNotebookAiWrite={(prompt, targetCellId, onComplete) => {
                  simulateAiWrite({ prompt, targetCellId, onComplete });
                }}
                isAiGeneratingNotebook={isAiGenerating}
                onCloseChat={() => setIsChatOpen(false)}
              />
            </div>
          )}

          {/* Floating Reopen AI Chat Pill (when chat is hidden in notebook mode) */}
          {!isChatOpen && (
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              className="fixed bottom-5 right-6 z-40 bg-[#00486b] hover:bg-[#003854] text-white text-xs font-medium py-2 px-3.5 rounded-full shadow-lg border border-sky-400/30 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
              title="Open Medical-Blocks AI Assistant"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI Code Assistant</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-14 right-6 z-[99999] bg-zinc-900 text-white text-xs py-2 px-3.5 rounded-lg shadow-xl border border-zinc-700 animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
