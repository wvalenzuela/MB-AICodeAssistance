import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  ChevronDown, 
  Download, 
  PanelLeft, 
  PanelLeftClose, 
  FileCode2, 
  TerminalSquare, 
  Workflow,
  FileText
} from 'lucide-react';
import { 
  ActiveTab, 
  Message, 
  ProducedFile, 
  SessionStats, 
  WorkspaceMode, 
  ModelOption,
  TerminalPosition 
} from '../../types';
import { 
  INITIAL_MESSAGES, 
  INITIAL_PRODUCED_FILE, 
  INITIAL_STATS,
  TURN_3_RESPONSE,
  TURN_4_RESPONSE
} from '../../mockData';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import FooterStats from './FooterStats';
import TrajectoryView from './TrajectoryView';
import FilePreviewModal from './FilePreviewModal';
import SessionLogModal from './SessionLogModal';
import { TerminalDock } from './TerminalDock';
import { WorkflowPanel } from './WorkflowPanel';

export interface MBAICodeAssistanceProps {
  className?: string;
  isExplorerOpen?: boolean;
  onToggleExplorer?: () => void;
  onSelectFile?: (file: ProducedFile) => void;
  onShowToast?: (message: string) => void;
  defaultSessionTitle?: string;
}

const ASSISTANT_RESPONSE_DELAY_MS = 1100;

