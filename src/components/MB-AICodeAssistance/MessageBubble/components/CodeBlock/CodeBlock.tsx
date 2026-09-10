import React from 'react';
import { Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { RenderCodeTokens } from '../../../utils/codeTokens';

interface CodeBlockProps {
  lang: string;
  code: string;
  defaultExpanded?: boolean;
}

interface CodeBlockState {
  copied: boolean;
  is_expanded: boolean;
}

const COPY_NOTIFICATION_TIMEOUT_MS = 2000;
const EXPANSION_LINE_THRESHOLD = 14;
const MAX_COLLAPSED_LINES = 11;

class CodeBlock extends React.Component<CodeBlockProps, CodeBlockState> {
  state: CodeBlockState = {
    copied: false,
    is_expanded: this.props.defaultExpanded !== undefined ? this.props.defaultExpanded : true,
  };

  handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { code } = this.props;
    navigator.clipboard.writeText(code);
    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, COPY_NOTIFICATION_TIMEOUT_MS);
  };

  handleToggleExpand = () => {
    this.setState((prev_state) => ({
      is_expanded: !prev_state.is_expanded,
    }));
  };

  render() {
    const { lang, code } = this.props;
    const { copied, is_expanded } = this.state;

    const raw_lines = code.trim().split('\n');
    const is_long_code = raw_lines.length > EXPANSION_LINE_THRESHOLD;
    const displayed_lines = is_long_code && !is_expanded 
      ? raw_lines.slice(0, MAX_COLLAPSED_LINES) 
      : raw_lines;

    return (
      <div className="w-full min-w-0 max-w-full my-3 rounded-lg overflow-hidden border border-zinc-200/90 bg-[#f8f9fa] shadow-2xs text-xs relative">
        {/* Header bar */}
        <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-zinc-200/70 text-zinc-500 font-mono text-[11px]">
          <span>{lang}</span>
          <button
            type="button"
            onClick={this.handleCopy}
            className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-800 transition-colors font-sans py-0.5 px-1.5 rounded hover:bg-zinc-200/60 cursor-pointer"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Code body */}
        <div className="p-3.5 overflow-x-auto font-mono text-[12px] text-zinc-800 selection:bg-blue-100 max-w-full">
          <div className="table w-full">
            {displayed_lines.map((line, idx) => {
              if (line.includes('#')) {
                const comment_index = line.indexOf('#');
                const code_part = line.substring(0, comment_index);
                const comment_part = line.substring(comment_index);

                return (
                  <div key={idx} className="table-row leading-relaxed">
                    <span className="table-cell select-text whitespace-pre">
                      {RenderCodeTokens(code_part)}
                      <span className="text-zinc-400 italic">{comment_part}</span>
                    </span>
                  </div>
                );
              }

              return (
                <div key={idx} className="table-row leading-relaxed">
                  <span className="table-cell select-text whitespace-pre">
                    {RenderCodeTokens(line)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Collapsible toggle chevron button */}
        {is_long_code && (
          <div className="flex justify-center pb-2 pt-1 border-t border-zinc-100 bg-[#f8f9fa]">
            <button
              type="button"
              onClick={this.handleToggleExpand}
              className="w-6 h-6 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all shadow-xs cursor-pointer"
              title={is_expanded ? 'Collapse code' : 'Expand full code'}
            >
              {is_expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    );
  }
}

export default CodeBlock;
