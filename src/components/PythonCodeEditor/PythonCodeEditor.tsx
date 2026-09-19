import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Save, 
  Copy, 
  Check, 
  Terminal, 
  Trash2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  FileCode,
  Share2,
  Clock,
  Columns,
  Maximize2,
  Star,
  X
} from 'lucide-react';
import { ProducedFile } from '../../types';
import { highlightCode, detectLanguageFromFilename } from '../../utils/syntaxHighlight';

export interface PythonCodeEditorProps {
  file: ProducedFile;
  onUpdateContent?: (newContent: string) => void;
  onAskAiToAssist?: (prompt: string) => void;
  isSplitView?: boolean;
  onToggleSplitView?: () => void;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
  onShowToast?: (message: string) => void;
  onClose?: () => void;
}

export const PythonCodeEditor: React.FC<PythonCodeEditorProps> = ({
  file,
  onUpdateContent,
  onAskAiToAssist,
  isSplitView = true,
  onToggleSplitView,
  onToggleChat,
  isChatOpen = true,
  onShowToast,
  onClose,
}) => {
  const [code, setCode] = useState<string>(file.content || '');
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isStarred, setIsStarred] = useState<boolean>(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [editorWidth, setEditorWidth] = useState<number>(800);

  const containerRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Detect file language and badge label
  const language = useMemo(() => detectLanguageFromFilename(file.name), [file.name]);

  const languageBadge = useMemo(() => {
    if (language === 'bash') return { label: 'Bash 5.2', color: 'bg-zinc-100 text-zinc-700 border-zinc-300' };
    if (language === 'cpp') return { label: 'C++ 20', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (language === 'sql') return { label: 'SQL / DuckDB', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    if (language === 'json') return { label: 'JSON', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (language === 'markdown') return { label: 'Markdown', color: 'bg-sky-50 text-sky-700 border-sky-200' };
    return { label: 'Python 3.10', color: 'bg-blue-50 text-blue-700 border-blue-200/70' };
  }, [language]);

  // Compute syntax highlighted HTML
  const highlightedHtml = useMemo(() => {
    return highlightCode(code, language);
  }, [code, language]);

  // Sync scroll positions between gutter, syntax pre layer, and textarea
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  // Sync scroll on code changes
  useEffect(() => {
    if (preRef.current && textareaRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [code]);

  // Sync code when file changes
  useEffect(() => {
    setCode(file.content || '');
    setIsSaved(true);
  }, [file.name, file.content]);

  // Track container width for responsive buttons
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setEditorWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isSmallWidth = editorWidth < 780;

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
    setIsSaved(false);
    onUpdateContent?.(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Support Tab key indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newCode = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newCode);
      setIsSaved(false);
      onUpdateContent?.(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    onShowToast?.(`Saved ${file.name}`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    onShowToast?.('Code copied to clipboard');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRunScript = () => {
    setIsRunning(true);
    setIsConsoleOpen(true);
    setConsoleOutput([
      `$ python3 /workspace/${file.name}`,
      `[Runtime: Python 3.10.12 - Medical-Blocks Cluster Environment]`,
      `[Initializing clinical execution context...]`,
    ]);

    setTimeout(() => {
      if (file.name === 'search_tree.py') {
        setConsoleOutput((prev) => [
          ...prev,
          `Scanning '/workspace' for pattern: '*'...`,
          `📁 /workspace/`,
          `  ├── 📄 search_tree.py (3.4 KB)`,
          `  ├── 📄 test.ipynb (28.4 KB)`,
          `  ├── 📄 file.py (1.8 KB)`,
          `  ├── 📄 test.py (2.1 KB)`,
          `  ├── 📁 jobs/`,
          `  │   ├── 📁 home/`,
          `  │   └── 📁 other/`,
          `  └── 📄 e2e_284d13cc.py (2.4 KB)`,
          `Done scanning. Found 6 files across 3 directories.`,
          `[Process completed successfully with exit code 0 (execution time: 0.18s)]`,
        ]);
      } else {
        setConsoleOutput((prev) => [
          ...prev,
          `Executing ${file.name}...`,
          `Output: Medical-Blocks clinical workflow in ${file.name} started.`,
          `Status: SUCCESS - 0 errors, 0 warnings.`,
          `[Process completed with exit code 0]`,
        ]);
      }
      setIsRunning(false);
      onShowToast?.(`Execution of ${file.name} completed`);
    }, 900);
  };

  const handleAskAi = () => {
    onAskAiToAssist?.(`Analyze and explain the code in ${file.name}`);
    onShowToast?.(`Sent ${file.name} to AI Assistant`);
  };

  const lines = code.split('\n');

  return (
    <div ref={containerRef} className="flex-1 flex flex-col h-full bg-white select-none overflow-hidden">
      {/* 1. Header Toolbar */}
      <div className="h-10 border-b border-zinc-200 bg-white px-3 py-1 flex items-center justify-between shrink-0 text-xs">
        {/* Left: Path, File Name, and Favorite Star */}
        <div className="flex items-center gap-2 min-w-0">
          <FileCode className="w-4 h-4 text-[#3776ab] shrink-0" />
          
          <div className="flex items-center gap-1.5 font-medium text-zinc-800 truncate">
            {!isSmallWidth && <span className="text-zinc-400 font-normal">home &gt;</span>}
            <span className="font-semibold text-zinc-900 truncate">{file.name}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsStarred(!isStarred)}
            className="text-zinc-400 hover:text-amber-500 transition-colors cursor-pointer p-0.5"
            title={isStarred ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer p-0.5 rounded ml-0.5"
              title={`Close ${file.name}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Language Pill */}
          <span className={`hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono rounded border ${languageBadge.color}`}>
            {languageBadge.label}
          </span>
        </div>

        {/* Right: Actions (Run, Save, Copy, AI Ask, View Toggle) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Run Code Button */}
          <button
            type="button"
            onClick={handleRunScript}
            disabled={isRunning}
            className={`flex items-center gap-1.5 ${
              isSmallWidth ? 'p-1.5' : 'px-3 py-1'
            } bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors cursor-pointer shadow-2xs disabled:opacity-50`}
            title="Execute Python script"
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isRunning ? 'animate-pulse' : ''}`} />
            {!isSmallWidth && <span>{isRunning ? 'Running...' : 'Run Script'}</span>}
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            className={`flex items-center gap-1.5 ${
              isSmallWidth ? 'p-1.5' : 'px-2.5 py-1'
            } bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md text-zinc-700 font-medium transition-colors cursor-pointer`}
            title={isSaved ? 'File saved' : 'Unsaved changes (click to save)'}
          >
            <Save className={`w-3.5 h-3.5 ${isSaved ? 'text-zinc-500' : 'text-amber-600'}`} />
            {!isSmallWidth && (
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            )}
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 ${
              isSmallWidth ? 'p-1.5' : 'px-2.5 py-1'
            } bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md text-zinc-700 font-medium transition-colors cursor-pointer`}
            title="Copy code"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-zinc-500" />}
            {!isSmallWidth && <span>{isCopied ? 'Copied' : 'Copy'}</span>}
          </button>

          {/* Ask AI Button */}
          <button
            type="button"
            onClick={handleAskAi}
            className={`flex items-center gap-1.5 ${
              isSmallWidth ? 'p-1.5' : 'px-2.5 py-1'
            } bg-violet-50 hover:bg-violet-100 border border-violet-200 text-violet-700 rounded-md font-medium transition-colors cursor-pointer`}
            title="Ask AI to explain or optimize this script"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            {!isSmallWidth && <span>Ask AI</span>}
          </button>

          {/* Console Toggle */}
          <button
            type="button"
            onClick={() => setIsConsoleOpen(!isConsoleOpen)}
            className={`p-1.5 rounded hover:bg-zinc-100 transition-colors cursor-pointer ${
              isConsoleOpen ? 'text-[#0284c7] bg-sky-50' : 'text-zinc-500'
            }`}
            title={isConsoleOpen ? 'Hide Execution Terminal' : 'Show Execution Terminal'}
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>

          {/* Split View Toggle */}
          {onToggleSplitView && (
            <button
              type="button"
              onClick={onToggleSplitView}
              className={`p-1.5 rounded hover:bg-zinc-100 transition-colors cursor-pointer ${
                isSplitView ? 'text-[#0284c7]' : 'text-zinc-500'
              }`}
              title={isSplitView ? 'Maximize Code Editor' : 'Split View'}
            >
              {isSplitView ? <Maximize2 className="w-3.5 h-3.5" /> : <Columns className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* 2. Main Code Editor Area with Real-Time Syntax Highlighting */}
      <div className="flex-1 flex min-h-0 relative font-mono text-xs overflow-hidden select-text">
        {/* Line Numbers Gutter */}
        <div 
          ref={gutterRef}
          className="w-12 bg-zinc-50 border-r border-zinc-200 py-3 select-none text-right pr-3 text-zinc-400 font-mono text-xs leading-5 shrink-0 overflow-hidden"
        >
          {lines.map((_, i) => (
            <div key={i} className="h-5">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Textarea Code Input + Highlighted Underlying Token Display */}
        <div className="flex-1 relative h-full overflow-hidden bg-white">
          {/* Layer 1: Prism Syntax Highlighted Token Display */}
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 m-0 p-3 font-mono text-xs leading-5 whitespace-pre overflow-hidden pointer-events-none select-none text-zinc-900 border-none bg-transparent"
            style={{ tabSize: 4 }}
          >
            <code 
              dangerouslySetInnerHTML={{ 
                __html: (highlightedHtml || '') + (code.endsWith('\n') ? ' ' : '') 
              }} 
            />
          </pre>

          {/* Layer 2: Interactive Transparent Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={handleCodeChange}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            style={{ tabSize: 4 }}
            className="absolute inset-0 w-full h-full m-0 p-3 font-mono text-xs leading-5 text-transparent caret-zinc-900 bg-transparent resize-none focus:outline-none selection:bg-sky-200/70 whitespace-pre overflow-auto border-none"
            placeholder={`# Write ${language} code here...`}
          />
        </div>
      </div>

      {/* 3. Bottom Terminal Output Console (collapsible) */}
      {isConsoleOpen && (
        <div className="h-44 border-t border-zinc-300 bg-zinc-900 text-zinc-100 flex flex-col shrink-0 select-text animate-in slide-in-from-bottom-2 duration-150">
          {/* Terminal Title Bar */}
          <div className="h-7 bg-zinc-800/90 px-3 flex items-center justify-between text-[11px] font-mono select-none border-b border-zinc-700/60 shrink-0">
            <div className="flex items-center gap-2 text-zinc-300">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Console Output — /workspace/{file.name}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setConsoleOutput([])}
                className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded transition-colors"
                title="Clear console output"
              >
                <Trash2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setIsConsoleOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 rounded transition-colors"
                title="Close console"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Terminal Log Lines */}
          <div className="flex-1 p-2.5 font-mono text-xs overflow-y-auto space-y-0.5 selection:bg-zinc-700">
            {consoleOutput.length === 0 ? (
              <div className="text-zinc-500 italic">No output yet. Click &quot;Run Script&quot; to execute.</div>
            ) : (
              consoleOutput.map((line, idx) => (
                <div 
                  key={idx} 
                  className={
                    line.startsWith('$') 
                      ? 'text-sky-300 font-semibold' 
                      : line.includes('SUCCESS') || line.includes('completed successfully')
                      ? 'text-emerald-400'
                      : line.includes('Scanning') || line.includes('📁')
                      ? 'text-zinc-200'
                      : 'text-zinc-400'
                  }
                >
                  {line}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 4. Footer Status Bar */}
      <div className="h-6 bg-[#f4f7f9] border-t border-zinc-200/90 px-3 flex items-center justify-between text-[11px] text-zinc-500 shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isSaved ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>{isSaved ? 'All changes saved' : 'Unsaved edits'}</span>
          </span>
          <span>•</span>
          <span>{lines.length} lines</span>
          <span>•</span>
          <span>{code.length} characters</span>
        </div>

        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>•</span>
          <span>Python 3.10</span>
          <span>•</span>
          <span>Spaces: 4</span>
        </div>
      </div>
    </div>
  );
};

export default PythonCodeEditor;
