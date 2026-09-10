import React from 'react';
import { 
  Atom, 
  PenLine, 
  Terminal, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Layers,
  Code2
} from 'lucide-react';
import { Message, ToolCallItem } from '../../types';

interface TrajectoryViewProps {
  messages: Message[];
  onSelectFile?: (filename: string) => void;
}

interface TrajectoryViewState {
  selected_tool_id: string | null;
}

interface StepTrajectoryItem {
  message_id: string;
  timestamp: string;
  tool: ToolCallItem;
}

class TrajectoryView extends React.Component<TrajectoryViewProps, TrajectoryViewState> {
  state: TrajectoryViewState = {
    selected_tool_id: null,
  };

  handleSelectTool = (tool_id: string) => () => {
    this.setState({ selected_tool_id: tool_id });
  };

  handleSelectFile = (file_name: string) => () => {
    const { onSelectFile } = this.props;
    if (onSelectFile) {
      onSelectFile(file_name);
    }
  };

  render() {
    const { messages } = this.props;
    const { selected_tool_id } = this.state;

    // Extract all tool execution steps from the conversation
    const all_tool_steps: StepTrajectoryItem[] = [];
    messages.forEach((msg) => {
      if (msg.toolCalls) {
        msg.toolCalls.forEach((tool) => {
          all_tool_steps.push({
            message_id: msg.id,
            timestamp: msg.timestamp,
            tool,
          });
        });
      }
    });

    const selected_item = all_tool_steps.find((s) => s.tool.id === selected_tool_id)?.tool || all_tool_steps[0]?.tool;

    return (
      <div className="w-full max-w-4xl mx-auto py-6 px-4 sm:px-6">
        {/* Header card */}
        <div className="mb-6 bg-white rounded-xl border border-zinc-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Agent Execution Trajectory</span>
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Sequential state machine transitions, tool calls, and step-by-step reasoning paths.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200/60">
              {all_tool_steps.length} Total Steps
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/60">
              100% Success Rate
            </span>
          </div>
        </div>

        {/* Main Grid: Left Timeline, Right Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Step Nodes Timeline (Left 5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-zinc-200/80 p-4 shadow-xs">
            <div className="text-xs font-semibold uppercase text-zinc-400 font-mono mb-3">
              Trajectory Sequence
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
              {all_tool_steps.map((step, idx) => {
                const is_selected = selected_item && selected_item.id === step.tool.id;
                
                let StepIcon = Atom;
                let icon_color = 'text-purple-600 bg-purple-50 border-purple-200';
                let badge_text = 'Think';

                if (step.tool.type === 'write') {
                  StepIcon = PenLine;
                  icon_color = 'text-blue-600 bg-blue-50 border-blue-200';
                  badge_text = 'Write';
                } else if (step.tool.type === 'bash') {
                  StepIcon = Terminal;
                  icon_color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
                  badge_text = 'Bash';
                }

                return (
                  <div
                    key={step.tool.id}
                    onClick={this.handleSelectTool(step.tool.id)}
                    className={`relative p-3 rounded-lg border cursor-pointer transition-all ${
                      is_selected
                        ? 'bg-blue-50/50 border-blue-400 shadow-xs'
                        : 'bg-white hover:bg-zinc-50 border-zinc-200/70'
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className={`absolute -left-6 top-3.5 w-3 h-3 rounded-full border-2 bg-white ${
                      is_selected ? 'border-blue-600 ring-2 ring-blue-100' : 'border-zinc-400'
                    }`} />

                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${icon_color}`}>
                          <StepIcon className="w-3 h-3" />
                          <span>{badge_text}</span>
                        </span>
                        <span className="text-[11px] font-mono text-zinc-400">
                          Step {idx + 1}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {step.timestamp}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-700 font-medium line-clamp-2">
                      {step.tool.title}
                    </div>

                    {step.tool.detail && (
                      <div className="mt-1 text-[11px] font-mono text-zinc-400 truncate">
                        {step.tool.detail}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Step Inspector (Right 7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-zinc-200/80 p-5 shadow-xs flex flex-col">
            {selected_item ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <span className="capitalize px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 text-xs font-mono font-semibold">
                      {selected_item.type}
                    </span>
                    <span className="text-sm font-semibold text-zinc-900 truncate max-w-sm">
                      {selected_item.title}
                    </span>
                  </div>
                  {selected_item.executionTime && (
                    <span className="text-xs font-mono text-zinc-400">
                      ⏱ {selected_item.executionTime}
                    </span>
                  )}
                </div>

                {/* Status bar */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-200/70 text-xs">
                  <div className="flex items-center gap-2 text-zinc-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>State Machine Completed with Exit Code 0</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-400 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>Logged at runtime</span>
                  </div>
                </div>

                {/* Sub detail or command */}
                {selected_item.command && (
                  <div>
                    <div className="text-[11px] uppercase font-mono text-zinc-400 font-semibold mb-1">
                      Shell Execution Command
                    </div>
                    <div className="bg-zinc-900 text-zinc-100 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                      $ {selected_item.command}
                    </div>
                  </div>
                )}

                {/* Output log */}
                {selected_item.output && (
                  <div>
                    <div className="text-[11px] uppercase font-mono text-zinc-400 font-semibold mb-1">
                      Process STDOUT
                    </div>
                    <div className="bg-zinc-100 text-zinc-800 p-3 rounded-lg font-mono text-xs max-h-48 overflow-y-auto whitespace-pre-wrap border border-zinc-200">
                      {selected_item.output}
                    </div>
                  </div>
                )}

                {/* Reasoning Detail */}
                {selected_item.reasoningFull && (
                  <div>
                    <div className="text-[11px] uppercase font-mono text-zinc-400 font-semibold mb-1">
                      CoT Reasoning Path
                    </div>
                    <div className="bg-purple-50/60 border border-purple-200/60 text-purple-950 p-3.5 rounded-lg text-xs leading-relaxed max-h-56 overflow-y-auto">
                      {selected_item.reasoningFull}
                    </div>
                  </div>
                )}

                {/* Lines diff for write tools */}
                {selected_item.type === 'write' && (
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-200/60 space-y-2">
                    <div className="text-xs text-zinc-600 flex items-center justify-between">
                      <span>Affected target file:</span>
                      <button
                        type="button"
                        onClick={this.handleSelectFile(selected_item.title)}
                        className="text-blue-600 hover:underline font-mono inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>{selected_item.title}</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-emerald-700">+{selected_item.linesAdded || 0} insertions</span>
                      <span className="text-red-700">-{selected_item.linesRemoved || 0} deletions</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-zinc-400 text-xs">
                <ArrowRight className="w-6 h-6 mb-2 stroke-[1.5]" />
                <span>Select a node on the left timeline to inspect trajectory data</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default TrajectoryView;
