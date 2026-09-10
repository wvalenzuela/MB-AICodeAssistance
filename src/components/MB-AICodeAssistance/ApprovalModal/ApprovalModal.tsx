import React from 'react';
import { 
  ShieldAlert, 
  Check, 
  X, 
  Terminal, 
  FileCode2, 
  HelpCircle,
  Clock
} from 'lucide-react';
import { ApprovalRequest } from '../../../types';

interface ApprovalModalProps {
  request: ApprovalRequest | null;
  onResolve: (outcome: 'approve' | 'deny' | 'answer', answer?: string) => void;
}

interface ApprovalModalState {
  answerText: string;
}

class ApprovalModal extends React.Component<ApprovalModalProps, ApprovalModalState> {
  state: ApprovalModalState = {
    answerText: '',
  };

  handleApprove = () => {
    this.props.onResolve('approve');
  };

  handleDeny = () => {
    this.props.onResolve('deny');
  };

  handleAnswer = (choice?: string) => () => {
    const text = choice || this.state.answerText;
    this.props.onResolve('answer', text);
    this.setState({ answerText: '' });
  };

  render() {
    const { request } = this.props;
    const { answerText } = this.state;

    if (!request) return null;

    const isQuestion = request.ask_type === 'question' || Boolean(request.options && request.options.length > 0);

    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden font-sans">
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between bg-amber-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">
                  {isQuestion ? 'Agent Needs Your Input' : 'Agent Action Approval Required'}
                </h3>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Request ID: {request.request_id}
                </div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-mono font-semibold">
              Pending
            </span>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 text-xs">
            {/* Tool & Reason Info */}
            <div className="space-y-1.5">
              <div className="text-[11px] uppercase font-mono text-zinc-400 font-semibold">
                Requested Tool Execution
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-zinc-800 bg-zinc-50 p-2.5 rounded-lg border border-zinc-200/80">
                {request.tool_name === 'bash' ? (
                  <Terminal className="w-4 h-4 text-purple-600 shrink-0" />
                ) : (
                  <FileCode2 className="w-4 h-4 text-blue-600 shrink-0" />
                )}
                <span className="font-semibold text-zinc-900">{request.tool_name || 'System Command'}</span>
              </div>
            </div>

            {/* Explanation / Reason */}
            {request.reason && (
              <div className="space-y-1">
                <div className="text-[11px] uppercase font-mono text-zinc-400 font-semibold">
                  Reason & Purpose
                </div>
                <div className="p-3 bg-zinc-50 border border-zinc-200/60 rounded-lg text-zinc-700 leading-relaxed font-sans">
                  {request.reason}
                </div>
              </div>
            )}

            {/* Choice Options if provided */}
            {request.options && request.options.length > 0 && (
              <div className="space-y-2">
                <div className="text-[11px] uppercase font-mono text-zinc-400 font-semibold">
                  Select an Option
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {request.options.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={this.handleAnswer(opt)}
                      className="text-left px-3 py-2 rounded-lg border border-zinc-200 hover:border-blue-500 hover:bg-blue-50/50 text-zinc-800 font-medium transition-all cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Text Answer field if ask_type is question and no fixed options */}
            {request.ask_type === 'question' && (!request.options || request.options.length === 0) && (
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase font-mono text-zinc-400 font-semibold">
                  Your Answer / Instructions
                </label>
                <textarea
                  value={answerText}
                  onChange={(e) => this.setState({ answerText: e.target.value })}
                  placeholder="Provide guidance to the agent..."
                  className="w-full p-2.5 border border-zinc-200 rounded-lg text-xs font-sans focus:outline-hidden focus:border-blue-500"
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={this.handleDeny}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5 text-red-500" />
              <span>Deny / Cancel</span>
            </button>

            {isQuestion && (!request.options || request.options.length === 0) ? (
              <button
                type="button"
                onClick={this.handleAnswer()}
                disabled={!answerText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Submit Answer</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={this.handleApprove}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Approve Action</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default ApprovalModal;
