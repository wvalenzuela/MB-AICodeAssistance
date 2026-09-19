import React, { useRef, useMemo, useState, useEffect } from 'react';
import { highlightCode } from '../../utils/syntaxHighlight';

interface CodeEditorWithHighlightProps {
  value: string;
  onChange?: (val: string) => void;
  language?: string;
  placeholder?: string;
  readOnly?: boolean;
  minHeight?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  showLineNumbers?: boolean;
  autoFocus?: boolean;
  isStreaming?: boolean;
}

export const CodeEditorWithHighlight: React.FC<CodeEditorWithHighlightProps> = ({
  value,
  onChange,
  language = 'python',
  placeholder = '',
  readOnly = false,
  minHeight = '60px',
  className = '',
  onKeyDown,
  showLineNumbers = false,
  autoFocus = false,
  isStreaming = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Compute highlighted HTML via Prism
  const highlightedHtml = useMemo(() => {
    return highlightCode(value, language);
  }, [value, language]);

  // Synchronize scroll positions between textarea and highlighted <pre>
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Sync scroll on content changes as well
  useEffect(() => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, [value]);

  // Handle Tab key for proper code indentation
  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
      if (e.defaultPrevented) return;
    }

    if (e.key === 'Tab' && !readOnly) {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const spaces = '    '; // 4 spaces indentation

      if (start === end) {
        // Single cursor position
        const newValue = value.substring(0, start) + spaces + value.substring(end);
        onChange?.(newValue);
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 4;
        });
      } else {
        // Multi-line selection indent/unindent
        const before = value.substring(0, start);
        const selected = value.substring(start, end);
        const after = value.substring(end);

        if (e.shiftKey) {
          // Unindent
          const unindented = selected.replace(/^ {1,4}/gm, '');
          onChange?.(before + unindented + after);
          requestAnimationFrame(() => {
            textarea.selectionStart = start;
            textarea.selectionEnd = start + unindented.length;
          });
        } else {
          // Indent
          const indented = selected.replace(/^/gm, spaces);
          onChange?.(before + indented + after);
          requestAnimationFrame(() => {
            textarea.selectionStart = start;
            textarea.selectionEnd = start + indented.length;
          });
        }
      }
    }
  };

  const lineCount = Math.max(1, (value || '').split('\n').length);

  return (
    <div className={`relative flex min-h-0 w-full overflow-hidden ${className}`}>
      {/* Optional Line Numbers Column */}
      {showLineNumbers && (
        <div className="w-11 bg-zinc-50 border-r border-zinc-200/80 py-3 select-none text-right pr-3 font-mono text-[11px] text-zinc-400 leading-5 shrink-0 overflow-hidden">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="h-5">
              {i + 1}
            </div>
          ))}
        </div>
      )}

      {/* Editor Surface */}
      <div 
        className="flex-1 relative min-h-0 w-full overflow-hidden bg-white"
        style={{ minHeight }}
      >
        {/* Layer 1: Syntax Highlighted Token Display */}
        <pre
          ref={preRef}
          aria-hidden="true"
          className="absolute inset-0 m-0 p-3 font-mono text-xs leading-5 whitespace-pre overflow-hidden pointer-events-none select-none text-zinc-900 border-none bg-transparent"
          style={{ tabSize: 4 }}
        >
          <code 
            dangerouslySetInnerHTML={{ 
              __html: (highlightedHtml || '') + (value.endsWith('\n') ? ' ' : '') 
            }} 
          />
          {isStreaming && (
            <span className="inline-block w-2 h-4 bg-sky-500 animate-pulse ml-0.5 align-middle shadow-xs" />
          )}
        </pre>

        {/* Layer 2: Transparent Interactive Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDownInternal}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          readOnly={readOnly || isStreaming}
          autoFocus={autoFocus}
          spellCheck={false}
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          placeholder={placeholder}
          style={{ tabSize: 4 }}
          className={`absolute inset-0 w-full h-full m-0 p-3 font-mono text-xs leading-5 whitespace-pre overflow-auto resize-none bg-transparent caret-zinc-900 focus:outline-none selection:bg-sky-200/70 border-none ${
            isStreaming ? 'text-transparent cursor-wait' : 'text-transparent'
          }`}
        />
      </div>
    </div>
  );
};
