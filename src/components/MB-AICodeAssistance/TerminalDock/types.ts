import { TerminalPosition } from '../../../types';

export type TerminalTab = 'terminal' | 'output' | 'debug';

export interface TerminalDockProps {
  isOpen: boolean;
  onToggle: () => void;
  outputLines?: string[];
  position?: TerminalPosition;
  onChangePosition?: (position: TerminalPosition) => void;
}

export interface PositionOption {
  id: TerminalPosition;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}
