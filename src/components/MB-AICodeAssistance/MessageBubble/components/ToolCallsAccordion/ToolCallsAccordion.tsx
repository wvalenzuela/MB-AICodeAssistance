import React from 'react';
import { 
  Terminal, 
  PenLine, 
  ChevronDown, 
  ChevronRight, 
  Wrench,
  FileCode
} from 'lucide-react';
import { ToolCallItem } from '../../../../../types';
import { ThinkStep } from './components';

interface ToolCallsAccordionProps {
  summary: string;
  toolCalls?: ToolCallItem[];
  onSelectFile?: (fileName: string) => void;
}

interface ToolCallsAccordionState {
  is_expanded: boolean;
}

class ToolCallsAccordion extends React.Component<ToolCallsAccordionProps, ToolCallsAccordionState> {
  state: ToolCallsAccordionState = {
    is_expanded: false,
  };

  handleToggleExpanded = () => {
    this.setState((prev_state) => ({
      is_expanded: !prev_state.is_expanded,
    }));
  };

  handleSelectFile = (file_name: string) => () => {
    const { onSelectFile } = this.props;
    if (onSelectFile) {
      onSelectFile(file_name);
    }
  };

  render() {
    const { summary, toolCalls } = this.props;
    const { is_expanded } = this.state;

    if (!toolCalls || toolCalls.length === 0) {
      return (
        <div className="flex items-center gap-2 py-1 px-2 mb-2 text-xs text-zinc-500 font-mono">
          <Wrench className="w-3.5 h-3.5" />
          <span>{summary}</span>
        </div>
      );
    }

    return (
      <div className="w-full min-w-0 max-w-full mb-3 text-xs">
        {/* Foldable Header Button */}
        <button
          type="button"
          onClick={this.handleToggleExpanded}
          className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer py-1 px-1 rounded hover:bg-zinc-100/60 font-medium"
        >
          {is_expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          )}
          <span className="font-mono text-zinc-500">{summary}</span>
        </button>

        {/* Expanded tool call sequence */}
        {is_expanded && (
          <div className="w-full min-w-0 max-w-full mt-2 pl-1 sm:pl-2 border-l-2 border-zinc-200/70 space-y-1.5 my-2">
            {toolCalls.map((tool) => {
              if (tool.type === 'think') {
                return <ThinkStep key={tool.id} tool={tool} />;
              }

              if (tool.type === 'write') {
                return (
                  <div
                    key={tool.id}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-zinc-100/80 text-zinc-700 w-full min-w-0"
                  >
                    <PenLine className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                    <span className="font-medium text-zinc-700 flex-shrink-0">Write</span>
                    <span className="text-zinc-400 flex-shrink-0">·</span>
                    <button
                      type="button"
                      onClick={this.handleSelectFile(tool.title)}
                      className="underline decoration-dotted hover:text-blue-600 font-mono text-zinc-800 transition-colors truncate cursor-pointer"
                      title="Inspect file"
                    >
                      {tool.title}
                    </button>
                    {(tool.linesAdded !== undefined || tool.linesRemoved !== undefined) && (
                      <span className="text-zinc-400 text-[11px] font-mono ml-1 flex-shrink-0">
                        +{tool.linesAdded || 0} -{tool.linesRemoved || 0}
                      </span>
                    )}
                  </div>
                );
              }

              if (tool.type === 'bash') {
                return (
                  <div
                    key={tool.id}
                    className="group py-1.5 px-2 rounded-md hover:bg-zinc-100/80 text-zinc-700 space-y-1.5 w-full min-w-0 max-w-full"
                  >
                    <div className="flex items-center gap-2 w-full min-w-0">
                      <Terminal className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <span className="font-medium text-zinc-700 flex-shrink-0">Bash</span>
                      <span className="text-zinc-400 flex-shrink-0">·</span>
                      <span className="text-zinc-600 truncate flex-1 min-w-0">{tool.title}</span>
                      {tool.executionTime && (
                        <span className="text-[10px] text-zinc-400 font-mono ml-auto flex-shrink-0">
                          {tool.executionTime}
                        </span>
                      )}
                    </div>
                    {tool.command && (
                      <div className="ml-5 font-mono text-[11px] bg-zinc-100 px-2.5 py-1.5 rounded-md text-zinc-800 border border-zinc-200/60 overflow-x-auto w-[calc(100%-1.25rem)] max-w-full block">
                        $ {tool.command}
                      </div>
                    )}
                    {tool.output && (
                      <div className="ml-5 font-mono text-[10px] text-zinc-600 whitespace-pre bg-zinc-50 p-2 rounded-md border border-zinc-200/50 overflow-x-auto max-h-36 w-[calc(100%-1.25rem)] max-w-full block">
                        {tool.output}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={tool.id}
                  className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-zinc-100/80 text-zinc-700 w-full min-w-0"
                >
                  <FileCode className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                  <span className="font-medium capitalize flex-shrink-0">{tool.type}</span>
                  <span className="text-zinc-400 flex-shrink-0">·</span>
                  <span className="text-zinc-600 truncate flex-1 min-w-0">{tool.title}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default ToolCallsAccordion;
