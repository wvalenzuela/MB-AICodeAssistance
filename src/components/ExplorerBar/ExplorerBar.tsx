import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  FileText, 
  FileCode, 
  FileArchive, 
  RotateCw, 
  FilePlus, 
  FolderPlus, 
  Upload, 
  ChevronsUpDown, 
  HardDrive, 
  Database, 
  BookOpen, 
  Lock,
  File
} from 'lucide-react';
import { ProducedFile } from '../../types';

export interface ExplorerBarProps {
  isOpen: boolean;
  onClose: () => void;
  producedFiles?: ProducedFile[];
  onSelectFile: (file: ProducedFile) => void;
  onShowToast?: (message: string) => void;
}

// Protected MB-DATA cluster items matching Image 1
interface MbDataItem {
  name: string;
  type: 'folder' | 'file';
  locked: boolean;
  size?: string;
  children?: string[];
}

const MB_DATA_ITEMS: MbDataItem[] = [
  { name: 'cache', type: 'folder', locked: true, children: ['cache_meta.json', 'tokens.bin', 'session_embeddings.h5'] },
  { name: 'database', type: 'folder', locked: true, children: ['clinical_patients.sqlite', 'telemetry.db', 'schema_v4.sql'] },
  { name: 'dicoms', type: 'folder', locked: true, children: ['CT_LUNG_001.dcm', 'MRI_BRAIN_T1.dcm', 'XR_CHEST_AP.dcm'] },
  { name: 'files', type: 'folder', locked: true, children: ['dataset_manifest.csv', 'cohort_filters.json', 'labels.txt'] },
  { name: 'h5_temp', type: 'folder', locked: true, children: ['materialize_cache_491.h5', 'scratch_tensor.h5'] },
  { name: 'home', type: 'folder', locked: true, children: ['jovyan', 'shared_workspace', 'bash_profile'] },
  { name: 'jupyter', type: 'folder', locked: true, children: ['dicom_preprocessing.ipynb', 'model_inference_pipeline.ipynb'] },
  { name: 'mb_data', type: 'folder', locked: true, children: ['manifest_global.json', 'cluster_endpoints.yaml'] },
  { name: 'mysql-slave-3', type: 'folder', locked: true, children: ['relay-bin.000142', 'ibdata1', 'auto.cnf'] },
  { name: 'prophet', type: 'folder', locked: true, children: ['prophet_model.pkl', 'timeseries_forecast.parquet'] },
  { name: 'rsync_slave1.sh', type: 'file', locked: true, size: '1.8 KB' },
  { name: 'share', type: 'folder', locked: true, children: ['public_models', 'benchmarks', 'pretrained_weights'] },
  { name: 'tmp', type: 'folder', locked: true, children: ['lock_run_2894.pid', 'telemetry_staging'] },
  { name: 'tmp_h5_materialize', type: 'folder', locked: true, children: ['slice_buffer_00.h5', 'slice_buffer_01.h5'] },
];

