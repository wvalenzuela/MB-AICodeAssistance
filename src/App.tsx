import React from 'react';
import { 
  FileText, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import { 
  ActiveTab, 
  Message, 
  ProducedFile, 
  SessionStats, 
  WorkspaceMode, 
  ModelOption 
} from './types';
import { 
  INITIAL_MESSAGES, 
  INITIAL_PRODUCED_FILE, 
  INITIAL_STATS 
} from './mockData';
import { 
  Header, 
  MessageBubble, 
  ChatInput, 
  FooterStats, 
  TrajectoryView, 
  FilePreviewModal, 
  SessionLogModal, 
  Sidebar 
} from './components';

interface AppState {
  activeTab: ActiveTab;
  sessionTitle: string;
  messages: Message[];
  stats: SessionStats;
  workspaceMode: WorkspaceMode;
  selectedModel: ModelOption;
  isLoading: boolean;
  isSidebarOpen: boolean;
  selectedFile: ProducedFile | null;
  isSessionLogOpen: boolean;
  toastMessage: string | null;
  isSystemPromptOpen: boolean;
  viewportWidth: number;
}

const TOAST_DURATION_MS = 2400;
const ASSISTANT_RESPONSE_DELAY_MS = 1100;

class App extends React.Component<{}, AppState> {
  chatBottomRef = React.createRef<HTMLDivElement>();

  state: AppState = {
    activeTab: 'chat',
    sessionTitle: 'hi',
    messages: INITIAL_MESSAGES,
    stats: INITIAL_STATS,
    workspaceMode: 'Workspace Write',
    selectedModel: 'qwen3.8-27b-a100-80g',
    isLoading: false,
    isSidebarOpen: false,
    selectedFile: null,
    isSessionLogOpen: false,
    toastMessage: null,
    isSystemPromptOpen: false,
    viewportWidth: typeof window !== 'undefined' ? window.innerWidth : 1024,
  };

  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }

  handleResize = () => {
    this.setState({ viewportWidth: window.innerWidth });
  };

  componentDidUpdate(_prev_props: {}, prev_state: AppState) {
    if (
      this.state.activeTab === 'chat' && 
      (prev_state.messages.length !== this.state.messages.length || prev_state.isLoading !== this.state.isLoading)
    ) {
      this.chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  showToast = (msg: string) => {
    this.setState({ toastMessage: msg });
    setTimeout(() => {
      this.setState({ toastMessage: null });
    }, TOAST_DURATION_MS);
  };

  handleSelectTab = (activeTab: ActiveTab) => {
    this.setState({ activeTab });
  };

  handleUpdateTitle = (sessionTitle: string) => {
    this.setState({ sessionTitle });
  };

  handleToggleSidebar = () => {
    this.setState((prev_state) => ({
      isSidebarOpen: !prev_state.isSidebarOpen,
    }));
  };

  handleCloseSidebar = () => {
    this.setState({ isSidebarOpen: false });
  };

  handleSelectWorkspaceMode = (workspaceMode: WorkspaceMode) => {
    this.setState({ workspaceMode });
  };

  handleSelectModel = (selectedModel: ModelOption) => {
    this.setState({ selectedModel });
  };

  handleOpenSessionLog = () => {
    this.setState({ isSessionLogOpen: true });
  };

  handleCloseSessionLog = () => {
    this.setState({ isSessionLogOpen: false });
  };

  handleSelectFile = (file: ProducedFile) => {
    this.setState({ selectedFile: file });
  };

  handleCloseFilePreview = () => {
    this.setState({ selectedFile: null });
  };

  handleToggleSystemPrompt = () => {
    this.setState((prev_state) => ({
      isSystemPromptOpen: !prev_state.isSystemPromptOpen,
    }));
  };

  handleReact = (message_id: string, reaction: 'up' | 'down') => {
    this.setState((prev_state) => ({
      messages: prev_state.messages.map((msg) => {
        if (msg.id === message_id) {
          const new_reaction = msg.reaction === reaction ? null : reaction;
          return { ...msg, reaction: new_reaction };
        }
        return msg;
      }),
    }));
    this.showToast(
      reaction === 'up' 
        ? 'Feedback recorded: Helpful response 👍' 
        : 'Feedback recorded: Needs improvement 👎'
    );
  };

  handleFork = (message_id: string) => {
    const { messages, sessionTitle } = this.state;
    const target_idx = messages.findIndex((m) => m.id === message_id);
    if (target_idx !== -1) {
      const branched_messages = messages.slice(0, target_idx + 1);
      this.setState({
        messages: branched_messages,
        sessionTitle: `${sessionTitle} (Fork)`,
      });
      this.showToast('Branched conversation from this turn');
    }
  };

  handleSendMessage = (content: string) => {
    const current_date = new Date();
    const time_str = `${current_date.getMonth() + 1}/${current_date.getDate()} ${String(current_date.getHours()).padStart(2, '0')}:${String(current_date.getMinutes()).padStart(2, '0')}`;

    const user_msg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: time_str,
      content,
    };

    this.setState((prev_state) => ({
      messages: [...prev_state.messages, user_msg],
      isLoading: true,
      stats: {
        ...prev_state.stats,
        turns: prev_state.stats.turns + 1,
        steps: prev_state.stats.steps + 2,
      },
    }));

    setTimeout(() => {
      let assistant_msg: Message;
      const lower_content = content.toLowerCase();

      if (lower_content.includes('run') || lower_content.includes('test')) {
        assistant_msg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          timestamp: time_str,
          content: 'Ran successfully. Your folder contains a lot of data',
          toolCallsSummary: '3 tool calls · 1 message',
          statusBadge: 'Stopped',
          duration: 'Ran for 1m 40s',
          toolCalls: [
            {
              id: `tc-${Date.now()}-1`,
              type: 'bash',
              title: 'python3 search_tree.py /Users/waldo/Documents/AnonymousData',
              command: 'python3 search_tree.py /Users/waldo/Documents/AnonymousData',
              output: `Scanning '/Users/waldo/Documents/AnonymousData' for pattern: '*'...\n📁 Dataset_V1/\n📁 Cache/\n├── 📄 search_tree.py (3.4 KB)\nDone scanning: 142 items indexed.`,
              executionTime: '0.65s',
            },
            {
              id: `tc-${Date.now()}-2`,
              type: 'think',
              title: 'Output verified. 142 items indexed without errors. Returning summary to developer.',
              reasoningFull: `### Verification Analysis\nThe script completed with 0 errors and returncode 0.\nIdentified folder structure and verified search pattern filtering.\nFormulating concise response.`,
              isGenerating: false,
            },
          ],
        };
      } else if (lower_content.includes('create') || lower_content.includes('file')) {
        assistant_msg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          timestamp: time_str,
          content: `Done ✅ Created and tested it in your folder:\n\n• File: \`search_tree.py\` at \`/Users/waldo/Documents/AnonymousData/\`\n• Test run ( \`python3 search_tree.py . "*.py"\` ) worked — it found the 1 Python file in the folder.\n\nRun it with:`,
          toolCallsSummary: '2 tool calls',
          codeSnippets: [
            {
              lang: 'bash',
              code: `cd /Users/waldo/Documents/AnonymousData\npython3 search_tree.py .         # list everything\npython3 search_tree.py . "*.py"  # filter by pattern\npython3 search_tree.py . "report" # substring match`,
            },
          ],
          producedFiles: [INITIAL_PRODUCED_FILE],
          usageTokens: 'Usage 48K tok',
          duration: 'Ran for 2m 12s',
          toolCalls: [
            {
              id: `tc-${Date.now()}-1`,
              type: 'think',
              title: 'Analyzing workspace request to create search_tree.py in /Users/waldo/Documents/AnonymousData...',
              reasoningFull: `### Architecture Plan\n- Target directory: /Users/waldo/Documents/AnonymousData\n- Goal: Create tree search script\n- Standard library only: os, sys, fnmatch\n- Handlers: PermissionError, depth recursion limits`,
              isGenerating: false,
            },
            {
              id: `tc-${Date.now()}-2`,
              type: 'write',
              title: 'search_tree.py',
              detail: '/Users/waldo/Documents/AnonymousData/search_tree.py',
              linesAdded: 89,
              linesRemoved: 0,
            },
          ],
        };
      } else {
        assistant_msg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          timestamp: time_str,
          content: `Analysis complete. Inspected your codebase in \`/Users/waldo/Documents/AnonymousData/\`. All syntax checks passed with 0 warnings.`,
          toolCallsSummary: '1 tool call',
          usageTokens: 'Usage 32K tok',
          duration: 'Ran for 45s',
          toolCalls: [
            {
              id: `tc-${Date.now()}-1`,
              type: 'think',
              title: `Processing developer request: "${content}". Checking environment variables and directory permissions.`,
              reasoningFull: `### Reasoning Process\n1. Evaluated developer input: "${content}".\n2. Checked file permissions and AST tree for any syntax or runtime regressions.\n3. Prepared deterministic developer guidance.`,
              isGenerating: false,
            },
          ],
        };
      }

      this.setState((prev_state) => ({
        messages: [...prev_state.messages, assistant_msg],
        isLoading: false,
      }));
    }, ASSISTANT_RESPONSE_DELAY_MS);
  };

  handleQuickAction = (action: string) => {
    if (action === 'run_tests') {
      this.handleSendMessage('run python3 -m unittest discover');
    } else if (action === 'scan_vulnerabilities') {
      this.handleSendMessage('scan repository for secret leaks and vulnerabilities');
    } else if (action === 'profile_runtime') {
      this.handleSendMessage('profile execution time of search_tree.py');
    }
  };

  handleNewSession = () => {
    this.setState({
      messages: INITIAL_MESSAGES.slice(0, 2),
      sessionTitle: 'hi',
    });
    this.showToast('Reset to session start');
  };

  handleTrajectorySelectFile = (file_name: string) => {
    if (file_name === INITIAL_PRODUCED_FILE.name) {
      this.setState({ selectedFile: INITIAL_PRODUCED_FILE });
    }
  };

  render() {
    const { 
      activeTab, 
      sessionTitle, 
      messages, 
      stats, 
      workspaceMode, 
      selectedModel, 
      isLoading, 
      isSidebarOpen, 
      selectedFile, 
      isSessionLogOpen, 
      toastMessage, 
      isSystemPromptOpen 
    } = this.state;

    return (
      <div className="flex flex-col h-screen w-full min-w-0 bg-white text-zinc-900 overflow-hidden font-sans">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/90 text-white text-xs px-3.5 py-1.5 rounded-full shadow-lg border border-zinc-700 animate-in fade-in slide-in-from-top-2 duration-150 font-medium">
            {toastMessage}
          </div>
        )}

        {/* Top Header */}
        <Header
          activeTab={activeTab}
          onSelectTab={this.handleSelectTab}
          sessionTitle={sessionTitle}
          onUpdateTitle={this.handleUpdateTitle}
          onOpenSessionLog={this.handleOpenSessionLog}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={this.handleToggleSidebar}
          workspaceMode={workspaceMode}
          onSelectWorkspaceMode={this.handleSelectWorkspaceMode}
        />

        {/* Main Content Area: Chat messages pass behind top of input and disappear in the middle of the input card */}
        <div className="relative flex-1 min-h-0 flex flex-col w-full min-w-0">
          <main
            className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col w-full min-w-0 ${
              activeTab === 'chat' ? 'mb-[70px]' : ''
            }`}
          >
            {activeTab === 'chat' ? (
              <div className="flex-1 w-full max-w-4xl mx-auto px-3 sm:px-6 pt-4 pb-20 sm:pb-24 flex flex-col min-w-0">
                {/* System prompt trigger button */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={this.handleToggleSystemPrompt}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors py-1 px-2 rounded-md hover:bg-zinc-100 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    <span>System prompt</span>
                    {isSystemPromptOpen ? (
                      <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                  </button>

                  {isSystemPromptOpen && (
                    <div className="mt-2 p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-600 leading-relaxed animate-in fade-in duration-100">
                      <div className="font-semibold text-zinc-800 mb-1">
                        Active System Instructions:
                      </div>
                      You are MB-AICodeAssistance, an expert real-time code assistant for developers. You provide safe code modifications, verify bash executions, and provide step-by-step reasoning. Active workspace directory is set to <code>/Users/waldo/Documents/AnonymousData</code>.
                    </div>
                  )}
                </div>

                {/* Conversation Flow */}
                <div className="space-y-3 flex-1 w-full min-w-0">
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      onReact={this.handleReact}
                      onFork={this.handleFork}
                      onSelectFile={this.handleSelectFile}
                    />
                  ))}

                  {/* Streaming loading indicator */}
                  {isLoading && (
                    <div className="flex items-center gap-2 py-3 text-xs text-zinc-500 font-mono animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                      <span>MB-AICodeAssistance is analyzing code and generating solution...</span>
                    </div>
                  )}

                  <div ref={this.chatBottomRef} />
                </div>
              </div>
            ) : (
              <TrajectoryView
                messages={messages}
                onSelectFile={this.handleTrajectorySelectFile}
              />
            )}
          </main>

          {/* Floating Bottom Input Area: Chat messages pass cleanly behind it */}
          {activeTab === 'chat' && (
            <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none pb-1">
              <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 pointer-events-auto flex flex-col min-w-0">
                {/* Input message card */}
                <ChatInput
                  onSendMessage={this.handleSendMessage}
                  isLoading={isLoading}
                  workspaceMode={workspaceMode}
                  onSelectWorkspaceMode={this.handleSelectWorkspaceMode}
                  selectedModel={selectedModel}
                  onSelectModel={this.handleSelectModel}
                />

                {/* Bottom information bar */}
                <div className="bg-white rounded-b-lg">
                  <FooterStats stats={stats} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={this.handleCloseSidebar}
          producedFiles={[INITIAL_PRODUCED_FILE]}
          onSelectFile={this.handleSelectFile}
          sessionTitle={sessionTitle}
          onNewSession={this.handleNewSession}
          onRunQuickAction={this.handleQuickAction}
        />

        {/* File Preview Modal */}
        <FilePreviewModal
          file={selectedFile}
          onClose={this.handleCloseFilePreview}
        />

        {/* Session Log Modal */}
        <SessionLogModal
          isOpen={isSessionLogOpen}
          onClose={this.handleCloseSessionLog}
          sessionTitle={sessionTitle}
          messages={messages}
          stats={stats}
        />
      </div>
    );
  }
}

export default App;
