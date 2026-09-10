import { Message, SessionStats, ProducedFile } from './types';

export const INITIAL_PRODUCED_FILE: ProducedFile = {
  name: 'search_tree.py',
  path: '/Users/waldo/Documents/AnonymousData/search_tree.py',
  size: '3.4 KB',
  language: 'python',
  content: `#!/usr/bin/env python3
"""
search_tree.py — Recursively search files and folders and display them.

Usage:
    python search_tree.py <directory>           # list everything
    python search_tree.py <directory> "*.py"    # only names matching pattern
    python search_tree.py <directory> "report"  # substring match (no wildcard)
"""

import os
import sys
import fnmatch
from pathlib import Path

def print_tree(directory, pattern="*", max_depth=5, current_depth=0):
    """Recursively lists directory contents matching pattern."""
    if current_depth > max_depth:
        return

    try:
        entries = sorted(os.scandir(directory), key=lambda e: (not e.is_dir(), e.name.lower()))
    except PermissionError:
        print("  " * current_depth + "└── [Permission Denied]")
        return

    for entry in entries:
        is_match = fnmatch.fnmatch(entry.name, pattern) or pattern in entry.name
        if entry.is_dir(follow_symlinks=False):
            if not entry.name.startswith("."):
                print("  " * current_depth + f"📁 {entry.name}/")
                print_tree(entry.path, pattern, max_depth, current_depth + 1)
        elif is_match:
            size_kb = entry.stat().st_size / 1024
            print("  " * current_depth + f"├── 📄 {entry.name} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    search_pattern = sys.argv[2] if len(sys.argv) > 2 else "*"
    print(f"Scanning '{target_dir}' for pattern: '{search_pattern}'...")
    print_tree(target_dir, search_pattern)
    print("Done scanning.")
`,
};

export const INITIAL_MESSAGES: Message[] = [
  // Turn 1
  {
    id: 'msg-1',
    sender: 'user',
    timestamp: '9/9 14:22',
    content: 'hi',
  },
  {
    id: 'msg-2',
    sender: 'assistant',
    timestamp: '9/9 14:22',
    content: 'Hi! 👋 What can I help you with today?',
    toolCallsSummary: 'Thought for a while',
    toolCalls: [
      {
        id: 'tc-greet',
        type: 'think',
        title: 'User greeted with "hi". Prepare friendly greeting and offer assistance with code debugging, architecture, or shell tasks.',
        reasoningFull: `### User Intent Analysis
The user initiated the session with a casual greeting.
- Initialize session context
- Maintain ready state for codebase analysis in /Users/waldo/Documents/AnonymousData
- Keep response concise and friendly.`,
        isGenerating: false,
      },
    ],
  },

  // Turn 2
  {
    id: 'msg-3',
    sender: 'user',
    timestamp: '9/9 14:25',
    content: 'give me a python code to search files and folder and display it',
  },
  {
    id: 'msg-4',
    sender: 'assistant',
    timestamp: '9/9 14:25',
    content: `Here's a clean, self-contained Python script that recursively searches files and folders and displays them. It can either list the whole directory tree or filter by a name pattern (supports * wildcards).`,
    toolCallsSummary: 'Thought for a while',
    toolCalls: [
      {
        id: 'tc-plan-script',
        type: 'think',
        title: 'Plan a tree search script in Python with optional pattern matching, clean CLI syntax, and safety limits.',
        reasoningFull: `### Strategic Objective
Provide a robust, zero-dependency Python script that can traverse directories recursively and output a visual tree structure.

### Requirements:
1. Handle nested folder hierarchies with visual branch glyphs (📁, 📄, ├──, └──)
2. Support wildcard filtering (fnmatch) or substring matching
3. Include clear command line usage instructions in docstrings
4. Protect against recursive symlink cycles and PermissionError.`,
        isGenerating: false,
      },
    ],
    codeSnippets: [
      {
        lang: 'python',
        code: `#!/usr/bin/env python3
"""
search_tree.py — Recursively search files and folders and display them.

Usage:
    python search_tree.py <directory>           # list everything
    python search_tree.py <directory> "*.py"    # only names matching pattern
    python search_tree.py <directory> "report"  # substring match (no wildcard)
"""

import os
import sys
import fnmatch
from pathlib import Path

def print_tree(directory, pattern="*", max_depth=5, current_depth=0):
    """Recursively lists directory contents matching pattern."""
    if current_depth > max_depth:
        return

    try:
        entries = sorted(os.scandir(directory), key=lambda e: (not e.is_dir(), e.name.lower()))
    except PermissionError:
        print("  " * current_depth + "└── [Permission Denied]")
        return

    for entry in entries:
        is_match = fnmatch.fnmatch(entry.name, pattern) or pattern in entry.name
        if entry.is_dir(follow_symlinks=False):
            if not entry.name.startswith("."):
                print("  " * current_depth + f"📁 {entry.name}/")
                print_tree(entry.path, pattern, max_depth, current_depth + 1)
        elif is_match:
            size_kb = entry.stat().st_size / 1024
            print("  " * current_depth + f"├── 📄 {entry.name} ({size_kb:.1f} KB)")

if __name__ == "__main__":
    target_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    search_pattern = sys.argv[2] if len(sys.argv) > 2 else "*"
    print(f"Scanning '{target_dir}' for pattern: '{search_pattern}'...")
    print_tree(target_dir, search_pattern)
    print("Done scanning.")`,
      },
    ],
    usageTokens: 'Usage 38K tok',
    duration: 'Ran for 1m 15s',
  },
];

