import React from 'react';
import { X, Copy, Check, Download, FileCode, ExternalLink } from 'lucide-react';
import { ProducedFile } from '../../../types';

interface FilePreviewModalProps {
  file: ProducedFile | null;
  onClose: () => void;
  onOpenInWorkspace?: (file: ProducedFile) => void;
}

interface FilePreviewModalState {
  copied: boolean;
}

const COPY_RESET_DELAY_MS = 2000;

class FilePreviewModal extends React.Component<FilePreviewModalProps, FilePreviewModalState> {
  state: FilePreviewModalState = {
    copied: false,
  };

  handleCopy = () => {
    const { file } = this.props;
    if (file && file.content) {
      navigator.clipboard.writeText(file.content);
      this.setState({ copied: true });
      setTimeout(() => {
        this.setState({ copied: false });
      }, COPY_RESET_DELAY_MS);
    }
  };

  handleDownload = () => {
    const { file } = this.props;
    if (!file || !file.content) return;
    const blob_data = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const blob_url = URL.createObjectURL(blob_data);
    const download_link = document.createElement('a');
    download_link.href = blob_url;
    download_link.download = file.name;
    download_link.click();
    URL.revokeObjectURL(blob_url);
  };

  handleClose = () => {
    this.props.onClose();
  };

  render() {
    const { file } = this.props;
    const { copied } = this.state;

    if (!file) return null;

    const file_lines = (file.content || '').split('\n');

    return (
      <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div 
          className="fixed inset-0" 
          onClick={this.handleClose} 
        />
        <div className="relative bg-white rounded-2xl shadow-2xl border border-zinc-200 w-full max-w-3xl max-h-[85vh] flex flex-col z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 bg-zinc-50/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
                <FileCode className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-zinc-900 font-mono truncate">
                  {file.name}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono truncate">
                  {file.path}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {this.props.onOpenInWorkspace && (
                <button
                  type="button"
                  onClick={() => {
                    this.props.onOpenInWorkspace?.(file);
                    this.handleClose();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-sky-700 bg-sky-50 border border-sky-200 hover:bg-sky-100 transition-colors shadow-2xs cursor-pointer"
                  title="Open and edit in workspace editor"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                  <span>Open in Editor</span>
                </button>
              )}

              <button
                type="button"
                onClick={this.handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-colors shadow-2xs cursor-pointer"
                title="Copy all file content"
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
                title="Download file"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Save</span>
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

          {/* File Body Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-zinc-900 font-mono text-xs text-zinc-100 leading-relaxed selection:bg-blue-600">
            <div className="table w-full">
              {file_lines.map((line, idx) => (
                <div key={idx} className="table-row hover:bg-zinc-800/40">
                  <span className="table-cell select-none pr-4 text-zinc-500 text-right w-10 py-0.5">
                    {idx + 1}
                  </span>
                  <span className="table-cell whitespace-pre py-0.5 pl-2 text-zinc-200">
                    {line}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200 bg-zinc-50 text-zinc-500 font-mono text-xs">
            <span>{file_lines.length} lines · UTF-8</span>
            <span>{file.size || '3.2 KB'}</span>
          </div>
        </div>
      </div>
    );
  }
}

export default FilePreviewModal;
