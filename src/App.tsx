import React from 'react';
import { 
  TopBar, 
  Sidebar, 
  ExplorerBar, 
  MB_AICodeAssistance, 
  type NavItemKey 
} from './components';
import { ProducedFile } from './types';
import { INITIAL_PRODUCED_FILE } from './mockData';

interface AppState {
  isExplorerOpen: boolean;
  activeNavItem: NavItemKey;
  currentUserEmail: string;
  currentUserName: string;
  selectedFile: ProducedFile | null;
  toastMessage: string | null;
}

const TOAST_DURATION_MS = 2400;

class App extends React.Component<{}, AppState> {
  state: AppState = {
    isExplorerOpen: true,
    activeNavItem: 'tasks',
    currentUserEmail: 'waldo.valenzuela.pinilla@gmail.com',
    currentUserName: 'Waldo Valenzuela',
    selectedFile: INITIAL_PRODUCED_FILE,
    toastMessage: null,
  };

  showToast = (msg: string) => {
    this.setState({ toastMessage: msg });
    setTimeout(() => {
      this.setState({ toastMessage: null });
    }, TOAST_DURATION_MS);
  };

  handleToggleExplorer = () => {
    this.setState((prev) => ({ isExplorerOpen: !prev.isExplorerOpen }));
  };

  handleSelectNavItem = (item: NavItemKey) => {
    this.setState({ activeNavItem: item });
    if (item === 'tasks' || item === 'code') {
      this.setState({ isExplorerOpen: true });
    } else {
      this.showToast(`Switched view to ${item}`);
    }
  };

  handleSelectFile = (file: ProducedFile) => {
    this.setState({ selectedFile: file });
    this.showToast(`Opened: ${file.name}`);
  };

  handleLoginSuccess = (email: string, displayName: string) => {
    this.setState({
      currentUserEmail: email,
      currentUserName: displayName,
    });
    this.showToast(`Authenticated as ${displayName}`);
  };

  render() {
    const { 
      isExplorerOpen, 
      activeNavItem, 
      currentUserEmail, 
      currentUserName,
      toastMessage 
    } = this.state;

    return (
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f4f7f9] select-none text-zinc-800 font-sans">
        {/* ========================================================================= */}
        {/* 1. TOPBAR */}
        {/* ========================================================================= */}
        <TopBar
          currentUserEmail={currentUserEmail}
          currentUserName={currentUserName}
          onLoginSuccess={this.handleLoginSuccess}
          onShowToast={this.showToast}
        />

        {/* Main Work Area: Sidebar + ExplorerBar + MB-AICodeAssistance */}
        <div className="flex-1 flex min-h-0 relative overflow-hidden">
          
          {/* ========================================================================= */}
          {/* 2. SIDEBAR (Navigation Rail on the left) */}
          {/* ========================================================================= */}
          <Sidebar
            activeItem={activeNavItem}
            onSelectItem={this.handleSelectNavItem}
            onOpenSettings={() => this.showToast('Medical-Blocks Settings & Preferences')}
          />

          {/* ========================================================================= */}
          {/* 3. EXPLORERBAR (Explorer with Home, Mounts, Shared, MB-DATA with lock icons) */}
          {/* ========================================================================= */}
          {isExplorerOpen && (
            <ExplorerBar
              isOpen={isExplorerOpen}
              onClose={() => this.setState({ isExplorerOpen: false })}
              onSelectFile={this.handleSelectFile}
              onShowToast={this.showToast}
            />
          )}

          {/* ========================================================================= */}
          {/* 4. MB-AICODEASSISTANCE (Independent AI Code Assistant Workbench) */}
          {/* ========================================================================= */}
          <MB_AICodeAssistance
            isExplorerOpen={isExplorerOpen}
            onToggleExplorer={this.handleToggleExplorer}
            onSelectFile={this.handleSelectFile}
            onShowToast={this.showToast}
          />
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
  }
}

export default App;