export const ExplorerBar: React.FC<ExplorerBarProps> = ({
  isOpen,
  onClose,
  producedFiles = [],
  onSelectFile,
  onShowToast,
}) => {
  // Accordion section collapse states
  const [isHomeOpen, setIsHomeOpen] = useState(true);
  const [isMountsOpen, setIsMountsOpen] = useState(true);
  const [isSharedOpen, setIsSharedOpen] = useState(true);
  const [isMbDataOpen, setIsMbDataOpen] = useState(true);

  // Home Folder tree expansion state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'jobs': true,
    'Projects': false,
    'Codes': false,
    'DICOM_THAT_FAIL': false,
    'wvalenzuela': false,
  });

  // MB-DATA folder expansion state
  const [expandedMbFolders, setExpandedMbFolders] = useState<Record<string, boolean>>({});

  // Selected file highlight
  const [selectedFileName, setSelectedFileName] = useState<string>('file.py');

  // Context menu state
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

  if (!isOpen) return null;

  const toggleFolder = (folderName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const toggleMbFolder = (folderName: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedMbFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const handleSelectFile = (fileItem: { name: string; size?: string; content?: string }) => {
    setSelectedFileName(fileItem.name);

    const existing = producedFiles.find((f) => f.name === fileItem.name);
    if (existing) {
      onSelectFile(existing);
    } else {
      onSelectFile({
        name: fileItem.name,
        path: `/${fileItem.name}`,
        size: fileItem.size || '2.4 KB',
        language: fileItem.name.endsWith('.sh') ? 'bash' : fileItem.name.endsWith('.json') ? 'json' : 'python',
        content: `# Medical-Blocks Automated Workspace\n# File: ${fileItem.name}\n\nimport os\nimport sys\n\ndef run():\n    print("Executing Medical-Blocks clinical workflow in ${fileItem.name}")\n\nif __name__ == '__main__':\n    run()\n`,
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  };

  const handleCreateFile = () => {
    setContextMenuPos(null);
    const newName = `script_${Math.floor(Math.random() * 900 + 100)}.py`;
    onShowToast?.(`Created ${newName} in workspace`);
    handleSelectFile({ name: newName, size: '1.2 KB' });
  };

  const handleCreateFolder = () => {
    setContextMenuPos(null);
    onShowToast?.('New folder created in /home');
  };

  // Render appropriate file icon
  const renderFileIcon = (fileType?: string, fileName?: string) => {
    if (fileType === 'python' || fileName?.endsWith('.py')) {
      return (
        <span className="w-3.5 h-3.5 rounded-xs bg-[#3776ab] flex items-center justify-center text-white text-[9px] font-bold shrink-0 shadow-2xs">
          py
        </span>
      );
    }
    if (fileType === 'bash' || fileName?.endsWith('.sh')) {
      return (
        <span className="w-3.5 h-3.5 rounded-xs bg-[#4b5563] flex items-center justify-center text-white text-[9px] font-mono shrink-0 shadow-2xs">
          sh
        </span>
      );
    }
    if (fileType === 'notebook' || fileName?.endsWith('.ipynb')) {
      return (
        <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
      );
    }
    if (fileType === 'pdf' || fileName?.endsWith('.pdf')) {
      return (
        <span className="w-3.5 h-3.5 rounded-xs bg-rose-600 flex items-center justify-center text-white text-[8px] font-bold shrink-0 shadow-2xs">
          PDF
        </span>
      );
    }
    if (fileType === 'archive' || fileName?.endsWith('.zip')) {
      return (
        <FileArchive className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
      );
    }
    return (
      <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
    );
  };

  return (
    <aside 
      className="w-72 sm:w-80 h-full bg-[#f8fafc] border-r border-zinc-200/90 flex flex-col shrink-0 select-none z-20 text-zinc-700 font-sans shadow-xs relative"
      onContextMenu={handleContextMenu}
    >
      {/* Top Header: EXPLORER and Close X Button */}
      <div className="h-10 px-3 bg-[#eef2f6] border-b border-zinc-200/80 flex items-center justify-between shrink-0">
        <span className="text-[11px] font-bold tracking-wider text-zinc-700 uppercase">
          Explorer
        </span>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer"
          title="Close Explorer"
          aria-label="Close Explorer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Accordion Sections Scroll Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-zinc-200/70 text-xs">
        
        {/* ========================================================================= */}
        {/* SECTION 1: HOME (EXPLORER FILE TREE) */}
        {/* ========================================================================= */}
        <div>
          {/* Section Header with Actions Toolbar */}
          <div 
            onClick={() => setIsHomeOpen(!isHomeOpen)}
            className="group flex items-center justify-between px-2.5 py-1.5 bg-[#f1f5f9]/70 hover:bg-[#e2e8f0]/60 cursor-pointer font-bold text-zinc-700 tracking-tight transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {isHomeOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              )}
              <span className="text-xs uppercase tracking-wide">Home</span>
            </div>

            {/* Quick Actions Toolbar */}
            <div 
              className="flex items-center gap-1 opacity-80 group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleCreateFile}
                className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-white rounded transition-colors cursor-pointer"
                title="New File"
              >
                <FilePlus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCreateFolder}
                className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-white rounded transition-colors cursor-pointer"
                title="New Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onShowToast?.('Ready for file drag-and-drop or upload')}
                className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-white rounded transition-colors cursor-pointer"
                title="Upload Files"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onShowToast?.('Workspace refreshed')}
                className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-white rounded transition-colors cursor-pointer"
                title="Refresh"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  const anyOpen = Object.values(expandedFolders).some(Boolean);
                  const nextState = Object.keys(expandedFolders).reduce((acc, k) => {
                    acc[k] = !anyOpen;
                    return acc;
                  }, {} as Record<string, boolean>);
                  setExpandedFolders(nextState);
                }}
                className="p-1 text-zinc-500 hover:text-zinc-900 hover:bg-white rounded transition-colors cursor-pointer"
                title="Collapse/Expand All"
              >
                <ChevronsUpDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* File & Folder List */}
          {isHomeOpen && (
            <div className="py-1 px-1 font-mono text-[11px] leading-tight space-y-0.5">
              {/* Folder: A */}
              <div 
                onClick={() => toggleFolder('A')}
                className="flex items-center gap-1.5 px-2 py-1 hover:bg-zinc-200/50 rounded cursor-pointer text-zinc-700"
              >
                <ChevronRight className={`w-3 h-3 text-zinc-400 transition-transform ${expandedFolders['A'] ? 'rotate-90' : ''}`} />
                <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-400/20" />
                <span className="truncate">A</span>
              </div>

              {/* Folder: jobs (Expanded by default) */}
              <div>
                <div 
                  onClick={() => toggleFolder('jobs')}
                  className="flex items-center gap-1.5 px-2 py-1 hover:bg-zinc-200/50 rounded cursor-pointer text-zinc-700"
                >
                  <ChevronRight className={`w-3 h-3 text-zinc-400 transition-transform ${expandedFolders['jobs'] ? 'rotate-90' : ''}`} />
                  {expandedFolders['jobs'] ? (
                    <FolderOpen className="w-3.5 h-3.5 text-amber-500 fill-amber-400/20" />
                  ) : (
                    <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-400/20" />
                  )}
                  <span className="truncate font-semibold">jobs</span>
                </div>

                {expandedFolders['jobs'] && (
                  <div className="pl-4 space-y-0.5">
                    {/* Subfolder: home */}
                    <div 
                      onClick={() => toggleFolder('jobs_home')}
                      className="flex items-center gap-1.5 px-2 py-1 hover:bg-zinc-200/50 rounded cursor-pointer text-zinc-700"
                    >
                      <ChevronRight className={`w-3 h-3 text-zinc-400 transition-transform ${expandedFolders['jobs_home'] ? 'rotate-90' : ''}`} />
                      <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-400/20" />
                      <span className="truncate">home</span>
                    </div>

                    {/* Subfolder: other */}
                    <div 
                      onClick={() => toggleFolder('jobs_other')}
                      className="flex items-center gap-1.5 px-2 py-1 hover:bg-zinc-200/50 rounded cursor-pointer text-zinc-700"
                    >
                      <ChevronRight className={`w-3 h-3 text-zinc-400 transition-transform ${expandedFolders['jobs_other'] ? 'rotate-90' : ''}`} />
                      <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-400/20" />
                      <span className="truncate">other</span>
                    </div>

                    {/* Files inside jobs */}
                    <div 
                      onClick={() => handleSelectFile({ name: 'codeforge-editor-test-1784.py', size: '3.1 KB' })}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        selectedFileName === 'codeforge-editor-test-1784.py' ? 'bg-[#dbeafe] text-[#1e40af] font-medium' : 'hover:bg-zinc-200/50 text-zinc-700'
                      }`}
                    >
                      {renderFileIcon('python')}
                      <span className="truncate">codeforge-editor-test-1784...</span>
                    </div>

                    <div 
                      onClick={() => handleSelectFile({ name: 'e2e_284d13cc.py', size: '4.8 KB' })}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        selectedFileName === 'e2e_284d13cc.py' ? 'bg-[#dbeafe] text-[#1e40af] font-medium' : 'hover:bg-zinc-200/50 text-zinc-700'
                      }`}
                    >
                      {renderFileIcon('python')}
                      <span className="truncate">e2e_284d13cc.py</span>
                    </div>

                    <div 
                      onClick={() => handleSelectFile({ name: 'file.py', size: '2.4 KB' })}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        selectedFileName === 'file.py' ? 'bg-[#dbeafe] text-[#1e40af] font-medium' : 'hover:bg-zinc-200/50 text-zinc-700'
                      }`}
                    >
                      {renderFileIcon('python')}
                      <span className="truncate">file.py</span>
                    </div>

                    <div 
                      onClick={() => handleSelectFile({ name: 'main_2.py', size: '2.1 KB' })}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        selectedFileName === 'main_2.py' ? 'bg-[#dbeafe] text-[#1e40af] font-medium' : 'hover:bg-zinc-200/50 text-zinc-700'
                      }`}
                    >
                      {renderFileIcon('python')}
                      <span className="truncate">main_2.py</span>
                    </div>

                    <div 
                      onClick={() => handleSelectFile({ name: 'main-1784647566271.py', size: '1.9 KB' })}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        selectedFileName === 'main-1784647566271.py' ? 'bg-[#dbeafe] text-[#1e40af] font-medium' : 'hover:bg-zinc-200/50 text-zinc-700'
                      }`}
                    >
                      {renderFileIcon('python')}
                      <span className="truncate">main-1784647566271.py</span>
                    </div>

                    <div 
                      onClick={() => handleSelectFile({ name: 'test_01.sh', size: '0.9 KB' })}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        selectedFileName === 'test_01.sh' ? 'bg-[#dbeafe] text-[#1e40af] font-medium' : 'hover:bg-zinc-200/50 text-zinc-700'
                      }`}
                    >
                      {renderFileIcon('bash')}
                      <span className="truncate">test_01.sh</span>
                    </div>

                    <div 
                      onClick={() => handleSelectFile({ name: 'test_02.sh', size: '1.1 KB' })}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        selectedFileName === 'test_02.sh' ? 'bg-[#dbeafe] text-[#1e40af] font-medium' : 'hover:bg-zinc-200/50 text-zinc-700'
                      }`}
                    >
                      {renderFileIcon('bash')}
                      <span className="truncate">test_02.sh</span>
                    </div>

                    <div 
                      onClick={() => handleSelectFile({ name: 'test-01-1785232443264.sh', size: '1.4 KB' })}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        selectedFileName === 'test-01-1785232443264.sh' ? 'bg-[#dbeafe] text-[#1e40af] font-medium' : 'hover:bg-zinc-200/50 text-zinc-700'
                      }`}
                    >
                      {renderFileIcon('bash')}
                      <span className="truncate">test-01-1785232443264.sh</span>
                    </div>

                    <div 
                      onClick={() => handleSelectFile({ name: 'test-12.sh', size: '0.8 KB' })}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        selectedFileName === 'test-12.sh' ? 'bg-[#dbeafe] text-[#1e40af] font-medium' : 'hover:bg-zinc-200/50 text-zinc-700'
                      }`}
                    >
                      {renderFileIcon('bash')}
                      <span className="truncate">test-12.sh</span>
                    </div>

                    <div 
                      onClick={() => handleSelectFile({ name: 'test-13-1785223650937.sh', size: '1.3 KB' })}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        selectedFileName === 'test-13-1785223650937.sh' ? 'bg-[#dbeafe] text-[#1e40af] font-medium' : 'hover:bg-zinc-200/50 text-zinc-700'
                      }`}
                    >
                      {renderFileIcon('bash')}
                      <span className="truncate">test-13-1785223650937.sh</span>
                    </div>

                    <div 
                      onClick={() => handleSelectFile({ name: 'test-new-ai-1787216470030.sh', size: '2.0 KB' })}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        selectedFileName === 'test-new-ai-1787216470030.sh' ? 'bg-[#dbeafe] text-[#1e40af] font-medium' : 'hover:bg-zinc-200/50 text-zinc-700'
                      }`}
                    >
                      {renderFileIcon('bash')}
                      <span className="truncate">test-new-ai-1787216470030...</span>
                    </div>

                    <div 
                      onClick={() => handleSelectFile({ name: 'test.py', size: '1.7 KB' })}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        selectedFileName === 'test.py' ? 'bg-[#dbeafe] text-[#1e40af] font-medium' : 'hover:bg-zinc-200/50 text-zinc-700'
                      }`}
                    >
                      {renderFileIcon('python')}
                      <span className="truncate">test.py</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Other Workspace Folders matching screenshot */}
              {[
                'jobs_test',
                'jovyan',
                'Projects',
                'Codes',
                'DICOM_THAT_FAIL',
                'Dockers',
                'Documents',
                'DPAI',
                'sync_test',
                'wvalenzuela',
              ].map((folder) => (
                <div 
                  key={folder}
                  onClick={() => toggleFolder(folder)}
                  className="flex items-center gap-1.5 px-2 py-1 hover:bg-zinc-200/50 rounded cursor-pointer text-zinc-700"
                >
                  <ChevronRight className={`w-3 h-3 text-zinc-400 transition-transform ${expandedFolders[folder] ? 'rotate-90' : ''}`} />
                  <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-400/20" />
                  <span className="truncate">{folder}</span>
                </div>
              ))}

              {/* Dynamic Produced Files from Session (search_tree.py) */}
              {producedFiles.map((file) => (
                <div 
                  key={file.name}
                  onClick={() => handleSelectFile(file)}
                  className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer transition-colors ${
                    selectedFileName === file.name ? 'bg-[#dbeafe] text-[#1e40af] font-medium' : 'hover:bg-zinc-200/50 text-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {renderFileIcon(undefined, file.name)}
                    <span className="truncate font-semibold text-sky-900">{file.name}</span>
                  </div>
                  <span className="text-[9px] bg-sky-100 text-sky-800 px-1 rounded">active</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: MOUNTS */}
        {/* ========================================================================= */}
        <div>
          <div 
            onClick={() => setIsMountsOpen(!isMountsOpen)}
            className="flex items-center justify-between px-2.5 py-1.5 bg-[#f1f5f9]/70 hover:bg-[#e2e8f0]/60 cursor-pointer font-bold text-zinc-700 tracking-tight transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {isMountsOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              )}
              <span className="text-xs uppercase tracking-wide">Mounts</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShowToast?.('Mount points verified: SIGNATURE [rw], DATA_DRIVE [rw]');
              }}
              className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-white rounded transition-colors cursor-pointer"
              title="Refresh Mounts"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {isMountsOpen && (
            <div className="py-1 px-1 font-mono text-[11px] space-y-1">
              <div 
                onClick={() => onShowToast?.('Mounted point: /mounts/SIGNATURE (Read/Write enabled)')}
                className="flex items-center justify-between px-2 py-1 hover:bg-zinc-200/50 rounded cursor-pointer text-zinc-700"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <ChevronRight className="w-3 h-3 text-zinc-400" />
                  <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-400/20 shrink-0" />
                  <span className="truncate font-medium">SIGNATURE</span>
                </div>
                <span className="px-1.5 py-0.2 bg-amber-500 text-white font-bold text-[10px] rounded-full shrink-0">
                  rw
                </span>
              </div>

              <div 
                onClick={() => onShowToast?.('Mounted point: /mounts/DATA_DRIVE (Read/Write enabled)')}
                className="flex items-center justify-between px-2 py-1 hover:bg-zinc-200/50 rounded cursor-pointer text-zinc-700"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <ChevronRight className="w-3 h-3 text-zinc-400" />
                  <HardDrive className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span className="truncate font-medium">DATA_DRIVE</span>
                </div>
                <span className="px-1.5 py-0.2 bg-amber-500 text-white font-bold text-[10px] rounded-full shrink-0">
                  rw
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: SHARED */}
        {/* ========================================================================= */}
        <div>
          <div 
            onClick={() => setIsSharedOpen(!isSharedOpen)}
            className="flex items-center justify-between px-2.5 py-1.5 bg-[#f1f5f9]/70 hover:bg-[#e2e8f0]/60 cursor-pointer font-bold text-zinc-700 tracking-tight transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {isSharedOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              )}
              <span className="text-xs uppercase tracking-wide">Shared</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShowToast?.('Shared folders checked: No new cohorts shared');
              }}
              className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-white rounded transition-colors cursor-pointer"
              title="Refresh Shared"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {isSharedOpen && (
            <div className="py-2.5 px-3 text-zinc-400 italic text-[11px]">
              No folders shared with you
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: MB-DATA (EXACTLY MATCHING IMAGE 1 WITH LOCK ICONS) */}
        {/* ========================================================================= */}
        <div>
          <div 
            onClick={() => setIsMbDataOpen(!isMbDataOpen)}
            className="flex items-center justify-between px-2.5 py-1.5 bg-[#f1f5f9]/70 hover:bg-[#e2e8f0]/60 cursor-pointer font-bold text-zinc-700 tracking-tight transition-colors"
          >
            <div className="flex items-center gap-1.5">
              {isMbDataOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              )}
              <span className="text-xs uppercase tracking-wide">MB-DATA</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShowToast?.('MB-DATA cluster read-only storage verified');
              }}
              className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-white rounded transition-colors cursor-pointer"
              title="Refresh MB-DATA"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {isMbDataOpen && (
            <div className="py-1 px-1 font-mono text-[11px] space-y-0.5">
              {MB_DATA_ITEMS.map((item) => {
                const isExpanded = expandedMbFolders[item.name];
                const isFolder = item.type === 'folder';

                return (
                  <div key={item.name}>
                    <div 
                      onClick={(e) => {
                        if (isFolder) {
                          toggleMbFolder(item.name, e);
                        } else {
                          handleSelectFile({
                            name: item.name,
                            size: item.size || '1.8 KB',
                            content: `#!/usr/bin/env bash\n# Medical-Blocks MB-DATA Cluster Sync Script\n# ${item.name}\n\necho "Synchronizing slave 1 cluster storage..."\nrsync -avz /data/dicoms/ node2:/backup/dicoms/\necho "Sync complete."\n`,
                          });
                        }
                      }}
                      className="flex items-center justify-between px-2 py-1 hover:bg-zinc-200/50 rounded cursor-pointer text-zinc-700 group transition-colors"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {/* Triangle / Chevron arrow */}
                        {isFolder ? (
                          <ChevronRight className={`w-3 h-3 text-zinc-400 shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        ) : (
                          <div className="w-3 shrink-0" />
                        )}

                        {/* Blue/indigo folder icon matching Image 1 */}
                        {isFolder ? (
                          <Folder className="w-3.5 h-3.5 text-[#5c6ac4] fill-[#5c6ac4]/20 shrink-0" />
                        ) : (
                          <File className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        )}

                        <span className="truncate text-zinc-800 group-hover:text-zinc-950 font-normal">
                          {item.name}
                        </span>
                      </div>

                      {/* Right-aligned Lock icon matching Image 1 */}
                      {item.locked && (
                        <div 
                          className="shrink-0 pl-1 text-zinc-400 group-hover:text-zinc-600"
                          title="Read-only cluster storage"
                        >
                          <Lock className="w-3 h-3 stroke-[1.8]" />
                        </div>
                      )}
                    </div>

                    {/* Sub-items if expanded */}
                    {isFolder && isExpanded && item.children && (
                      <div className="pl-6 space-y-0.5 text-zinc-600">
                        {item.children.map((child) => (
                          <div 
                            key={child}
                            onClick={() => handleSelectFile({ name: child, size: '2.8 KB' })}
                            className="flex items-center justify-between px-2 py-0.5 hover:bg-zinc-200/50 rounded cursor-pointer truncate"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <FileText className="w-3 h-3 text-zinc-400 shrink-0" />
                              <span className="truncate text-[10px]">{child}</span>
                            </div>
                            <Lock className="w-2.5 h-2.5 text-zinc-300 shrink-0" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Bottom Footer Status: "19 files · right-click to create" */}
      <div 
        onClick={() => setContextMenuPos({ x: 120, y: window.innerHeight - 80 })}
        className="h-7 px-3 bg-[#eef2f6] border-t border-zinc-200/80 flex items-center text-[11px] text-zinc-500 shrink-0 cursor-pointer hover:text-zinc-700 hover:bg-zinc-200/50 transition-colors"
        title="Click or right-click to create new files or folders"
      >
        <span>19 files · right-click to create</span>
      </div>

      {/* Context Menu on Right Click */}
      {contextMenuPos && (
        <>
          <div 
            className="fixed inset-0 z-50"
            onClick={() => setContextMenuPos(null)}
            onContextMenu={(e) => { e.preventDefault(); setContextMenuPos(null); }}
          />
          <div 
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-zinc-200 py-1 text-xs w-48 animate-in fade-in zoom-in-95 duration-75"
            style={{ 
              top: Math.min(contextMenuPos.y, window.innerHeight - 150), 
              left: Math.min(contextMenuPos.x, window.innerWidth - 200) 
            }}
          >
            <button
              type="button"
              onClick={handleCreateFile}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
            >
              <FilePlus className="w-3.5 h-3.5 text-sky-600" />
              <span>New File</span>
            </button>
            <button
              type="button"
              onClick={handleCreateFolder}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-500" />
              <span>New Folder</span>
            </button>
            <div className="h-px bg-zinc-100 my-1" />
            <button
              type="button"
              onClick={() => {
                setContextMenuPos(null);
                onShowToast?.('Workspace synchronized with remote Medical-Blocks container');
              }}
              className="w-full px-3 py-1.5 text-left flex items-center gap-2 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
              <span>Refresh Explorer</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

export default ExplorerBar;
