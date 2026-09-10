import React from 'react';
import { 
  Plus, 
  Paperclip, 
  ChevronDown, 
  ArrowUp, 
  Loader2, 
  FileCode2, 
  Bug, 
  Terminal, 
  X, 
  Sparkles,
  PenLine
} from 'lucide-react';
import { ModelOption, WorkspaceMode } from '../../types';

interface ChatInputProps {
  onSendMessage: (content: string, attachments?: File[]) => void;
  isLoading: boolean;
  workspaceMode: WorkspaceMode;
  onSelectWorkspaceMode: (mode: WorkspaceMode) => void;
  selectedModel: ModelOption;
  onSelectModel: (model: ModelOption) => void;
}

interface AttachedFileItem {
  name: string;
  size: string;
}

interface ChatInputState {
  text: string;
  is_plus_menu_open: boolean;
  is_mode_open: boolean;
  is_model_open: boolean;
  is_context_open: boolean;
  attached_files: AttachedFileItem[];
}

const AVAILABLE_MODELS: ModelOption[] = [
  'qwen3.8-27b-a100-80g',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
  'claude-3.7-sonnet',
];

const DEFAULT_INPUT_TEXT = 'no create the file';
const MIN_TEXTAREA_HEIGHT_PX = 24;
const MAX_TEXTAREA_HEIGHT_PX = 160;

class ChatInput extends React.Component<ChatInputProps, ChatInputState> {
  textareaRef = React.createRef<HTMLTextAreaElement>();
  fileInputRef = React.createRef<HTMLInputElement>();
  plusMenuRef = React.createRef<HTMLDivElement>();
  modeMenuRef = React.createRef<HTMLDivElement>();
  modelMenuRef = React.createRef<HTMLDivElement>();
  contextMenuRef = React.createRef<HTMLDivElement>();
  resizeObserver: ResizeObserver | null = null;

  state: ChatInputState = {
    text: DEFAULT_INPUT_TEXT,
    is_plus_menu_open: false,
    is_mode_open: false,
    is_model_open: false,
    is_context_open: false,
    attached_files: [],
  };

  componentDidMount() {
    this.adjustHeight();
    document.addEventListener('mousedown', this.handleClickOutside);
    document.addEventListener('keydown', this.handleKeyDownEscape);
    window.addEventListener('resize', this.handleWindowResize);

    if (typeof ResizeObserver !== 'undefined' && this.textareaRef.current) {
      this.resizeObserver = new ResizeObserver(() => {
        this.adjustHeight();
      });
      this.resizeObserver.observe(this.textareaRef.current);
    }
  }

  componentDidUpdate(_prev_props: ChatInputProps, prev_state: ChatInputState) {
    if (prev_state.text !== this.state.text) {
      this.adjustHeight();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleKeyDownEscape);
    window.removeEventListener('resize', this.handleWindowResize);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  handleWindowResize = () => {
    this.adjustHeight();
  };

  handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    const { is_plus_menu_open, is_mode_open, is_model_open, is_context_open } = this.state;

    if (
      is_plus_menu_open &&
      this.plusMenuRef.current &&
      !this.plusMenuRef.current.contains(target)
    ) {
      this.setState({ is_plus_menu_open: false });
    }

    if (
      is_mode_open &&
      this.modeMenuRef.current &&
      !this.modeMenuRef.current.contains(target)
    ) {
      this.setState({ is_mode_open: false });
    }

    if (
      is_model_open &&
      this.modelMenuRef.current &&
      !this.modelMenuRef.current.contains(target)
    ) {
      this.setState({ is_model_open: false });
    }

    if (
      is_context_open &&
      this.contextMenuRef.current &&
      !this.contextMenuRef.current.contains(target)
    ) {
      this.setState({ is_context_open: false });
    }
  };

  handleKeyDownEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const { is_plus_menu_open, is_mode_open, is_model_open, is_context_open } = this.state;
      if (is_plus_menu_open || is_mode_open || is_model_open || is_context_open) {
        this.setState({
          is_plus_menu_open: false,
          is_mode_open: false,
          is_model_open: false,
          is_context_open: false,
        });
      }
    }
  };

  handleToggleContextUsage = () => {
    this.setState((prev_state) => ({
      is_context_open: !prev_state.is_context_open,
      is_plus_menu_open: false,
      is_mode_open: false,
      is_model_open: false,
    }));
  };

  adjustHeight = () => {
    const el = this.textareaRef.current;
    if (!el) return;

    // Reset inline height to 'auto' to correctly measure natural scrollHeight
    el.style.height = 'auto';

    const val = el.value || '';
    // If the input is empty or a short single line without manual newlines, ensure minimal height
    const hasMultipleLines = val.includes('\n');
    if (!hasMultipleLines && val.length < 80) {
      el.style.height = `${MIN_TEXTAREA_HEIGHT_PX}px`;
      return;
    }

    const scroll_height = el.scrollHeight;
    const new_height = Math.max(
      MIN_TEXTAREA_HEIGHT_PX,
      Math.min(scroll_height, MAX_TEXTAREA_HEIGHT_PX)
    );
    el.style.height = `${new_height}px`;
  };

  handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ text: e.target.value });
  };

  handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSendMessage();
    }
  };

  handleSendMessage = () => {
    const { text } = this.state;
    const { isLoading, onSendMessage } = this.props;

    const trimmed_text = text.trim();
    if (!trimmed_text || isLoading) return;

    onSendMessage(trimmed_text);
    this.setState({
      text: '',
      attached_files: [],
      is_plus_menu_open: false,
      is_mode_open: false,
      is_model_open: false,
    });
  };

  handleTogglePlusMenu = () => {
    this.setState((prev_state) => ({
      is_plus_menu_open: !prev_state.is_plus_menu_open,
      is_mode_open: false,
      is_model_open: false,
    }));
  };

  handleToggleMode = () => {
    this.setState((prev_state) => ({
      is_mode_open: !prev_state.is_mode_open,
      is_plus_menu_open: false,
      is_model_open: false,
    }));
  };

  handleToggleModel = () => {
    this.setState((prev_state) => ({
      is_model_open: !prev_state.is_model_open,
      is_plus_menu_open: false,
      is_mode_open: false,
    }));
  };

  handleSelectModel = (model: ModelOption) => () => {
    this.props.onSelectModel(model);
    this.setState({ is_model_open: false });
  };

  handleSelectWorkspaceMode = (mode: WorkspaceMode) => () => {
    this.props.onSelectWorkspaceMode(mode);
    this.setState({ is_mode_open: false });
  };

  handleTriggerFileInput = () => {
    this.fileInputRef.current?.click();
    this.setState({ is_plus_menu_open: false });
  };

  handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input_files = e.target.files;
    if (input_files && input_files.length > 0) {
      const added_list: AttachedFileItem[] = [];
      for (let i = 0; i < input_files.length; i += 1) {
        const file_item = input_files[i];
        const size_kb = (file_item.size / 1024).toFixed(1);
        added_list.push({
          name: file_item.name,
          size: `${size_kb} KB`,
        });
      }
      this.setState((prev_state) => ({
        attached_files: [...prev_state.attached_files, ...added_list],
      }));
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  handleRemoveFile = (index: number) => () => {
    this.setState((prev_state) => ({
      attached_files: prev_state.attached_files.filter((_, i) => i !== index),
    }));
  };

  render() {
    const { isLoading, workspaceMode, selectedModel } = this.props;
    const { 
      text, 
      is_plus_menu_open, 
      is_mode_open, 
      is_model_open, 
      attached_files 
    } = this.state;

    return (
      <div className="w-full relative select-text">
        {/* Hidden native file input */}
        <input
          type="file"
          ref={this.fileInputRef}
          onChange={this.handleFileSelect}
          multiple
          className="hidden"
        />

        {/* Attached files pills tray */}
        {attached_files.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-2 px-1">
            {attached_files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs px-2 py-0.5 rounded-md font-mono"
              >
                <Paperclip className="w-3 h-3 text-zinc-500" />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <span className="text-[10px] text-zinc-400">({file.size})</span>
                <button
                  type="button"
                  onClick={this.handleRemoveFile(idx)}
                  className="hover:text-red-500 transition-colors p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Rounded Input Box Card - floating over messages passing behind */}
        <div className="relative rounded-2xl border border-zinc-200/90 bg-white transition-all shadow-md focus-within:border-zinc-400 focus-within:shadow-lg w-full min-w-0">
          {/* Top part: TextArea with dynamic height calculation based strictly on text content */}
          <div className="p-3 pb-2">
            <textarea
              ref={this.textareaRef}
              value={text}
              onChange={this.handleTextChange}
              onKeyDown={this.handleKeyDown}
              placeholder="Message or run a task... / commands, @ files or sessions"
              rows={1}
              className="w-full resize-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden font-sans leading-relaxed block overflow-y-auto"
              style={{ minHeight: '24px', maxHeight: '160px', height: 'auto' }}
            />
          </div>

          {/* Bottom Toolbar */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-y-2 gap-x-1.5 px-3 py-2 border-t border-zinc-100 text-xs min-w-0">
            {/* Left controls: Plus (+), Attach file (📎), Workspace Mode */}
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 shrink-0">
              {/* Plus (+) Button for actions/attachments */}
              <div ref={this.plusMenuRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={this.handleTogglePlusMenu}
                  className="w-6 h-6 rounded-full border border-zinc-200/90 hover:border-zinc-400 text-zinc-600 hover:text-zinc-900 flex items-center justify-center transition-colors bg-white hover:bg-zinc-50 cursor-pointer shrink-0"
                  title="Add files or actions"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Plus Popup Menu */}
                {is_plus_menu_open && (
                  <div className="absolute bottom-full left-0 mb-2 w-48 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-zinc-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={this.handleTriggerFileInput}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-zinc-50 text-zinc-700 cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>Attach Files</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        this.setState({ text: 'Find and fix all bugs in recent scripts' });
                        this.adjustHeight();
                        this.setState({ is_plus_menu_open: false });
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-zinc-50 text-zinc-700 cursor-pointer"
                    >
                      <Bug className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>Debug Workspace</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        this.setState({ text: 'Run terminal self-check diagnostics' });
                        this.adjustHeight();
                        this.setState({ is_plus_menu_open: false });
                      }}
                      className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-zinc-50 text-zinc-700 cursor-pointer"
                    >
                      <Terminal className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span>Run Diagnostics</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Attach File Button */}
              <button
                type="button"
                onClick={this.handleTriggerFileInput}
                className="w-6 h-6 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Attach files"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>

              {/* Workspace Mode Pill */}
              <div ref={this.modeMenuRef} className="relative min-w-0">
                <button
                  type="button"
                  onClick={this.handleToggleMode}
                  className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 px-2 py-1 rounded-md transition-colors font-medium cursor-pointer select-none whitespace-nowrap shrink-0"
                >
                  {workspaceMode === 'Workspace Write' ? (
                    <PenLine className="w-3 h-3 text-zinc-500 shrink-0" />
                  ) : (
                    <FileCode2 className="w-3 h-3 text-zinc-500 shrink-0" />
                  )}
                  <span className="truncate max-w-[85px] xs:max-w-[120px] sm:max-w-none whitespace-nowrap">{workspaceMode}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
                </button>

                {is_mode_open && (
                  <div className="absolute bottom-full left-0 mb-2 w-44 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-zinc-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <button
                      type="button"
                      onClick={this.handleSelectWorkspaceMode('Workspace Write')}
                      className={`w-full text-left px-3 py-1.5 hover:bg-zinc-50 cursor-pointer ${
                        workspaceMode === 'Workspace Write' ? 'font-semibold text-zinc-900 bg-zinc-50' : 'text-zinc-600'
                      }`}
                    >
                      Workspace Write
                    </button>
                    <button
                      type="button"
                      onClick={this.handleSelectWorkspaceMode('Workspace Read-Only')}
                      className={`w-full text-left px-3 py-1.5 hover:bg-zinc-50 cursor-pointer ${
                        workspaceMode === 'Workspace Read-Only' ? 'font-semibold text-zinc-900 bg-zinc-50' : 'text-zinc-600'
                      }`}
                    >
                      Workspace Read-Only
                    </button>
                    <button
                      type="button"
                      onClick={this.handleSelectWorkspaceMode('Isolated Sandbox')}
                      className={`w-full text-left px-3 py-1.5 hover:bg-zinc-50 cursor-pointer ${
                        workspaceMode === 'Isolated Sandbox' ? 'font-semibold text-zinc-900 bg-zinc-50' : 'text-zinc-600'
                      }`}
                    >
                      Isolated Sandbox
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right controls: Model, Context Usage meter, Send Button */}
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 shrink-0 ml-auto">
              {/* Model Selection Pill */}
              <div ref={this.modelMenuRef} className="relative min-w-0">
                <button
                  type="button"
                  onClick={this.handleToggleModel}
                  className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/80 px-2 py-1 rounded-md transition-colors font-mono cursor-pointer select-none whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
                  <span className="truncate max-w-[85px] xs:max-w-[130px] sm:max-w-none whitespace-nowrap">{selectedModel}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
                </button>

                {is_model_open && (
                  <div className="absolute bottom-full right-0 mb-2 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-zinc-200 py-1 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1 font-mono text-[10px] text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                      Inference Model
                    </div>
                    {AVAILABLE_MODELS.map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={this.handleSelectModel(model)}
                        className={`w-full text-left px-3 py-1.5 font-mono hover:bg-zinc-50 cursor-pointer ${
                          selectedModel === model ? 'font-semibold text-zinc-900 bg-zinc-50' : 'text-zinc-600'
                        }`}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Context Usage Circular Meter & Popover Dialog (from Image 3) */}
              <div ref={this.contextMenuRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={this.handleToggleContextUsage}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                    this.state.is_context_open
                      ? 'bg-zinc-100 text-zinc-900'
                      : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800'
                  }`}
                  title="Context usage (17%)"
                >
                  <svg className="w-4 h-4 -rotate-90" viewBox="0 0 20 20">
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-zinc-200"
                    />
                    <circle
                      cx="10"
                      cy="10"
                      r="7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeDasharray={2 * Math.PI * 7}
                      strokeDashoffset={2 * Math.PI * 7 * (1 - 0.17)}
                      strokeLinecap="round"
                      className="text-zinc-600"
                    />
                  </svg>
                </button>

                {/* Context usage Popover Dialog (Image 3) */}
                {this.state.is_context_open && (
                  <div className="absolute bottom-full right-0 mb-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-zinc-200/90 p-4 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-3">
                      <div>
                        <span className="font-semibold text-zinc-900">17%</span>{' '}
                        <span className="text-zinc-500">of context used</span>
                      </div>
                      <div className="font-mono text-zinc-600 text-xs">
                        ~45.6K / 262K
                      </div>
                    </div>

                    {/* Segmented Progress Bar */}
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full flex overflow-hidden mb-3.5">
                      <div style={{ width: '1.2%' }} className="bg-zinc-400 h-full rounded-l-full" />
                      <div style={{ width: '4.4%' }} className="bg-purple-500 h-full" />
                      <div style={{ width: '11.8%' }} className="bg-blue-500 h-full rounded-r-full" />
                    </div>

                    {/* Legend Items */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-xs bg-zinc-400" />
                          <span className="text-zinc-600">System prompt</span>
                        </div>
                        <span className="font-mono text-zinc-600">~1.7K</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-xs bg-purple-500" />
                          <span className="text-zinc-600">Tools</span>
                        </div>
                        <span className="font-mono text-zinc-600">~6.6K</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-xs bg-blue-500" />
                          <span className="text-zinc-600">Messages</span>
                        </div>
                        <span className="font-mono text-zinc-600">~20.5K</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={this.handleSendMessage}
                disabled={!text.trim() || isLoading}
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  text.trim() && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                }`}
                title="Send instruction"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ChatInput;
