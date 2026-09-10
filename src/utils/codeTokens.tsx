import React from 'react';

// Standalone utility function in PascalCase per guidelines
export const RenderCodeTokens = (line_text: string): React.ReactNode => {
  // Strings & docstrings
  const token_parts = line_text.split(/("""[\s\S]*?"""|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g);

  return token_parts.map((part, part_index) => {
    if (
      part.startsWith('"""') || 
      (part.startsWith('"') && part.endsWith('"')) || 
      (part.startsWith("'") && part.endsWith("'"))
    ) {
      return (
        <span key={part_index} className="text-emerald-600 font-medium">
          {part}
        </span>
      );
    }

    // Keywords matching python / bash
    const word_tokens = part.split(/\b/);
    return (
      <span key={part_index}>
        {word_tokens.map((word, word_index) => {
          if (/^(def|class|import|from|return|if|elif|else|for|while|try|except|with|as|in|is|not|and|or|pass|break|continue)\b/.test(word)) {
            return (
              <span key={word_index} className="text-purple-600 font-medium">
                {word}
              </span>
            );
          }
          if (/^(cd|python3|python|bash|sh|node|npm|cat|find|wc|echo|chmod|mkdir)\b/.test(word)) {
            return (
              <span key={word_index} className="text-purple-600 font-medium">
                {word}
              </span>
            );
          }
          if (/^(print|len|sorted|range|open|scan_dir|str|int|float|list|dict|set)\b/.test(word)) {
            return (
              <span key={word_index} className="text-blue-600">
                {word}
              </span>
            );
          }
          if (/^\/[a-zA-Z0-9_\-\.\/]+/.test(word)) {
            return (
              <span key={word_index} className="text-blue-600">
                {word}
              </span>
            );
          }
          return <span key={word_index}>{word}</span>;
        })}
      </span>
    );
  });
};
