import { NotebookData } from './types';

export const INITIAL_NOTEBOOK: NotebookData = {
  title: 'test',
  path: 'home > test',
  kernel: 'Python 3',
  kernelStatus: 'idle',
  gpu: 'none (CPU only)',
  cells: [
    {
      id: 'cell-0-md',
      type: 'markdown',
      headerTitle: 'Cell 0 — Setup and helpers',
      source: '### Cell 0 — Setup and helpers\nInitialize base paths, timestamp run folders, and helper utilities for recursive directory inspection.',
      executionCount: null,
      status: 'idle',
    },
    {
      id: 'cell-0-code',
      type: 'code',
      executionCount: 4,
      status: 'success',
      source: `import os, shutil, time, hashlib
from pathlib import Path
from datetime import datetime
import pandas as pd

# -- Point this at a project folder visible in the Explorer ------
BASE = Path.cwd() / "sync_test"     # change if your project folder is different
RUN = datetime.now().strftime("%Y%m%d_%H%M%S")
ROOT = BASE / f"run_{RUN}"          # timestamped so reruns start fresh
ROOT.mkdir(parents=True, exist_ok=True)

def tree(root: Path = ROOT, prefix: str = ""):
    """Print a directory tree so you can compare against the Explorer."""
    entries = sorted(root.iterdir(), key=lambda p: (p.is_file(), p.name))
    for i, p in enumerate(entries):
        last = i == len(entries) - 1
        print(f"{prefix}{'└── ' if last else '├── '}{p.name}{'/' if p.is_dir() else ''}")
        if p.is_dir():
            tree(p, prefix + ("    " if last else "│   "))`,
      outputs: [
        {
          type: 'text',
          content: 'Directory tree helper and base directories initialized.\nROOT: /home/jovyan/sync_test/run_20260919_043653',
        },
      ],
    },
    {
      id: 'cell-1-md',
      type: 'markdown',
      headerTitle: 'Cell 1 — Clinical Data Ingestion & Manifest Validation',
      source: '### Cell 1 — Clinical Data Ingestion & Manifest Validation\nQuery SQLite patient cohort database and check DICOM volume paths in MB-DATA storage.',
      executionCount: null,
      status: 'idle',
    },
    {
      id: 'cell-1-code',
      type: 'code',
      executionCount: 5,
      status: 'success',
      source: `import json
import sqlite3

# Inspect cohort database in MB-DATA mounts
db_path = "/Users/waldo/Documents/AnonymousData/database/clinical_patients.sqlite"
print(f"Connecting to: {db_path}")

# Verified 142 DICOM studies with zero corrupted slices
print("✓ Verified 142 DICOM study series across 18 patient cohorts.")`,
      outputs: [
        {
          type: 'text',
          content: 'Connecting to: /Users/waldo/Documents/AnonymousData/database/clinical_patients.sqlite\n✓ Verified 142 DICOM study series across 18 patient cohorts.',
        },
      ],
    },
    {
      id: 'cell-13-md',
      type: 'markdown',
      headerTitle: 'Cell 13 — Cleanup (optional)',
      source: '### Cell 13 — Cleanup (optional)\nRemoves test artifacts and temporary folders from the run session.',
      executionCount: null,
      status: 'idle',
    },
    {
      id: 'cell-13-code',
      type: 'code',
      executionCount: 2,
      status: 'error',
      source: `import shutil
shutil.rmtree(ROOT)
print(f"removed test root {ROOT.name}/")`,
      outputs: [
        {
          type: 'error',
          ename: 'NameError',
          evalue: "name 'ROOT' is not defined",
          content: "name 'ROOT' is not defined",
          traceback: [
            '---------------------------------------------------------------------------',
            'NameError                                 Traceback (most recent call last)',
            'Cell In[2], line 2',
            '      1 import shutil',
            '----> 2 shutil.rmtree(ROOT)',
            'NameError: name \'ROOT\' is not defined',
          ],
        },
      ],
    },
  ],
};
