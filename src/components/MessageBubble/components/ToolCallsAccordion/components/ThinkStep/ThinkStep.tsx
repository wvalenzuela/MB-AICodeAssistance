import React from 'react';
import { Atom, ChevronRight, ChevronDown, Copy, Check, Lightbulb } from 'lucide-react';
import { ToolCallItem } from '../../../../../../types';

interface ThinkStepProps {
  tool: ToolCallItem;
}

interface ThinkStepState {
  is_open: boolean;
  copied: boolean;
}

const COPY_RESET_DELAY_MS = 1800;

class ThinkStep extends React.Component<ThinkStepProps, ThinkStepState> {
  state: ThinkStepState = {
    is_open: false,
    copied: false,
  };

  handleToggle = () => {
    this.setState((prev_state) => ({
      is_open: !prev_state.is_open,
    }));
  };

  handleCopyReasoning = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { tool } = this.props;
    const text_to_copy = tool.reasoningFull || tool.title;
    if (text_to_copy) {
      navigator.clipboard.writeText(text_to_copy);
      this.setState({ copied: true });
      setTimeout(() => {
        this.setState({ copied: false });
      }, COPY_RESET_DELAY_MS);
    }
  };

  render() {
    const { tool } = this.props;
    const { is_open, copied } = this.state;

    return (
      <div className="group/think select-text text-xs leading-relaxed w-full min-w-0 max-w-full">
        {/* Clickable Header Row - Collapsed by default */}
        <div
          onClick={this.handleToggle}
          className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-zinc-100/80 cursor-pointer transition-colors w-full min-w-0"
          title="Click to view full hidden reasoning process"
        >
          {/* Atom / Reasoning Icon */}
          <div className="flex-shrink-0 text-zinc-500 group-hover/think:text-purple-600 transition-colors">
            <Atom className="w-3.5 h-3.5 stroke-[2]" />
          </div>

          {/* Title and Dot */}
          <div className="flex items-center gap-1.5 flex-shrink-0 font-medium text-zinc-700">
            <span>Think</span>
            <span className="text-zinc-400">·</span>
          </div>

          {/* Preview text: entering from right to left */}
          <div className="flex-1 min-w-0 overflow-hidden relative">
            <div
              className="text-zinc-600 truncate animate-enter-rtl transition-all"
              title={tool.title}
            >
              {tool.title}
            </div>
          </div>

          {/* Collapsible toggle chevron */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-1 text-zinc-400 group-hover/think:text-zinc-600">
            <span className="text-[10px] hidden sm:inline text-zinc-400 font-mono">
              {is_open ? 'hide' : 'reasoning'}
            </span>
            {is_open ? (
              <ChevronDown className="w-3.5 h-3.5 transition-transform duration-150" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 transition-transform duration-150" />
            )}
          </div>
        </div>

        {/* Hidden Dropdown Section for Full Reasoning Process */}
        {is_open && (
          <div className="w-full mt-1.5 mb-2.5 p-3 rounded-lg bg-zinc-50/90 border border-zinc-200/90 shadow-sm text-zinc-700 text-xs overflow-hidden">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200/70 text-[11px] font-medium text-zinc-500">
              <div className="flex items-center gap-1.5 text-purple-700 font-mono">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Full Chain-of-Thought Reasoning</span>
              </div>
              <button
                type="button"
                onClick={this.handleCopyReasoning}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                title="Copy full reasoning text"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-600 text-[10px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span className="text-[10px]">Copy Thought</span>
                  </>
                )}
              </button>
            </div>

            <div className="font-mono text-[11px] text-zinc-800 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto pl-1">
              {tool.reasoningFull || tool.title}
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ThinkStep;
