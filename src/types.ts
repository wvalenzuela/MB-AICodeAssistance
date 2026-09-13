export type ToolType = 'think' | 'write' | 'bash' | 'read' | 'grep' | 'search';

export interface ToolCallItem {
  id: string;
  type: ToolType;
  title: string;
  detail?: string;
  linesAdded?: number;
  linesRemoved?: number;
  reasoningFull?: string;
  isGenerating?: boolean;
  output?: string;
  command?: string;
  executionTime?: string;
}

export interface ProducedFile {
  name: string;
  path: string;
  content?: string;
  size?: string;
  language?: string;
}

export interface CodeSnippet {
  lang: string;
  code: string;
}

export interface TurnUsageDetails {
  totalTokens: string;
  model: string;
  uncachedInput: string;
  output: string;
}

export interface TurnTimeDetails {
  totalRunTime: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  content: string;
  toolCalls?: ToolCallItem[];
  toolCallsSummary?: string; // e.g. "2 tool calls", "3 tool calls · 1 message"
  codeSnippets?: CodeSnippet[];
  producedFiles?: ProducedFile[];
  usageTokens?: string; // e.g. "Usage 44K tok"
  duration?: string; // e.g. "Ran for 2m 50s"
  turnUsageDetails?: TurnUsageDetails;
  turnTimeDetails?: TurnTimeDetails;
  statusBadge?: string; // e.g. "Stopped"
  reaction?: 'up' | 'down' | null;
  copied?: boolean;
}

export interface SessionStats {
  turns: number;
  steps: number;
  llmTime: string;
  toolCallTime: string;
  ttft: string;
  tokSpeed: string;
  cacheHit: string;
  inputTok: string;
  outputTok: string;
}

export type ActiveTab = 'chat' | 'trajectory';
export type WorkspaceMode = 'Workspace Write' | 'Workspace Read-Only' | 'Isolated Sandbox';
export type ModelOption = 'qwen3.8-27b-a100-80g' | 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'claude-3.7-sonnet';
export type TerminalPosition = 'bottom' | 'top' | 'left' | 'right';

export interface ApprovalRequest {
  request_id: string;
  tool_name?: string;
  reason?: string;
  tool_class?: string;
  ask_type?: 'approval' | 'question' | 'choice' | string;
  options?: string[];
}

