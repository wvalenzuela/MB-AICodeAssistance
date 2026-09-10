import React from 'react';
import { 
  Copy, 
  Check, 
  ThumbsUp, 
  ThumbsDown, 
  GitFork, 
  Clock, 
  Database,
  Code2
} from 'lucide-react';
import { Message, ProducedFile } from '../../../types';
import { ToolCallsAccordion, CodeBlock } from './components';

interface MessageBubbleProps {
  message: Message;
  onReact?: (messageId: string, reaction: 'up' | 'down') => void;
  onFork?: (messageId: string) => void;
  onSelectFile?: (file: ProducedFile) => void;
}

interface MessageBubbleState {
  copied: boolean;
  is_usage_open: boolean;
  is_time_open: boolean;
}

const COPY_RESET_DELAY_MS = 2000;

class MessageBubble extends React.Component<MessageBubbleProps, MessageBubbleState> {
  usageMenuRef = React.createRef<HTMLDivElement>();
  timeMenuRef = React.createRef<HTMLDivElement>();

  state: MessageBubbleState = {
    copied: false,
    is_usage_open: false,
    is_time_open: false,
  };

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
    document.addEventListener('keydown', this.handleKeyDownEscape);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleKeyDownEscape);
  }

  handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    const { is_usage_open, is_time_open } = this.state;

    if (
      is_usage_open &&
      this.usageMenuRef.current &&
      !this.usageMenuRef.current.contains(target)
    ) {
      this.setState({ is_usage_open: false });
    }

    if (
      is_time_open &&
      this.timeMenuRef.current &&
      !this.timeMenuRef.current.contains(target)
    ) {
      this.setState({ is_time_open: false });
    }
  };

  handleKeyDownEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const { is_usage_open, is_time_open } = this.state;
      if (is_usage_open || is_time_open) {
        this.setState({ is_usage_open: false, is_time_open: false });
      }
    }
  };

  handleToggleUsage = () => {
    this.setState((prev_state) => ({
      is_usage_open: !prev_state.is_usage_open,
      is_time_open: false,
    }));
  };

  handleToggleTime = () => {
    this.setState((prev_state) => ({
      is_time_open: !prev_state.is_time_open,
      is_usage_open: false,
    }));
  };

  handleCopy = () => {
    const { message } = this.props;
    navigator.clipboard.writeText(message.content);
    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, COPY_RESET_DELAY_MS);
  };

  handleReactUp = () => {
    const { message, onReact } = this.props;
    if (onReact) {
      onReact(message.id, 'up');
    }
  };

  handleReactDown = () => {
    const { message, onReact } = this.props;
    if (onReact) {
      onReact(message.id, 'down');
    }
  };

  handleFork = () => {
    const { message, onFork } = this.props;
    if (onFork) {
      onFork(message.id);
    }
  };

  handleSelectFile = (file: ProducedFile) => () => {
    const { onSelectFile } = this.props;
    if (onSelectFile) {
      onSelectFile(file);
    }
  };

  handleSelectFileName = (file_name: string) => {
    const { message, onSelectFile } = this.props;
    const found_file = message.producedFiles?.find((f) => f.name === file_name);
    if (found_file && onSelectFile) {
      onSelectFile(found_file);
    }
  };

  render() {
    const { message } = this.props;
    const { copied } = this.state;

    // User message rendering
    if (message.sender === 'user') {
      return (
        <div className="w-full flex justify-end my-2.5">
          <div className="max-w-[85%] sm:max-w-[75%] flex flex-col items-end select-text">
            <div className="px-4 py-2 rounded-2xl bg-zinc-100/90 text-zinc-900 text-sm font-sans leading-relaxed shadow-2xs border border-zinc-200/50">
              {message.content}
            </div>

            {/* Timestamp and action below user bubble */}
            <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-zinc-400 font-mono">
              <span>{message.timestamp}</span>
              <button
                type="button"
                onClick={this.handleCopy}
                className="p-1 hover:text-zinc-600 rounded transition-colors cursor-pointer"
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // Assistant message rendering
    return (
      <div className="w-full flex flex-col items-stretch my-3 select-text min-w-0 max-w-full">
        {/* Foldable Tool Calls Accordion */}
        {message.toolCallsSummary && (
          <ToolCallsAccordion
            summary={message.toolCallsSummary}
            toolCalls={message.toolCalls}
            onSelectFile={this.handleSelectFileName}
          />
        )}

        {/* Main Message Content - spans full container width */}
        <div className="w-full text-[13px] sm:text-sm text-zinc-900 leading-relaxed space-y-2">
          {message.content.split('\n').map((line, idx) => {
            if (!line.trim()) {
              return <div key={idx} className="h-1.5" />;
            }

            // Bullet point lines with file links
            if (line.startsWith('•')) {
              const is_file_bullet = line.includes('File:');
              return (
                <div key={idx} className="flex items-start gap-2 pl-1">
                  <span className="text-zinc-500">•</span>
                  <div className="flex-1">
                    {is_file_bullet ? (
                      <span>
                        <strong className="font-semibold text-zinc-800">File:</strong>{' '}
                        {message.producedFiles && message.producedFiles.length > 0 ? (
                          <button
                            type="button"
                            onClick={this.handleSelectFile(message.producedFiles[0])}
                            className="inline-flex items-center gap-1 font-mono text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200/60"
                          >
                            <Code2 className="w-3 h-3 text-blue-600" />
                            <span>{message.producedFiles[0].name}</span>
                          </button>
                        ) : (
                          <code className="font-mono text-xs text-blue-600">search_tree.py</code>
                        )}
                        {' at '}
                        <code className="font-mono text-xs text-zinc-600 bg-zinc-100 px-1 py-0.5 rounded">
                          /Users/waldo/Documents/AnonymousData/
                        </code>
                      </span>
                    ) : (
                      <span>
                        {line.replace(/^•\s*/, '')}
                      </span>
                    )}
                  </div>
                </div>
              );
            }

            // Header lines with checks
            if (line.includes('Done ✅') || line.includes('✅ Ran successfully')) {
              return (
                <div key={idx} className="font-medium text-zinc-900">
                  {line}
                </div>
              );
            }

            return <div key={idx}>{line}</div>;
          })}

          {/* Embedded Code Snippets (full width) */}
          {message.codeSnippets?.map((snippet, sIdx) => (
            <CodeBlock key={sIdx} lang={snippet.lang} code={snippet.code} />
          ))}

          {/* Produced file badge line */}
          {message.producedFiles && message.producedFiles.length > 0 && (
            <div className="pt-1 flex items-center gap-1.5 text-xs text-zinc-600">
              <span>Produced</span>
              {message.producedFiles.map((file) => (
                <button
                  key={file.name}
                  type="button"
                  onClick={this.handleSelectFile(file)}
                  className="inline-flex items-center gap-1 font-mono text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
                >
                  <Code2 className="w-3 h-3" />
                  <span>{file.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* Status Badge */}
          {message.statusBadge && (
            <div className="pt-1">
              <span className="inline-block text-[11px] font-medium text-zinc-600 bg-zinc-100 border border-zinc-200/80 px-2 py-0.5 rounded-md">
                {message.statusBadge}
              </span>
            </div>
          )}
        </div>

        {/* Assistant Message Actions Toolbar */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-2.5 pt-1 text-zinc-500 text-xs select-none">
          {/* Quick Copy button */}
          <button
            type="button"
            onClick={this.handleCopy}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded transition-colors cursor-pointer"
            title="Copy response"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Thumbs Up */}
          <button
            type="button"
            onClick={this.handleReactUp}
            className={`p-1 rounded transition-colors cursor-pointer ${
              message.reaction === 'up'
                ? 'text-blue-600 bg-blue-50'
                : 'text-zinc-400 hover:text-zinc-700'
            }`}
            title="Good response"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
          </button>

          {/* Thumbs Down */}
          <button
            type="button"
            onClick={this.handleReactDown}
            className={`p-1 rounded transition-colors cursor-pointer ${
              message.reaction === 'down'
                ? 'text-red-500 bg-red-50'
                : 'text-zinc-400 hover:text-zinc-700'
            }`}
            title="Bad response"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>

          {/* Fork / Branch conversation */}
          <button
            type="button"
            onClick={this.handleFork}
            className="p-1 text-zinc-400 hover:text-zinc-700 rounded transition-colors cursor-pointer"
            title="Fork conversation from this turn"
          >
            <GitFork className="w-3.5 h-3.5 rotate-90" />
          </button>

          {/* Usage Tokens Pill & Popover Dialog */}
          {message.usageTokens && (
            <div ref={this.usageMenuRef} className="relative">
              <button
                type="button"
                onClick={this.handleToggleUsage}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-colors cursor-pointer ${
                  this.state.is_usage_open
                    ? 'bg-zinc-200 text-zinc-900 border-zinc-300'
                    : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 border-zinc-200/70'
                }`}
                title="View turn usage"
              >
                <Database className="w-3.5 h-3.5 text-zinc-600" />
                <span>{message.usageTokens}</span>
              </button>

              {/* Turn usage Popover Dialog (from Image 2) */}
              {this.state.is_usage_open && (
                <div className="absolute bottom-full left-0 mb-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-zinc-200/90 p-4 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2 font-medium text-zinc-900">
                      <Database className="w-4 h-4 text-zinc-700" />
                      <span>Turn usage</span>
                    </div>
                    <span className="font-semibold text-zinc-900 font-mono">
                      {message.turnUsageDetails?.totalTokens || '43,965 tok'}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Provider / model</span>
                      <span className="font-mono text-zinc-700">
                        {message.turnUsageDetails?.model || 'ollama/qwen3.8-27b-a100-80g'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Uncached input</span>
                      <span className="font-mono text-zinc-700">
                        {message.turnUsageDetails?.uncachedInput || '42,926 tok'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Output</span>
                      <span className="font-mono text-zinc-700">
                        {message.turnUsageDetails?.output || '1,039 tok'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Run duration Pill & Popover Dialog */}
          {message.duration && (
            <div ref={this.timeMenuRef} className="relative">
              <button
                type="button"
                onClick={this.handleToggleTime}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-colors cursor-pointer ${
                  this.state.is_time_open
                    ? 'bg-zinc-200 text-zinc-900 border-zinc-300'
                    : 'bg-zinc-100 hover:bg-zinc-200/80 text-zinc-600 border-zinc-200/70'
                }`}
                title="View turn time and speed"
              >
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span>{message.duration}</span>
              </button>

              {/* Turn time and speed Popover Dialog (from Image 1) */}
              {this.state.is_time_open && (
                <div className="absolute bottom-full left-0 mb-2 w-64 sm:w-72 bg-white rounded-2xl shadow-xl border border-zinc-200/90 p-4 text-xs z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 font-medium text-zinc-900">
                    <Clock className="w-4 h-4 text-zinc-700" />
                    <span>Turn time and speed</span>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-zinc-500">Total run time</span>
                    <span className="font-mono text-zinc-800 font-medium">
                      {message.turnTimeDetails?.totalRunTime || message.duration.replace('Ran for ', '')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className="text-[11px] text-zinc-400 font-mono ml-auto sm:ml-0">
            {message.timestamp}
          </div>
        </div>
      </div>
    );
  }
}

export default MessageBubble;
