import { Message, SessionStats } from '../../../types';

export const FormatSessionJson = (
  session_title: string,
  stats: SessionStats,
  messages: Message[]
): string => {
  const export_data = {
    sessionTitle: session_title,
    exportTimestamp: new Date().toISOString(),
    metrics: stats,
    turns: messages.map((msg) => ({
      id: msg.id,
      sender: msg.sender,
      timestamp: msg.timestamp,
      content: msg.content,
      toolCalls: msg.toolCalls,
      codeSnippets: msg.codeSnippets,
      usageTokens: msg.usageTokens,
      duration: msg.duration,
    })),
  };
  return JSON.stringify(export_data, null, 2);
};

export const FormatSessionMarkdown = (
  session_title: string,
  stats: SessionStats,
  messages: Message[]
): string => {
  let md_content = `# Session Log: ${session_title}\n`;
  md_content += `Exported: ${new Date().toLocaleString()}\n\n`;
  md_content += `## Metrics\n- Turns: ${stats.turns} | Steps: ${stats.steps}\n- LLM Time: ${stats.llmTime}\n- Tool Call Time: ${stats.toolCallTime}\n- TTFT: ${stats.ttft} (${stats.tokSpeed})\n- Input: ${stats.inputTok} | Output: ${stats.outputTok}\n\n`;
  md_content += `## Transcript\n\n`;

  messages.forEach((msg) => {
    md_content += `### ${msg.sender.toUpperCase()} (${msg.timestamp})\n`;
    if (msg.toolCalls && msg.toolCalls.length > 0) {
      md_content += `*Tool Executions (${msg.toolCalls.length}):*\n`;
      msg.toolCalls.forEach((tool) => {
        md_content += `- [${tool.type}] ${tool.title}\n`;
        if (tool.reasoningFull) {
          md_content += `  > Reasoning: ${tool.reasoningFull.replace(/\n/g, '\n  > ')}\n`;
        }
      });
      md_content += `\n`;
    }
    md_content += `${msg.content}\n\n`;
  });

  return md_content;
};
