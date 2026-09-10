// ============================================================================
// 4-COMPONENT ARCHITECTURE
// 1. TopBar (Clinical workstation header, user profile, auth, location)
// 2. Sidebar (Medical-Blocks navigation rail)
// 3. ExplorerBar (Workspace filesystem, clusters, MB-DATA)
// 4. MB-AICodeAssistance (Independent AI assistant workbench & tools)
// ============================================================================

export { TopBar, LoginModal, type TopBarProps, type LoginCredentials } from './TopBar';
export { Sidebar, type SidebarProps, type NavItemKey } from './Sidebar';
export { ExplorerBar, type ExplorerBarProps } from './ExplorerBar';
export { 
  MBAICodeAssistance, 
  MB_AICodeAssistance, 
  WorkflowPanel, 
  type MBAICodeAssistanceProps 
} from './MB-AICodeAssistance';

// Sub-components re-exported from their parent modules
export { 
  ChatInput, 
  MessageBubble, 
  TrajectoryView, 
  FooterStats, 
  FilePreviewModal, 
  SessionLogModal, 
  TerminalDock 
} from './MB-AICodeAssistance';
