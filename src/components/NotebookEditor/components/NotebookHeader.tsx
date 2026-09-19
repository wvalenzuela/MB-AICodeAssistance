import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  ChevronDown, 
  Star, 
  Clock, 
  Share2, 
  Rocket, 
  Maximize2, 
  Minimize2, 
  Columns,
  MessageSquare,
  Sparkles,
  PanelLeft,
  PanelLeftClose,
  X
} from 'lucide-react';
import { NotebookData } from '../../../types';

interface NotebookHeaderProps {
  notebook: NotebookData;
  onRunAll: () => void;
  onRestartKernel: () => void;
  isAiGenerating?: boolean;
  onTriggerAiFix?: () => void;
  isSplitView?: boolean;
  onToggleSplitView?: () => void;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
  isExplorerOpen?: boolean;
  onToggleExplorer?: () => void;
  onClose?: () => void;
}

export const NotebookHeader: React.FC<NotebookHeaderProps> = ({
  notebook,
  onRunAll,
  onRestartKernel,
  isAiGenerating = false,
  onTriggerAiFix,
  isSplitView = true,
  onToggleSplitView,
  onToggleChat,
  isChatOpen = true,
  isExplorerOpen = true,
  onToggleExplorer,
  onClose,
}) => {
  const [isStarred, setIsStarred] = useState(false);
  const [isKernelMenuOpen, setIsKernelMenuOpen] = useState(false);
  const [isRunAllMenuOpen, setIsRunAllMenuOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const [headerWidth, setHeaderWidth] = useState<number>(800);

  useEffect(() => {
    if (!headerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setHeaderWidth(entry.contentRect.width);
      }
    });
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  // When notebook is small width (e.g. split view or small screen)
  const isSmallWidth = headerWidth < 820;
  const isExtraSmallWidth = headerWidth < 540;

  return (
    <div 
      ref={headerRef}
      className="bg-white border-b border-zinc-200 px-3 sm:px-4 py-2 flex items-center justify-between text-xs select-none shrink-0 gap-2 overflow-hidden"
    >
      {/* Left: Explorer toggle + Breadcrumbs, Title, Kernel badge, Star */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
        {onToggleExplorer && (
          <button
            type="button"
            onClick={onToggleExplorer}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
              isExplorerOpen
                ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                : 'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
            }`}
            title={isExplorerOpen ? 'Hide Explorer (Ctrl+B)' : 'Show Explorer (Ctrl+B)'}
            aria-label="Toggle Explorer"
          >
            {isExplorerOpen ? (
              <PanelLeftClose className="w-3.5 h-3.5" />
            ) : (
              <PanelLeft className="w-3.5 h-3.5" />
            )}
          </button>
        )}

        <div className="flex items-center gap-1.5 text-zinc-600 font-sans font-medium text-xs sm:text-sm min-w-0">
          {!isSmallWidth && (
            <>
              <span className="text-zinc-400 hover:text-zinc-600 cursor-pointer hidden md:inline">home</span>
              <span className="text-zinc-400 hidden md:inline">&gt;</span>
            </>
          )}
          <span 
            className="font-semibold text-zinc-900 truncate max-w-[90px] sm:max-w-[130px] md:max-w-[180px]"
            title={notebook.title}
          >
            {notebook.title}
          </span>
        </div>

        {/* Python badge with dropdown (hidden on small width to prevent collision) */}
        {!isSmallWidth && (
          <div className="hidden lg:flex items-center gap-1 px-2 py-0.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded text-xs font-sans cursor-pointer transition-colors shrink-0">
            <span>Python</span>
            <ChevronDown className="w-3 h-3 text-zinc-500" />
          </div>
        )}

        {/* Favorite Star */}
        <button
          type="button"
          onClick={() => setIsStarred(!isStarred)}
          className="text-zinc-400 hover:text-amber-500 cursor-pointer transition-colors p-0.5 shrink-0"
          title={isStarred ? 'Unfavorite notebook' : 'Favorite notebook'}
        >
          <Star className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/70 rounded p-1 cursor-pointer transition-colors shrink-0 ml-0.5"
            title="Close notebook tab"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {isAiGenerating && (
          <div 
            className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-medium animate-pulse shrink-0"
            title="AI writing in notebook..."
          >
            <Sparkles className="w-3 h-3 text-amber-600 animate-spin shrink-0" />
            {!isSmallWidth && <span>AI writing...</span>}
          </div>
        )}
      </div>

      {/* Right: Run all, Kernel status, Schedule, Share, Deploy, View switcher */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Quick AI Fix shortcut (only on large width) */}
        {onTriggerAiFix && !isSmallWidth && (
          <button
            type="button"
            onClick={onTriggerAiFix}
            className="hidden 2xl:flex items-center gap-1.5 px-2.5 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 rounded-md font-medium text-xs transition-colors cursor-pointer"
            title="Simulate Chat AI writing code to fix Cell 13 ROOT error"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span>AI Fix</span>
          </button>
        )}

        {/* Run all button with dropdown - icon only when isSmallWidth */}
        <div className="relative">
          <div className="inline-flex rounded-md shadow-2xs border border-zinc-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={onRunAll}
              className={`flex items-center gap-1.5 ${isSmallWidth ? 'p-1.5' : 'px-2.5 py-1'} text-zinc-700 hover:bg-zinc-50 font-medium transition-colors cursor-pointer`}
              title="Run all cells in notebook"
            >
              <Play className="w-3.5 h-3.5 fill-zinc-700 text-zinc-700 shrink-0" />
              {!isSmallWidth && <span>Run all</span>}
            </button>
            <button
              type="button"
              onClick={() => setIsRunAllMenuOpen(!isRunAllMenuOpen)}
              className="px-1 py-1 border-l border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 cursor-pointer"
              title="Run options"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {isRunAllMenuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-50 text-xs text-zinc-700">
              <button
                type="button"
                onClick={() => { onRunAll(); setIsRunAllMenuOpen(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 cursor-pointer"
              >
                Run All Above
              </button>
              <button
                type="button"
                onClick={() => { onRunAll(); setIsRunAllMenuOpen(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 cursor-pointer"
              >
                Restart &amp; Run All
              </button>
            </div>
          )}
        </div>

        {/* Kernel indicator dropdown - icon only when isSmallWidth */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsKernelMenuOpen(!isKernelMenuOpen)}
            className={`flex items-center gap-1.5 ${isSmallWidth ? 'p-1.5' : 'px-2.5 py-1'} bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md text-zinc-700 font-medium transition-colors cursor-pointer`}
            title={`Kernel: ${notebook.kernel} (${notebook.kernelStatus})`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${notebook.kernelStatus === 'busy' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
            {!isSmallWidth && <span className="truncate max-w-[70px]">{notebook.kernel}</span>}
            <ChevronDown className="w-3 h-3 text-zinc-400 shrink-0" />
          </button>

          {isKernelMenuOpen && (
            <div className="absolute right-0 mt-1 w-44 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-50 text-xs text-zinc-700">
              <button
                type="button"
                onClick={() => { onRestartKernel(); setIsKernelMenuOpen(false); }}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 cursor-pointer"
              >
                Restart Kernel
              </button>
              <button
                type="button"
                onClick={() => setIsKernelMenuOpen(false)}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 cursor-pointer"
              >
                Interrupt Kernel
              </button>
              <button
                type="button"
                onClick={() => setIsKernelMenuOpen(false)}
                className="w-full text-left px-3 py-1.5 hover:bg-zinc-100 cursor-pointer"
              >
                Change Kernel (Python 3.10)
              </button>
            </div>
          )}
        </div>

        {/* Schedule button - icon only when isSmallWidth */}
        <button
          type="button"
          className={`flex items-center gap-1.5 ${isSmallWidth ? 'p-1.5' : 'px-2.5 py-1'} bg-white hover:bg-zinc-50 border border-zinc-200 rounded-md text-zinc-700 font-medium transition-colors cursor-pointer`}
          title="Schedule periodic run"
        >
          <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
          {!isSmallWidth && <span>Schedule</span>}
        </button>

        {/* Share button (solid blue) - icon only when isSmallWidth */}
        <button
          type="button"
          className={`flex items-center gap-1.5 ${isSmallWidth ? 'p-1.5' : 'px-3 py-1'} bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-md font-medium transition-colors cursor-pointer shadow-2xs`}
          title="Share notebook link"
        >
          <Share2 className="w-3.5 h-3.5 shrink-0" />
          {!isSmallWidth && <span>Share</span>}
        </button>

        {/* Deploy button (solid green) - icon only when isSmallWidth */}
        {!isExtraSmallWidth && (
          <button
            type="button"
            className={`flex items-center gap-1.5 ${isSmallWidth ? 'p-1.5' : 'px-3 py-1'} bg-[#15803d] hover:bg-[#166534] text-white rounded-md font-medium transition-colors cursor-pointer shadow-2xs`}
            title="Deploy notebook to production container"
          >
            <Rocket className="w-3.5 h-3.5 shrink-0" />
            {!isSmallWidth && <span>Deploy</span>}
          </button>
        )}

        {/* Layout Split / Maximize Controls */}
        <div className="flex items-center border-l border-zinc-200 pl-1.5 sm:pl-2 gap-0.5 sm:gap-1 shrink-0">
          {onToggleSplitView && (
            <button
              type="button"
              onClick={onToggleSplitView}
              className={`p-1.5 rounded hover:bg-zinc-100 transition-colors cursor-pointer ${isSplitView ? 'text-[#0284c7]' : 'text-zinc-500'}`}
              title={isSplitView ? 'Maximize Notebook (hide side chat)' : 'Split View (Notebook + AI Chat)'}
            >
              {isSplitView ? <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Columns className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>
          )}

          {onToggleChat && (
            <button
              type="button"
              onClick={onToggleChat}
              className={`p-1.5 rounded hover:bg-zinc-100 transition-colors cursor-pointer ${isChatOpen ? 'text-[#0284c7]' : 'text-zinc-500'}`}
              title={isChatOpen ? 'Hide AI Chat' : 'Show AI Chat'}
            >
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotebookHeader;
