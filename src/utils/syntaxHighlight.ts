export function detectLanguageFromFilename(filename: string): string {
  if (!filename) return 'python';
  const lower = filename.toLowerCase();
  if (lower.endsWith('.py') || lower.endsWith('.ipynb')) return 'python';
  if (lower.endsWith('.sh') || lower.endsWith('.bash') || lower.endsWith('.zsh')) return 'bash';
  if (lower.endsWith('.cpp') || lower.endsWith('.cc') || lower.endsWith('.cxx') || lower.endsWith('.c') || lower.endsWith('.h') || lower.endsWith('.hpp')) return 'cpp';
  if (lower.endsWith('.sql')) return 'sql';
  if (lower.endsWith('.json')) return 'json';
  if (lower.endsWith('.md')) return 'markdown';
  return 'python';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * High-performance syntax highlighter matching the exact AI Code Writer styling:
 * - Keywords: text-blue-700 font-semibold (#1d4ed8)
 * - Strings: text-amber-800 (#92400e)
 * - Comments: text-emerald-700 (#047857)
 * - Numbers: text-emerald-800 font-medium (#065f46)
 * - Default Text: text-zinc-900 (#18181b)
 */
export function highlightCode(code: string, language: string = 'python'): string {
  if (!code) return '';
  const lang = (language || 'python').toLowerCase();

  const lines = code.split('\n');

  const highlightedLines = lines.map((line) => {
    if (!line) return '';

    // Shell or Python full line comment
    if (lang === 'bash' || lang === 'python' || lang === 'sh') {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('#')) {
        return `<span class="text-emerald-700">${escapeHtml(line)}</span>`;
      }
    }

    // C++ full line comment or preprocessor directives
    if (lang === 'cpp' || lang === 'c' || lang === 'h' || lang === 'hpp') {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('//')) {
        return `<span class="text-emerald-700">${escapeHtml(line)}</span>`;
      }
      if (trimmed.startsWith('#include') || trimmed.startsWith('#define') || trimmed.startsWith('#pragma') || trimmed.startsWith('#ifdef') || trimmed.startsWith('#endif')) {
        return `<span class="text-blue-700 font-semibold">${escapeHtml(line)}</span>`;
      }
    }

    // SQL full line comment
    if (lang === 'sql') {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('--')) {
        return `<span class="text-emerald-700">${escapeHtml(line)}</span>`;
      }
    }

    // Token regex per language
    let regex: RegExp;
    let keywordCheck: (tok: string) => boolean;

    if (lang === 'bash' || lang === 'sh') {
      regex = /(\b(?:if|then|else|elif|fi|for|in|do|done|while|until|case|esac|echo|export|set|mkdir|rm|cp|mv|grep|cd|python3|python|exit|sudo|curl|chmod|return)\b|"[^"]*"|'[^']*'|#.*$|\b\d+\b)/g;
      keywordCheck = (t) => /^(if|then|else|elif|fi|for|in|do|done|while|until|case|esac|echo|export|set|mkdir|rm|cp|mv|grep|cd|python3|python|exit|sudo|curl|chmod|return)$/.test(t);
    } else if (lang === 'cpp' || lang === 'c' || lang === 'h' || lang === 'hpp') {
      regex = /(\b(?:namespace|struct|class|public|private|protected|virtual|int|float|double|void|bool|char|const|return|auto|for|while|if|else|switch|case|break|continue|new|delete|template|typename|std|cout|cin|endl)\b|"[^"]*"|'[^']*'|\/\/.*$|\b\d+(?:\.\d+)?f?\b)/g;
      keywordCheck = (t) => /^(namespace|struct|class|public|private|protected|virtual|int|float|double|void|bool|char|const|return|auto|for|while|if|else|switch|case|break|continue|new|delete|template|typename|std|cout|cin|endl)$/.test(t);
    } else if (lang === 'sql') {
      regex = /(\b(?:SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|HAVING|LIMIT|AS|AND|OR|NOT|IN|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|UNION|ALL|DISTINCT|COUNT|AVG|SUM|MIN|MAX|ROUND)\b|'[^']*'|--.*$|\b\d+\b)/gi;
      keywordCheck = (t) => /^(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|HAVING|LIMIT|AS|AND|OR|NOT|IN|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|UNION|ALL|DISTINCT|COUNT|AVG|SUM|MIN|MAX|ROUND)$/i.test(t);
    } else if (lang === 'json') {
      regex = /("[^"]*"(?=\s*:)|"[^"]*"|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?)/g;
      keywordCheck = (t) => /^(true|false|null)$/.test(t);
    } else {
      // Python (Default and Jupyter code cells)
      regex = /(\b(?:import|from|as|def|return|for|in|if|else|elif|try|except|finally|raise|yield|print|while|class|with|lambda|pass|break|continue|assert|True|False|None|async|await|global)\b|"[^"]*"|'[^']*'|#.*$|\b\d+(?:\.\d+)?\b)/g;
      keywordCheck = (t) => /^(import|from|as|def|return|for|in|if|else|elif|try|except|finally|raise|yield|print|while|class|with|lambda|pass|break|continue|assert|True|False|None|async|await|global)$/.test(t);
    }

    const parts = line.split(regex);
    return parts
      .map((token) => {
        if (!token) return '';
        if (keywordCheck(token)) {
          return `<span class="text-blue-700 font-semibold">${escapeHtml(token)}</span>`;
        }
        if (token.startsWith('"') || token.startsWith("'")) {
          return `<span class="text-amber-800">${escapeHtml(token)}</span>`;
        }
        if (token.startsWith('#') || token.startsWith('//') || token.startsWith('--')) {
          return `<span class="text-emerald-700">${escapeHtml(token)}</span>`;
        }
        if (/^\d+(?:\.\d+)?f?$/.test(token)) {
          return `<span class="text-emerald-800 font-medium">${escapeHtml(token)}</span>`;
        }
        return `<span class="text-zinc-900">${escapeHtml(token)}</span>`;
      })
      .join('');
  });

  return highlightedLines.join('\n');
}