export const MBAICodeAssistance: React.FC<MBAICodeAssistanceProps> = ({
  className = '',
  isExplorerOpen = true,
  onToggleExplorer,
  onSelectFile,
  onShowToast,
  defaultSessionTitle = 'hi',
}) => {
  // Session state
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [sessionTitle, setSessionTitle] = useState<string>(defaultSessionTitle);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [tempTitle, setTempTitle] = useState<string>(defaultSessionTitle);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>('Workspace Write');
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<ModelOption>('qwen3.8-27b-a100-80g');

  // Messages & execution
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [stats, setStats] = useState<SessionStats>(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [producedFiles, setProducedFiles] = useState<ProducedFile[]>([INITIAL_PRODUCED_FILE]);

  // Panels & Modals
  const [isWorkflowPanelOpen, setIsWorkflowPanelOpen] = useState<boolean>(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const [terminalPosition, setTerminalPosition] = useState<TerminalPosition>('bottom');
  const [selectedPreviewFile, setSelectedPreviewFile] = useState<ProducedFile | null>(null);
  const [isSessionLogOpen, setIsSessionLogOpen] = useState<boolean>(false);
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState<boolean>(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat on message change
  useEffect(() => {
    if (activeTab === 'chat') {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

  // Handle outside click for mode dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isModeDropdownOpen &&
        modeDropdownRef.current &&
        !modeDropdownRef.current.contains(e.target as Node)
      ) {
        setIsModeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModeDropdownOpen]);

  const handleTitleSubmit = () => {
    const trimmed = tempTitle.trim();
    if (trimmed) {
      setSessionTitle(trimmed);
    } else {
      setTempTitle(sessionTitle);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setTempTitle(sessionTitle);
      setIsEditingTitle(false);
    }
  };

  const handleSendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate Agent Thinking and Response
    setTimeout(() => {
      const lower = trimmed.toLowerCase();
      const isSearchTreeCreation = lower.includes('create') || lower.includes('file');
      const isRunRequest = lower.includes('run');

      let assistantMessage: Message;

      if (isSearchTreeCreation && !messages.some(m => m.id === 'msg-6')) {
        assistantMessage = {
          ...TURN_3_RESPONSE,
          id: `msg-${Date.now() + 1}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setProducedFiles((prev) => {
          if (prev.some(f => f.name === INITIAL_PRODUCED_FILE.name)) return prev;
          return [...prev, INITIAL_PRODUCED_FILE];
        });
        onShowToast?.(`Generated file: ${INITIAL_PRODUCED_FILE.name}`);
      } else if (isRunRequest && !messages.some(m => m.id === 'msg-8')) {
        assistantMessage = {
          ...TURN_4_RESPONSE,
          id: `msg-${Date.now() + 1}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      } else {
        const isFileCreation = lower.includes('file') || lower.includes('script');
        let newFile: ProducedFile | undefined;

        if (isFileCreation) {
          newFile = {
            name: 'clinical_cohort_filter.py',
            path: '/workspace/clinical_cohort_filter.py',
            size: '2.8 KB',
            language: 'python',
            content: `# Medical-Blocks Cohort Filter\nimport pandas as pd\nimport numpy as np\n\ndef filter_cohort(df):\n    return df[df['age'] >= 18]\n`,
          };
          setProducedFiles((prev) => [...prev, newFile!]);
          onShowToast?.(`Generated file: ${newFile.name}`);
        }

        assistantMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          content: `I have processed your instruction: "${trimmed}". ${
            isFileCreation 
              ? 'Created script and validated cluster execution permissions in the MB-DATA partition.' 
              : 'Analyzing clinical parameters and running automated lint checks on the workspace.'
          }`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          duration: '1.2s',
          usageTokens: 'Usage 412 tok',
        };
      }

      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
      setStats((prev) => ({
        ...prev,
        turns: prev.turns + 1,
        steps: prev.steps + 2,
      }));
    }, ASSISTANT_RESPONSE_DELAY_MS);
  };

  const handleSelectFileInternal = (file: ProducedFile) => {
    setSelectedPreviewFile(file);
    onSelectFile?.(file);
  };

  const handleStartNewSession = () => {
    setSessionTitle('New Session');
    setTempTitle('New Session');
    setMessages([
      {
        id: 'init-msg',
        sender: 'assistant',
        content: 'Hello! I am your Medical-Blocks AI Coding Agent. How can I assist with your clinical datasets, algorithms, or DICOM pipelines today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);
    onShowToast?.('Started fresh session');
  };

  const handleRunWorkflowAction = (actionName: string) => {
    onShowToast?.(`Triggered: ${actionName}`);
    if (actionName === 'Inspect Environment') {
      setIsTerminalOpen(true);
    }
  };

  return (
    <div className={`flex-1 min-w-0 h-full flex flex-col relative bg-white overflow-hidden ${className}`}>
      {/* Sub-Header / Workbench Bar */}
      <div className="h-11 border-b border-zinc-200/90 bg-white px-3 sm:px-4 flex items-center justify-between shrink-0 select-none z-10 gap-2">
        
        {/* Left: Explorer Toggle & Session Title & Mode */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {onToggleExplorer && (
            <button
              type="button"
              onClick={onToggleExplorer}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                isExplorerOpen
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                  : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
              title={isExplorerOpen ? 'Hide Explorer' : 'Show Explorer'}
              aria-label="Toggle Explorer"
            >
              {isExplorerOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeft className="w-4 h-4" />
              )}
            </button>
          )}

          {/* Session Title (Editable) */}
          {isEditingTitle ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="text-sm font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-blue-500 focus:outline-hidden min-w-0 max-w-xs"
            />
          ) : (
            <div
              onClick={() => {
                setIsEditingTitle(true);
                setTempTitle(sessionTitle);
              }}
              className="group flex items-center gap-1.5 cursor-pointer py-0.5 px-1 rounded-md hover:bg-zinc-100/80 transition-colors min-w-0 shrink"
              title="Click to rename session"
            >
              <h1 className="text-sm sm:text-base font-semibold text-zinc-900 tracking-tight truncate max-w-[140px] sm:max-w-xs">
                {sessionTitle}
              </h1>
              <span className="text-xs text-zinc-400 group-hover:text-zinc-600 shrink-0">✎</span>
            </div>
          )}

          {/* Workspace Mode Dropdown */}
          <div ref={modeDropdownRef} className="relative shrink-0 hidden xs:block">
            <button
              type="button"
              onClick={() => setIsModeDropdownOpen(!isModeDropdownOpen)}
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200/70 py-1 px-2.5 rounded-full transition-colors border border-zinc-200/70 font-medium cursor-pointer shrink-0 select-none whitespace-nowrap"
            >
              {workspaceMode === 'Workspace Write' ? (
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              ) : (
                <FileCode2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              )}
              <span className="truncate max-w-[110px] sm:max-w-none">{workspaceMode}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
            </button>

            {isModeDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-zinc-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 font-semibold text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-100">
                  Execution Mode
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWorkspaceMode('Workspace Write');
                    setIsModeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-zinc-50 cursor-pointer ${
                    workspaceMode === 'Workspace Write' ? 'font-medium text-zinc-900 bg-zinc-50/60' : 'text-zinc-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <div>
                    <div>Workspace Write</div>
                    <div className="text-[10px] text-zinc-400">Can create, edit, & execute scripts</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWorkspaceMode('Workspace Read-Only');
                    setIsModeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-zinc-50 cursor-pointer ${
                    workspaceMode === 'Workspace Read-Only' ? 'font-medium text-zinc-900 bg-zinc-50/60' : 'text-zinc-600'
                  }`}
                >
                  <FileCode2 className="w-3.5 h-3.5 text-zinc-400" />
                  <div>
                    <div>Workspace Read-Only</div>
                    <div className="text-[10px] text-zinc-400">Restricted inspection without writes</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWorkspaceMode('Isolated Sandbox');
                    setIsModeDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-zinc-50 cursor-pointer ${
                    workspaceMode === 'Isolated Sandbox' ? 'font-medium text-zinc-900 bg-zinc-50/60' : 'text-zinc-600'
                  }`}
                >
                  <TerminalSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <div>
                    <div>Isolated Sandbox</div>
                    <div className="text-[10px] text-zinc-400">Interactive CLI execution container</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center: Chat vs Trajectory Switcher */}
        <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/70 text-xs shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 rounded-md font-medium transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trajectory')}
            className={`px-3 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'trajectory'
                ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span>Trajectory</span>
            <span className="text-[10px] px-1 py-0.1 rounded-full bg-blue-50 text-blue-700 font-mono border border-blue-200/60">
              Live
            </span>
          </button>
        </div>

        {/* Right: Actions (Session Log & Workflow Tools toggle) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Download / Session Log */}
          <button
            type="button"
            onClick={() => setIsSessionLogOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1 text-xs text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            title="Download & View Full Session Log"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden md:inline">Session Log</span>
          </button>

          {/* Workflow & Tools Panel Toggle Button (Image 2) */}
          <button
            type="button"
            onClick={() => setIsWorkflowPanelOpen(!isWorkflowPanelOpen)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isWorkflowPanelOpen
                ? 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd] shadow-2xs'
                : 'bg-white text-zinc-700 hover:text-zinc-950 hover:bg-zinc-50 border-zinc-200'
            }`}
            title="Toggle Workflow & Tools Panel"
          >
            <Workflow className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Workflow Panel</span>
          </button>
        </div>
      </div>

      {/* Main Content Area + Slide-in Workflow Panel */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        
        {/* Left / Center: Chat or Trajectory view with Dockable Terminal */}
        <div 
          className={`flex-1 min-h-0 min-w-0 relative overflow-hidden bg-white ${
            terminalPosition === 'left' || terminalPosition === 'right'
              ? 'flex flex-row'
              : 'flex flex-col'
          }`}
        >
          {/* Main content area: Chat or Trajectory view */}
          <div 
            className={`flex-1 min-w-0 min-h-0 relative overflow-hidden flex flex-col ${
              terminalPosition === 'top' || terminalPosition === 'left'
                ? 'order-2'
                : 'order-1'
            }`}
          >
            {activeTab === 'chat' ? (
              <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Message scroll list with fading mask at the middle of the input chat */}
                <div 
                  id="message-list"
                  className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 pb-52 scroll-smooth"
                  style={{
                    maskImage: 'linear-gradient(to bottom, black 0%, black calc(100% - 150px), transparent calc(100% - 65px))',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black calc(100% - 150px), transparent calc(100% - 65px))'
                  }}
                >
                  <div className="max-w-4xl xl:max-w-5xl mx-auto space-y-6">
                    {/* Collapsible System Prompt (matching UI in screenshot) */}
                    <div className="flex flex-col items-start select-none">
                      <button
                        type="button"
                        onClick={() => setIsSystemPromptOpen(!isSystemPromptOpen)}
                        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 py-1 px-2 -ml-2 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-medium">System prompt</span>
                        <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isSystemPromptOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {isSystemPromptOpen && (
                        <div className="mt-2 p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs text-zinc-600 font-mono leading-relaxed max-w-2xl animate-in fade-in zoom-in-95 duration-100">
                          <div className="font-semibold text-zinc-800 mb-1 font-sans">Medical-Blocks AI Assistant Instructions:</div>
                          You are Medical-Blocks AI Code Assistant, an expert biomedical and clinical data engineer embedded within the Medical-Blocks workstation environment. You have full read-write execution privileges in the current workspace (/Users/waldo/Documents/AnonymousData) and access to clinical datasets, DICOM pipelines, and container execution clusters.
                        </div>
                      )}
                    </div>

                    {messages.map((msg, index) => {
                      const isStartOfNewSection = index > 0 && msg.sender === 'user';
                      return (
                        <React.Fragment key={msg.id}>
                          {isStartOfNewSection && (
                            <div className="w-full my-5">
                              <hr className="w-full border-0 border-t border-zinc-200" />
                            </div>
                          )}
                          <MessageBubble
                            message={msg}
                            onSelectFile={handleSelectFileInternal}
                          />
                        </React.Fragment>
                      );
                    })}
                    {isLoading && (
                      <div className="flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-200/80 rounded-2xl animate-pulse text-xs text-zinc-600 max-w-md">
                        <div className="w-4 h-4 rounded-full border-2 border-[#00486b] border-t-transparent animate-spin" />
                        <span>Medical-Blocks AI Assistant is running task & analyzing codebase...</span>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>
                </div>

                {/* Floating Bottom Prompt Bar with solid/fade background occluding scrolled messages */}
                <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
                  {/* Backdrop gradient starting at the middle of the input chat and fading to solid white */}
                  <div className="absolute inset-0 -top-8 bg-gradient-to-t from-white via-white/95 to-transparent pointer-events-none" />
                  <div className="relative max-w-4xl xl:max-w-5xl mx-auto px-3 sm:px-4 pointer-events-auto pb-2">
                    <ChatInput
                      onSendMessage={handleSendMessage}
                      isLoading={isLoading}
                      workspaceMode={workspaceMode}
                      onSelectWorkspaceMode={setWorkspaceMode}
                      selectedModel={selectedModel}
                      onSelectModel={setSelectedModel}
                    />
                    <FooterStats stats={stats} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-zinc-50/50">
                <div className="max-w-4xl xl:max-w-5xl mx-auto">
                  <TrajectoryView messages={messages} />
                </div>
              </div>
            )}
          </div>

          {/* Dockable Terminal (Bottom, Top, Left, Right) */}
          <TerminalDock
            isOpen={isTerminalOpen}
            onToggle={() => setIsTerminalOpen(!isTerminalOpen)}
            position={terminalPosition}
            onChangePosition={setTerminalPosition}
          />
        </div>

        {/* Right: Workflow Panel ("Workspace & Tools" matching Image 2) */}
        {isWorkflowPanelOpen && (
          <WorkflowPanel
            isOpen={isWorkflowPanelOpen}
            onClose={() => setIsWorkflowPanelOpen(false)}
            activeSessionTitle={sessionTitle}
            producedFiles={producedFiles}
            onSelectFile={handleSelectFileInternal}
            onStartNewSession={handleStartNewSession}
            onRunAction={handleRunWorkflowAction}
            onSelectRecentSession={(title) => {
              setSessionTitle(title);
              setTempTitle(title);
              onShowToast?.(`Loaded session: ${title}`);
            }}
          />
        )}
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        file={selectedPreviewFile}
        onClose={() => setSelectedPreviewFile(null)}
      />

      {/* Session Log Modal */}
      <SessionLogModal
        isOpen={isSessionLogOpen}
        onClose={() => setIsSessionLogOpen(false)}
        sessionTitle={sessionTitle}
        messages={messages}
        stats={stats}
      />
    </div>
  );
};

export default MBAICodeAssistance;
