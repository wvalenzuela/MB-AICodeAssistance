import React from 'react';
import {
  LayoutGrid,
  Search,
  List,
  BarChart2,
  Code2,
  Waves,
  Building2,
  Image as ImageIcon,
  Grid3X3,
  Monitor,
  AudioWaveform,
  ClipboardCheck,
  Settings,
} from 'lucide-react';

export type NavItemKey = 
  | 'dashboard'
  | 'search'
  | 'lists'
  | 'metrics'
  | 'code'
  | 'signals'
  | 'clinics'
  | 'imaging'
  | 'matrix'
  | 'workstation'
  | 'waveforms'
  | 'tasks';

export interface SidebarProps {
  activeItem?: NavItemKey;
  onSelectItem?: (item: NavItemKey) => void;
  onOpenSettings?: () => void;
  isOpen?: boolean;
}

interface NavButtonConfig {
  key: NavItemKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavButtonConfig[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { key: 'search', label: 'Search', icon: Search },
  { key: 'lists', label: 'Lists', icon: List },
  { key: 'metrics', label: 'Metrics', icon: BarChart2 },
  { key: 'code', label: 'Code & Notebooks', icon: Code2 },
  { key: 'signals', label: 'Signals & Sequencing', icon: Waves },
  { key: 'clinics', label: 'Units & Clinics', icon: Building2 },
  { key: 'imaging', label: 'DICOM & Imaging', icon: ImageIcon },
  { key: 'matrix', label: 'Cohorts Matrix', icon: Grid3X3 },
  { key: 'workstation', label: 'Workstations', icon: Monitor },
  { key: 'waveforms', label: 'Telemetry & Waveforms', icon: AudioWaveform },
  { key: 'tasks', label: 'Tasks & AI Assistant', icon: ClipboardCheck },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem = 'tasks',
  onSelectItem,
  onOpenSettings,
  isOpen = true,
}) => {
  if (!isOpen) return null;

  return (
    <aside className="w-14 bg-white border-r border-t border-zinc-200/80 rounded-t-lg flex flex-col justify-between items-center py-2 select-none shrink-0 z-20">
      {/* Top Nav Items List */}
      <div className="flex flex-col items-center w-full gap-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelectItem?.(item.key)}
              title={item.label}
              className={`w-12 h-10 flex items-center justify-center transition-colors cursor-pointer rounded-xs ${
                isActive
                  ? 'bg-zinc-300 text-zinc-900 shadow-2xs font-semibold'
                  : 'text-zinc-800 hover:bg-zinc-100 hover:text-zinc-950'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2]" />
            </button>
          );
        })}
      </div>

      {/* Bottom Settings Button with Medical-Blocks teal square */}
      <div className="w-full flex justify-center pb-0.5">
        <button
          type="button"
          onClick={onOpenSettings}
          title="Medical-Blocks Settings"
          className="w-12 h-12 bg-[#00486b] hover:bg-[#003c58] text-white flex items-center justify-center transition-colors cursor-pointer rounded-xs shadow-xs"
        >
          <Settings className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