export const TURN_3_RESPONSE: Message = {
  id: 'msg-6',
  sender: 'assistant',
  timestamp: '9/9 14:38',
  content: `Done ✅ Created and tested it in your folder:

• File: \`search_tree.py\` at \`/Users/waldo/Documents/AnonymousData/\`
• Test run ( \`python3 search_tree.py . "*.py"\` ) worked — it found the 1 Python file in the folder.

Run it with:`,
  toolCallsSummary: '2 tool calls',
  toolCalls: [
    {
      id: 'tc-1',
      type: 'think',
      title: 'The user wants to create a file in "this folder" — the working directory is /Users/waldo/Documents/AnonymousData. Let me create search_tree.py with robust pattern filtering and safety limits.',
      reasoningFull: `### Strategic Objective
The user requested a Python tree search utility inside the current active workspace (/Users/waldo/Documents/AnonymousData).

### Planning & Architecture
1. Need a script capable of scanning directories recursively with depth caps.
2. Must support wildcard patterns (e.g. *.py) as well as substring keyword lookups (e.g. "report").
3. Should handle OS-level permissions safely without unhandled crashes.
4. Keep dependencies strictly within the Python standard library (os, sys, fnmatch, pathlib).

### Execution Steps
- Verify target path exists
- Write search_tree.py with 89 lines of clean formatted code
- Execute test run to confirm execution and non-zero discovery`,
      isGenerating: false,
    },
    {
      id: 'tc-2',
      type: 'write',
      title: 'search_tree.py',
      detail: '/Users/waldo/Documents/AnonymousData/search_tree.py',
      linesAdded: 89,
      linesRemoved: 0,
    },
    {
      id: 'tc-3',
      type: 'think',
      title: "The file has been created. Let's do a quick test to check if it works.",
      reasoningFull: `### Verification Step
The file write completed successfully with status 200 (89 lines created).
Now triggering a local shell execution test using:
\`python3 search_tree.py . "*.py"\`

Goals:
- Ensure no SyntaxError or indentation issues in Python 3 runtime
- Verify output formatting conforms to standard CLI terminal specifications
- Check exit code is 0`,
      isGenerating: false,
    },
    {
      id: 'tc-4',
      type: 'bash',
      title: 'Test the search script on the current folder',
      command: 'python3 search_tree.py . "*.py"',
      output: `Scanning '.' for pattern: '*.py'...
├── 📄 search_tree.py (3.4 KB)
Done scanning.`,
      executionTime: '0.42s',
    },
    {
      id: 'tc-5',
      type: 'think',
      title: 'The script works. It detected the file itself. Let me communicate this to the user.',
      reasoningFull: `### Final Synthesis
The test run output verified that the Python script correctly located \`search_tree.py\` in the folder and exited cleanly.
Preparing the response for the developer:
1. State creation and verification success.
2. Provide quick reference path and CLI commands for immediate execution.
3. Attach produced file reference.`,
      isGenerating: false,
    },
  ],
  codeSnippets: [
    {
      lang: 'bash',
      code: `cd /Users/waldo/Documents/AnonymousData
python3 search_tree.py .         # list everything
python3 search_tree.py . "*.py"  # filter by pattern
python3 search_tree.py . "report" # substring match`,
    },
  ],
  producedFiles: [INITIAL_PRODUCED_FILE],
  usageTokens: 'Usage 44K tok',
  duration: 'Ran for 2m 50s',
  turnUsageDetails: {
    totalTokens: '43,965 tok',
    model: 'ollama/qwen3.8-27b-a100-80g',
    uncachedInput: '42,926 tok',
    output: '1,039 tok',
  },
  turnTimeDetails: {
    totalRunTime: '2m 50s',
  },
  reaction: null,
};

export const TURN_4_RESPONSE: Message = {
  id: 'msg-8',
  sender: 'assistant',
  timestamp: '9/9 14:39',
  content: 'Ran successfully. Your folder contains a lot of data',
  toolCallsSummary: '3 tool calls · 1 message',
  statusBadge: 'Stopped',
  toolCalls: [
    {
      id: 'tc-6',
      type: 'bash',
      title: 'Execute search_tree.py on directory',
      command: 'python3 search_tree.py /Users/waldo/Documents/AnonymousData',
      output: `Scanning '/Users/waldo/Documents/AnonymousData' for pattern: '*'...
📁 Dataset_V1/
  ├── 📄 metadata.json (18.2 KB)
  ├── 📄 raw_records_2026.csv (412.8 KB)
📁 Cache/
  ├── 📄 index.db (1.2 MB)
├── 📄 search_tree.py (3.4 KB)
Done scanning: 142 items indexed.`,
      executionTime: '0.78s',
    },
    {
      id: 'tc-7',
      type: 'think',
      title: 'Evaluating standard stdout output and exit code 0...',
      reasoningFull: `### Output Analysis
- The command completed with returncode=0.
- Detected subdirectories \`Dataset_V1\` and \`Cache\` alongside multiple CSV, JSON and DB artifacts.
- Output contains 142 items. Summary is concise: "Ran successfully. Your folder contains a lot of data".`,
      isGenerating: false,
    },
    {
      id: 'tc-8',
      type: 'bash',
      title: 'Inspect summary count',
      command: 'find /Users/waldo/Documents/AnonymousData -type f | wc -l',
      output: '142',
      executionTime: '0.12s',
    },
  ],
  duration: 'Ran for 1m 40s',
  turnTimeDetails: {
    totalRunTime: '1m 40s',
  },
  reaction: null,
};

export const INITIAL_STATS: SessionStats = {
  turns: 4,
  steps: 9,
  llmTime: '10m33s',
  toolCallTime: '0.7s',
  ttft: '36.4s',
  tokSpeed: '14 tok/s',
  cacheHit: '0%',
  inputTok: '170K tok',
  outputTok: '4.1K tok',
};
