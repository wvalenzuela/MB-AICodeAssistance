import React from 'react';
import { X, Copy, Check, Download, FileJson, FileText } from 'lucide-react';
import { Message, SessionStats } from '../../types';
import { FormatSessionJson, FormatSessionMarkdown } from '../../utils/formatters';

interface SessionLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionTitle: string;
  messages: Message[];
  stats: SessionStats;
}

interface SessionLogModalState {
  copied: boolean;
  format: 'json' | 'markdown';
}

const COPY_RESET_DELAY_MS = 2000;

class SessionLogModal extends React.Component<SessionLogModalProps, SessionLogModalState> {
  state: SessionLogModalState = {
    copied: false,
    format: 'json',
  };

  handleCopy = () => {
    const log_content = this.getLogContent();
    navigator.clipboard.writeText(log_content);
    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, COPY_RESET_DELAY_MS);
  };

  handleDownload = () => {
    const { format } = this.state;
    const { sessionTitle } = this.props;

    const log_content = this.getLogContent();
    const mime_type = format === 'json' ? 'application/json' : 'text/markdown';
    const extension = format === 'json' ? 'json' : 'md';
    const sanitized_title = sessionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_');

    const file_blob = new Blob([log_content], { type: `${mime_type};charset=utf-8` });
    const blob_url = URL.createObjectURL(file_blob);
    const download_anchor = document.createElement('a');
    download_anchor.href = blob_url;
    download_anchor.download = `session_${sanitized_title}.${extension}`;
    download_anchor.click();
    URL.revokeObjectURL(blob_url);
  };

  handleSelectJsonFormat = () => {
    this.setState({ format: 'json' });
  };

  handleSelectMarkdownFormat = () => {
    this.setState({ format: 'markdown' });
  };

  handleClose = () => {
    this.props.onClose();
  };

  getLogContent = (): string => {
    const { format } = this.state;
    const { sessionTitle, stats, messages } = this.props;

    if (format === 'json') {
      return FormatSessionJson(sessionTitle, stats, messages);
    }
    return FormatSessionMarkdown(sessionTitle, stats, messages);
  };

  render() {
    const { isOpen, sessionTitle } = this.props;
    const { copied, format } = this.state;

    if (!isOpen) return null;

    const current_log_content = this.getLogContent();

    return (
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div 
          className="fixed inset-0" 
          onClick={this.handleClose} 
        />
        <div className="relative bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-3xl max-h-[85vh] flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 bg-zinc-50/80">
            <div>
              <div className="text-sm font-semibold text-zinc-900">
                Session Audit Log & Telemetry
              </div>
              <div className="text-xs text-zinc-500 truncate max-w-sm">
                {sessionTitle}
              </div>
            </div>

            {/* Format toggle tabs */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-0.5 rounded-lg bg-zinc-200/70 border border-zinc-200 text-xs">
                <button
                  type="button"
                  onClick={this.handleSelectJsonFormat}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono transition-all cursor-pointer ${
                    format === 'json'
                      ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <FileJson className="w-3.5 h-3.5 text-amber-600" />
                  <span>JSON</span>
                </button>
                <button
                  type="button"
                  onClick={this.handleSelectMarkdownFormat}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono transition-all cursor-pointer ${
                    format === 'markdown'
                      ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Markdown</span>
                </button>
              </div>

              <div className="h-4 w-px bg-zinc-300 mx-1" />

              <button
                type="button"
                onClick={this.handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-2xs cursor-pointer"
                title="Copy entire log to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={this.handleDownload}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-2xs cursor-pointer"
                title="Save session export"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Export</span>
              </button>

              <button
                type="button"
                onClick={this.handleClose}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Log Body Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-zinc-900 font-mono text-xs text-zinc-100 leading-relaxed selection:bg-blue-600">
            <pre className="whitespace-pre-wrap">{current_log_content}</pre>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200 bg-zinc-50 text-zinc-500 text-xs font-mono">
            <span>Encoding: UTF-8</span>
            <span>Format: {format.toUpperCase()}</span>
          </div>
        </div>
      </div>
    );
  }
}

export default SessionLogModal;
