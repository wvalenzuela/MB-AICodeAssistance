import { NotebookCellItem, NotebookData, CellType, CellOutput } from '../../types';

export interface NotebookEditorProps {
  notebook: NotebookData;
  onUpdateNotebook: (updated: NotebookData | ((prev: NotebookData) => NotebookData)) => void;
  onAskAiToAssist?: (prompt: string, targetCellId?: string) => void;
  isAiGenerating?: boolean;
  activeCellId?: string | null;
  onSelectCell?: (id: string | null) => void;
  isSplitView?: boolean;
  onToggleSplitView?: () => void;
}

export type { NotebookCellItem, NotebookData, CellType, CellOutput };
