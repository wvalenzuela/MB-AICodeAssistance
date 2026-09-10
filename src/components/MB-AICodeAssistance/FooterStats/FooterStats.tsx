import React from 'react';
import { SessionStats } from '../../../types';

interface FooterStatsProps {
  stats: SessionStats;
}

class FooterStats extends React.Component<FooterStatsProps> {
  render() {
    const { stats } = this.props;

    return (
      <div className="w-full pt-2.5 pb-2 text-zinc-500 font-sans text-[11px] sm:text-[12px] select-none min-w-0">
        <div className="w-full flex items-center justify-between px-1 text-zinc-500 leading-none overflow-x-auto scrollbar-none gap-2 min-w-0">
          <span className="whitespace-nowrap shrink-0">
            {stats.turns} turns · {stats.steps} steps
          </span>
          <span className="text-zinc-300 shrink-0">|</span>
          <span className="whitespace-nowrap shrink-0">
            LLM {stats.llmTime} · Tool call {stats.toolCallTime}
          </span>
          <span className="text-zinc-300 shrink-0">|</span>
          <span className="whitespace-nowrap shrink-0">
            TTFT avg {stats.ttft} · {stats.tokSpeed}
          </span>
          <span className="text-zinc-300 shrink-0 hidden sm:inline">|</span>
          <span className="whitespace-nowrap shrink-0 hidden sm:inline">
            Cache hit {stats.cacheHit}
          </span>
          <span className="text-zinc-300 shrink-0 hidden md:inline">|</span>
          <span className="whitespace-nowrap shrink-0 hidden md:inline">
            Input {stats.inputTok} · Output {stats.outputTok}
          </span>
        </div>
      </div>
    );
  }
}

export default FooterStats;
