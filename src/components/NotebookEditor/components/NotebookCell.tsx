import React, { useState, useMemo } from 'react';
import { 
  Play, 
  ChevronDown, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Sparkles, 
  Check, 
  AlertCircle,
  Square,
  Radio,
  Zap
} from 'lucide-react';
import { NotebookCellItem, CellType } from '../../../types';
import OctSegmentationOutput from './OctSegmentationOutput';
import { highlightCode } from '../../../utils/syntaxHighlight';

interface NotebookCellProps {
  cell: NotebookCellItem;
  cellIndex: number;
  isSelected: boolean;
  onSelect: () => void;
  onRunCell: (id: string) => void;
  onUpdateSource: (id: string, newSource: string) => void;
  onChangeType: (id: string, newType: CellType) => void;
  onDeleteCell: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onAskAiToFix?: (cell: NotebookCellItem) => void;
  onStopAiStreaming?: (id: string) => void;
}

export const NotebookCell: React.FC<NotebookCellProps> = ({
  cell,
  cellIndex,
  isSelected,
  onSelect,
  onRunCell,
  onUpdateSource,
  onChangeType,
  onDeleteCell,
  onMoveUp,
  onMoveDown,
  onAskAiToFix,
  onStopAiStreaming,
}) => {
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditingMarkdown, setIsEditingMarkdown] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(cell.source);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Detect cell language (Python, Bash magic, C++ magic, SQL, Markdown)
  const cellLanguage = useMemo(() => {
    if (cell.type === 'sql') return 'sql';
    if (cell.type === 'markdown') return 'markdown';
    const trimmed = (cell.source || '').trim();
    if (trimmed.startsWith('%%bash') || trimmed.startsWith('%%sh') || trimmed.startsWith('!')) return 'bash';
    if (trimmed.startsWith('%%sql') || trimmed.startsWith('SELECT ') || trimmed.startsWith('select ')) return 'sql';
    if (trimmed.startsWith('%%cpp') || trimmed.startsWith('%%cuda') || trimmed.startsWith('%%c')) return 'cpp';
    return 'python';
  }, [cell.type, cell.source]);

  // Syntax highlighted HTML via Prism
  const highlightedHtml = useMemo(() => {
    return highlightCode(cell.source, cellLanguage);
  }, [cell.source, cellLanguage]);

  // MARKDOWN CELL (Matches screenshot styling with bold blue accent border)
  if (cell.type === 'markdown') {
    return (
      <div 
        id={cell.id}
        onClick={onSelect}
        className={`group relative rounded-xl transition-all duration-150 my-4 ${
          isSelected ? 'ring-2 ring-sky-500/40 shadow-sm' : ''
        }`}
      >
        <div className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-2xs">
          <div className="flex items-start justify-between gap-4">
            <div className="border-l-4 border-[#0284c7] pl-4 py-1 flex-1">
              {cell.headerTitle ? (
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                  {cell.headerTitle}
                </h2>
              ) : null}

              {isEditingMarkdown ? (
                <div className="mt-3">
                  <textarea
                    value={cell.source}
                    onChange={(e) => onUpdateSource(cell.id, e.target.value)}
                    onBlur={() => setIsEditingMarkdown(false)}
                    autoFocus
                    className="w-full h-24 p-2 font-mono text-xs border border-zinc-300 rounded-md focus:outline-sky-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsEditingMarkdown(false)}
                    className="mt-1 text-xs px-2.5 py-1 bg-zinc-800 text-white rounded cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <p 
                  onDoubleClick={() => setIsEditingMarkdown(true)}
                  className="text-xs text-zinc-500 mt-1 cursor-text"
                  title="Double click to edit markdown description"
                >
                  {cell.source.replace(/^### [^\n]+\n?/, '') || 'Click to add markdown notes...'}
                </p>
              )}
            </div>

            {/* Hover Actions */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditingMarkdown(!isEditingMarkdown)}
                className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded text-xs cursor-pointer"
                title="Edit markdown"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDeleteCell(cell.id)}
                className="p-1 text-zinc-400 hover:text-red-600 hover:bg-zinc-100 rounded cursor-pointer"
                title="Delete markdown cell"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CODE / SQL CELL (Matches Screenshot 1, 2, 3)
  const lineCount = Math.max(1, cell.source.split('\n').length);
  const hasError = cell.outputs?.some((o) => o.type === 'error');

  return (
    <div 
      id={cell.id}
      onClick={onSelect}
      className={`group relative rounded-xl transition-all duration-150 my-4 ${
        isSelected ? 'ring-2 ring-sky-500/40 shadow-sm' : ''
      }`}
    >
      {/* AI Writing / Streaming Header */}
      {(cell.isAiWriting || cell.isStreaming) && (
        <div className="flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-sky-700 via-indigo-700 to-violet-700 text-white text-xs font-sans rounded-t-xl shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs text-white truncate">
                {cell.streamingStatusText || 'Medical-Blocks AI is streaming code into this notebook...'}
              </span>
              <span className="text-[10px] text-sky-200 font-mono">
                Receiving LLM token stream to cell: {cell.id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 text-[11px] bg-white/15 px-2.5 py-0.5 rounded-full font-mono text-zinc-100 border border-white/10">
              <Zap className="w-3 h-3 text-amber-300" />
              <span>{cell.streamingSpeed || '72 tok/s'}</span>
            </span>

            {onStopAiStreaming && (
              <button
                type="button"
                onClick={() => onStopAiStreaming(cell.id)}
                className="flex items-center gap-1 px-2.5 py-1 bg-white/20 hover:bg-white/30 text-white text-[11px] font-medium rounded-md transition-colors cursor-pointer"
                title="Stop AI Code Generation"
              >
                <Square className="w-3 h-3 fill-white" />
                <span>Stop</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cell Input Header: In [X]: + Run button + Type Dropdown + Cell Tools */}
      <div className={`flex items-center justify-between px-4 py-1.5 bg-white border border-b-0 border-zinc-200/90 ${cell.isAiWriting || cell.isStreaming ? '' : 'rounded-t-xl'} text-xs select-none`}>
        <div className="flex items-center gap-2">
          {/* Execution Counter: In [X]: */}
          <span className="font-mono text-zinc-500 text-[11px] font-medium min-w-[44px]">
            {cell.status === 'running' || cell.isAiWriting ? (
              <span className="text-amber-600 animate-pulse font-semibold">In [*]:</span>
            ) : cell.executionCount !== null ? (
              `In [${cell.executionCount}]:`
            ) : (
              'In [ ]:'
            )}
          </span>

          {/* Run Cell Play Button */}
          <button
            type="button"
            onClick={() => onRunCell(cell.id)}
            className="p-1 hover:bg-zinc-100 rounded text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
            title="Run cell (Shift+Enter)"
          >
            <Play className="w-3.5 h-3.5 fill-zinc-700 text-zinc-700" />
          </button>

          {/* Cell Type Selector: [Code ▾] */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
              className="flex items-center gap-1 px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded text-[11px] font-sans font-medium transition-colors cursor-pointer"
            >
              <span className="capitalize">{cell.type}</span>
              <ChevronDown className="w-3 h-3 text-zinc-500" />
            </button>

            {isTypeDropdownOpen && (
              <div className="absolute left-0 mt-1 w-32 bg-white border border-zinc-200 rounded-md shadow-lg py-1 z-50 text-xs text-zinc-700">
                {(['code', 'markdown', 'sql'] as CellType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      onChangeType(cell.id, t);
                      setIsTypeDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 capitalize hover:bg-zinc-100 cursor-pointer ${cell.type === t ? 'font-semibold text-sky-600 bg-sky-50' : ''}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right side cell controls */}
        <div className="flex items-center gap-1">
          {/* Ask AI to Fix Error button if cell has error */}
          {hasError && onAskAiToFix && (
            <button
              type="button"
              onClick={() => onAskAiToFix(cell)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 rounded-md text-[11px] font-medium transition-colors cursor-pointer mr-1 animate-pulse"
              title="Have the AI Chat analyze and automatically type the fix"
            >
              <Sparkles className="w-3 h-3 text-rose-600" />
              <span>Ask AI to Fix</span>
            </button>
          )}

          {/* Copy Code */}
          <button
            type="button"
            onClick={handleCopyCode}
            className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            title="Copy cell code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Move Up */}
          {onMoveUp && cellIndex > 0 && (
            <button
              type="button"
              onClick={() => onMoveUp(cell.id)}
              className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              title="Move cell up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Move Down */}
          {onMoveDown && (
            <button
              type="button"
              onClick={() => onMoveDown(cell.id)}
              className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              title="Move cell down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete Cell */}
          <button
            type="button"
            onClick={() => onDeleteCell(cell.id)}
            className="p-1 hover:bg-zinc-100 rounded text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
            title="Delete cell"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Code Area with Line Numbers and Real-Time Syntax Highlighting */}
      <div className="flex border border-zinc-200/90 bg-white overflow-hidden select-text">
        {/* Line Numbers Column */}
        <div className="w-12 bg-zinc-50 border-r border-zinc-200/80 py-3 select-none text-right pr-3 font-mono text-[11px] text-zinc-400 leading-5 shrink-0">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i} className="h-5">{i + 1}</div>
          ))}
        </div>

        {/* Code Content Column with real-time Syntax Highlighting */}
        <div className="flex-1 relative overflow-x-auto bg-white min-h-[48px]">
          {/* Layer 1: Prism Syntax Highlighted Token Display */}
          <pre
            aria-hidden="true"
            className="m-0 p-3 font-mono text-xs leading-5 whitespace-pre pointer-events-none select-none text-zinc-900 border-none bg-transparent"
            style={{ tabSize: 4 }}
          >
            <code 
              dangerouslySetInnerHTML={{ 
                __html: (highlightedHtml || '') + (cell.source.endsWith('\n') ? ' ' : '') 
              }} 
            />
            {(cell.isAiWriting || cell.isStreaming) && (
              <span className="inline-block w-2 h-4 bg-sky-500 animate-pulse ml-0.5 align-middle shadow-xs" />
            )}
          </pre>

          {/* Layer 2: Interactive Transparent Textarea */}
          <textarea
            value={cell.source}
            onChange={(e) => onUpdateSource(cell.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.currentTarget.selectionStart;
                const end = e.currentTarget.selectionEnd;
                const newSource = cell.source.substring(0, start) + '    ' + cell.source.substring(end);
                onUpdateSource(cell.id, newSource);
                const target = e.currentTarget;
                setTimeout(() => {
                  target.selectionStart = target.selectionEnd = start + 4;
                }, 0);
              } else if (e.key === 'Enter' && e.shiftKey) {
                e.preventDefault();
                onRunCell(cell.id);
              }
            }}
            readOnly={cell.isAiWriting || cell.isStreaming}
            spellCheck={false}
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            style={{ tabSize: 4 }}
            className={`absolute inset-0 w-full h-full m-0 p-3 font-mono text-xs leading-5 text-transparent caret-zinc-900 bg-transparent resize-none focus:outline-none selection:bg-sky-200/70 whitespace-pre overflow-hidden border-none ${
              cell.isAiWriting || cell.isStreaming ? 'cursor-wait' : ''
            }`}
          />
        </div>
      </div>

      {/* Cell Outputs Area */}
      {cell.outputs && cell.outputs.length > 0 && (
        <div className="border border-t-0 border-zinc-200/90 rounded-b-xl overflow-hidden bg-white">
          {cell.outputs.map((out, outIdx) => {
            // ERROR OUTPUT (Matches Screenshot 2 & 3 identically)
            if (out.type === 'error') {
              return (
                <div key={outIdx} className="p-4 bg-red-50/40 border-t border-red-200/80">
                  {/* NameError Header Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-800 font-mono font-semibold text-xs shadow-2xs">
                        {out.ename || 'NameError'}
                      </span>
                      <span className="font-mono text-rose-900 font-semibold text-xs">
                        {out.evalue || "name 'ROOT' is not defined"}
                      </span>
                    </div>

                    {onAskAiToFix && (
                      <button
                        type="button"
                        onClick={() => onAskAiToFix(cell)}
                        className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 rounded-md text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                        <span>Fix this with AI Assistant</span>
                      </button>
                    )}
                  </div>

                  {/* Traceback box with exact styling from Screenshot 2 & 3 */}
                  <div className="p-3 bg-red-50/70 border border-red-200 rounded-lg text-xs font-mono text-red-900 leading-relaxed overflow-x-auto whitespace-pre">
                    {out.traceback ? (
                      out.traceback.join('\n')
                    ) : (
                      `---------------------------------------------------------------------------\n${out.ename || 'NameError'}                                 Traceback (most recent call last)\nCell In[2], line 2\n      1 import shutil\n----> 2 shutil.rmtree(ROOT)\n${out.ename || 'NameError'}: ${out.evalue || "name 'ROOT' is not defined"}`
                    )}
                  </div>
                </div>
              );
            }

            // OCT SEGMENTATION OUTPUT WIDGET
            const isOct = cell.isOctSegmentation || out.content?.includes('OCT') || out.content?.includes('Retinal Layer') || out.type === 'image';

            return (
              <div 
                key={outIdx} 
                className="p-3.5 bg-zinc-50 border-t border-zinc-200/80 text-xs font-mono text-zinc-800 whitespace-pre-wrap leading-relaxed"
              >
                {out.content}

                {/* Render Interactive Clinical OCT Retinal Segmentation Visualization */}
                {isOct && <OctSegmentationOutput />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotebookCell;
