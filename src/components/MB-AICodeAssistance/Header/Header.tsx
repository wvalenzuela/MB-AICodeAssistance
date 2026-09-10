import React from 'react';
import { 
  Sparkles, 
  ChevronDown, 
  Download, 
  PanelLeft, 
  PanelLeftClose,
  Menu,
  FileCode2,
  TerminalSquare
} from 'lucide-react';
import { ActiveTab, WorkspaceMode } from '../../../types';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  sessionTitle: string;
  onUpdateTitle: (title: string) => void;
  onOpenSessionLog: () => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  workspaceMode: WorkspaceMode;
  onSelectWorkspaceMode: (mode: WorkspaceMode) => void;
}

interface HeaderState {
  is_editing_title: boolean;
  temp_title: string;
  is_mode_dropdown_open: boolean;
}

class Header extends React.Component<HeaderProps, HeaderState> {
  modeDropdownRef = React.createRef<HTMLDivElement>();

  constructor(props: HeaderProps) {
    super(props);
    this.state = {
      is_editing_title: false,
      temp_title: props.sessionTitle,
      is_mode_dropdown_open: false,
    };
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
    document.addEventListener('keydown', this.handleGlobalKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleGlobalKeyDown);
  }

  handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    if (
      this.state.is_mode_dropdown_open &&
      this.modeDropdownRef.current &&
      !this.modeDropdownRef.current.contains(target)
    ) {
      this.setState({ is_mode_dropdown_open: false });
    }
  };

  handleGlobalKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.state.is_mode_dropdown_open) {
      this.setState({ is_mode_dropdown_open: false });
    }
  };

  handleStartEditingTitle = () => {
    this.setState({
      is_editing_title: true,
      temp_title: this.props.sessionTitle,
    });
  };

  handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ temp_title: e.target.value });
  };

  handleTitleSubmit = () => {
    const { temp_title } = this.state;
    const { sessionTitle, onUpdateTitle } = this.props;

    const trimmed_title = temp_title.trim();
    if (trimmed_title) {
      onUpdateTitle(trimmed_title);
    } else {
      this.setState({ temp_title: sessionTitle });
    }
    this.setState({ is_editing_title: false });
  };

  handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      this.handleTitleSubmit();
    } else if (e.key === 'Escape') {
      this.setState({
        temp_title: this.props.sessionTitle,
        is_editing_title: false,
      });
    }
  };

  handleToggleModeDropdown = () => {
    this.setState((prev_state) => ({
      is_mode_dropdown_open: !prev_state.is_mode_dropdown_open,
    }));
  };

  handleSelectWorkspaceMode = (mode: WorkspaceMode) => () => {
    this.props.onSelectWorkspaceMode(mode);
    this.setState({ is_mode_dropdown_open: false });
  };

  handleSelectChatTab = () => {
    this.props.onSelectTab('chat');
  };

  handleSelectTrajectoryTab = () => {
    this.props.onSelectTab('trajectory');
  };

  handleToggleSidebar = () => {
    this.props.onToggleSidebar();
  };

  handleOpenSessionLog = () => {
    this.props.onOpenSessionLog();
  };

  render() {
    const { 
      activeTab, 
      sessionTitle, 
      isSidebarOpen, 
      workspaceMode 
    } = this.props;
    const { is_editing_title, temp_title, is_mode_dropdown_open } = this.state;

    return (
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-200/80 px-3 sm:px-6 pt-3 pb-0 w-full min-w-0">
        <div className="flex items-center justify-between gap-2 sm:gap-3 w-full min-w-0">
          {/* Left: Title & Mode */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={this.handleToggleSidebar}
              className="md:hidden p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-md transition-colors cursor-pointer shrink-0"
              title="Toggle Sessions Menu"
              aria-label="Toggle Sessions Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Editable Title */}
            {is_editing_title ? (
              <input
                type="text"
                value={temp_title}
                onChange={this.handleTitleChange}
                onBlur={this.handleTitleSubmit}
                onKeyDown={this.handleTitleKeyDown}
                autoFocus
                className="text-base sm:text-lg font-semibold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-blue-500 focus:outline-hidden min-w-0 max-w-xs"
              />
            ) : (
              <div
                onClick={this.handleStartEditingTitle}
                className="group flex items-center gap-1.5 cursor-pointer py-0.5 px-1 rounded-md hover:bg-zinc-100/80 transition-colors min-w-0 shrink"
                title="Click to rename session"
              >
                <h1 className="text-base sm:text-lg font-semibold text-zinc-900 tracking-tight truncate max-w-[105px] xs:max-w-[180px] sm:max-w-md">
                  {sessionTitle}
                </h1>
                <span className="text-xs text-zinc-400 group-hover:text-zinc-600 shrink-0">✎</span>
              </div>
            )}

            {/* Mode badge pill selector */}
            <div ref={this.modeDropdownRef} className="relative shrink-0">
              <button
                type="button"
                onClick={this.handleToggleModeDropdown}
                className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 bg-zinc-100/80 hover:bg-zinc-200/70 py-1 px-2 sm:px-2.5 rounded-full transition-colors border border-zinc-200/60 font-medium cursor-pointer shrink-0 select-none whitespace-nowrap"
              >
                {workspaceMode === 'Workspace Write' ? (
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                ) : (
                  <FileCode2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                )}
                <span className="truncate max-w-[90px] xs:max-w-[130px] sm:max-w-none">{workspaceMode}</span>
                <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
              </button>

              {is_mode_dropdown_open && (
                <div className="absolute left-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-zinc-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 font-semibold text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-100">
                    Execution Mode
                  </div>
                  <button
                    type="button"
                    onClick={this.handleSelectWorkspaceMode('Workspace Write')}
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
                    onClick={this.handleSelectWorkspaceMode('Workspace Read-Only')}
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
                    onClick={this.handleSelectWorkspaceMode('Isolated Sandbox')}
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

          {/* Right: Actions & Workspace toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View Session Log */}
            <button
              type="button"
              onClick={this.handleOpenSessionLog}
              className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 py-1 px-2.5 rounded-lg transition-colors cursor-pointer"
              title="Download & View Full Session Log"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Session Log</span>
            </button>

            {/* Workspace Explorer Toggle */}
            <button
              type="button"
              onClick={this.handleToggleSidebar}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isSidebarOpen
                  ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                  : 'bg-white border-zinc-200/80 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
              title="Toggle Workspace Explorer"
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeft className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Bottom Tab Bar (Chat vs Trajectory) */}
        <div className="flex items-center gap-6 mt-2 border-b border-transparent">
          <button
            type="button"
            onClick={this.handleSelectChatTab}
            className={`pb-2 text-xs font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Chat
          </button>
          <button
            type="button"
            onClick={this.handleSelectTrajectoryTab}
            className={`pb-2 text-xs font-medium border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'trajectory'
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <span>Trajectory</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 font-mono border border-blue-200/60">
              Live
            </span>
          </button>
        </div>
      </header>
    );
  }
}

export default Header;
