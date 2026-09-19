import { useState, useRef, useCallback } from 'react';
import { NotebookData, NotebookCellItem, CellType, CellOutput } from '../../types';

export interface SimulateAiWriteOptions {
  prompt: string;
  targetCellId?: string;
  onComplete?: (cellId: string, summary: string) => void;
}

export function useNotebookAiSimulation(
  notebook: NotebookData,
  setNotebook: React.Dispatch<React.SetStateAction<NotebookData>>,
  onShowToast?: (message: string) => void
) {
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [streamingCellId, setStreamingCellId] = useState<string | null>(null);
  const activeIntervalRef = useRef<number | null>(null);
  const lastExecutedCellIdRef = useRef<string | null>(null);

  // 1. CREATE A NEW CELL
  const createCell = useCallback(
    (cellType: CellType = 'code'): string => {
      const newId = `cell-${Date.now().toString(36)}`;
      const newCell: NotebookCellItem = {
        id: newId,
        type: cellType,
        source: '',
        executionCount: null,
        status: 'idle',
        outputs: [],
      };

      setNotebook((prev) => ({
        ...prev,
        cells: [...prev.cells, newCell],
      }));

      // Scroll into view
      setTimeout(() => {
        const el = document.getElementById(newId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 80);

      onShowToast?.(`✓ Created new ${cellType} cell in notebook`);
      return newId;
    },
    [setNotebook, onShowToast]
  );

  // Stop active streaming
  const stopStreaming = useCallback(() => {
    if (activeIntervalRef.current) {
      clearInterval(activeIntervalRef.current);
      activeIntervalRef.current = null;
    }
    if (streamingCellId) {
      setNotebook((prev) => ({
        ...prev,
        cells: prev.cells.map((c) =>
          c.id === streamingCellId
            ? {
                ...c,
                isAiWriting: false,
                isStreaming: false,
                status: 'idle',
              }
            : c
        ),
      }));
    }
    setIsAiGenerating(false);
    setStreamingCellId(null);
    onShowToast?.('AI Code streaming paused');
  }, [streamingCellId, setNotebook, onShowToast]);

  // 2. STREAM OCT SEGMENTATION CODE
  const streamOctSegmentationCode = useCallback(
    (options?: { targetCellId?: string; onComplete?: (cellId: string) => void }) => {
      if (isAiGenerating) return;

      setIsAiGenerating(true);

      // Determine or create target cell
      let cellId = options?.targetCellId;
      if (!cellId) {
        cellId = `cell-oct-${Date.now().toString(36)}`;
        const newCell: NotebookCellItem = {
          id: cellId,
          type: 'code',
          source: '',
          executionCount: null,
          status: 'running',
          isAiWriting: true,
          isStreaming: true,
          streamingStatusText: 'Streaming PyTorch OCT Retinal Segmentation pipeline...',
          streamingSpeed: '78 tok/s',
          isOctSegmentation: true,
          outputs: [],
        };

        setNotebook((prev) => ({
          ...prev,
          cells: [...prev.cells, newCell],
        }));
      } else {
        setNotebook((prev) => ({
          ...prev,
          cells: prev.cells.map((c) =>
            c.id === cellId
              ? {
                  ...c,
                  isAiWriting: true,
                  isStreaming: true,
                  streamingStatusText: 'Streaming PyTorch OCT Retinal Segmentation pipeline...',
                  streamingSpeed: '78 tok/s',
                  isOctSegmentation: true,
                  source: '',
                  outputs: [],
                }
              : c
          ),
        }));
      }

      setStreamingCellId(cellId);
      lastExecutedCellIdRef.current = cellId;

      // Scroll target cell into view
      setTimeout(() => {
        const el = document.getElementById(cellId!);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);

      // The full Python OCT segmentation code
      const octCodeTokens = [
        '# Optical Coherence Tomography (OCT) Retinal Layer Segmentation\n',
        '# Target Anatomical Layers: ILM, IPL/INL, RPE, Choroid Boundary\n',
        'import torch\n',
        'import torch.nn as nn\n',
        'import numpy as np\n',
        'import matplotlib.pyplot as plt\n',
        'from pathlib import Path\n\n',
        'print("[Medical-Blocks OCT Engine] Initializing Retinal Layer Segmenter...")\n',
        'RETINAL_CLASSES = ["Background", "ILM", "IPL/INL", "RPE", "Choroid"]\n\n',
        'class RetinalUNet(nn.Module):\n',
        '    def __init__(self, in_channels=1, num_classes=5):\n',
        '        super().__init__()\n',
        '        self.encoder = nn.Sequential(\n',
        '            nn.Conv2d(in_channels, 32, kernel_size=3, padding=1),\n',
        '            nn.BatchNorm2d(32),\n',
        '            nn.ReLU(inplace=True),\n',
        '            nn.Conv2d(32, 64, kernel_size=3, padding=1),\n',
        '            nn.BatchNorm2d(64),\n',
        '            nn.ReLU(inplace=True)\n',
        '        )\n',
        '        self.pool = nn.MaxPool2d(2, 2)\n',
        '        self.bottleneck = nn.Sequential(\n',
        '            nn.Conv2d(64, 128, kernel_size=3, padding=2, dilation=2),\n',
        '            nn.BatchNorm2d(128),\n',
        '            nn.ReLU(inplace=True)\n',
        '        )\n',
        '        self.classifier = nn.Conv2d(128, num_classes, kernel_size=1)\n\n',
        '    def forward(self, x):\n',
        '        feat = self.encoder(x)\n',
        '        encoded = self.pool(feat)\n',
        '        bottleneck = self.bottleneck(encoded)\n',
        '        upsampled = nn.functional.interpolate(\n',
        '            bottleneck, size=x.shape[2:], mode="bilinear", align_corners=False\n',
        '        )\n',
        '        return self.classifier(upsampled)\n\n',
        '# Load model weights onto GPU device\n',
        'device = torch.device("cuda" if torch.cuda.is_available() else "cpu")\n',
        'model = RetinalUNet(in_channels=1, num_classes=5).to(device)\n',
        'print(f"✓ Model loaded with {sum(p.numel() for p in model.parameters()):,} parameters on {device}")\n\n',
        '# Simulate DICOM OCT B-Scan volume tensor (512x512)\n',
        'oct_bscan = torch.randn(1, 1, 512, 512).to(device)\n',
        'with torch.no_grad():\n',
        '    logits = model(oct_bscan)\n',
        '    segmentation_mask = torch.argmax(logits, dim=1).squeeze(0).cpu().numpy()\n\n',
        'print("✓ Segmentation inference complete: 5 retinal boundaries detected.")\n',
        'print("✓ Ready for clinical review. Run cell to view segmentation visualization.")\n',
      ];

      let currentTokenIdx = 0;
      let accumulatedCode = '';

      if (activeIntervalRef.current) {
        clearInterval(activeIntervalRef.current);
      }

      activeIntervalRef.current = window.setInterval(() => {
        if (currentTokenIdx < octCodeTokens.length) {
          accumulatedCode += octCodeTokens[currentTokenIdx];
          const snapshot = accumulatedCode;
          const randomSpeed = Math.floor(68 + Math.random() * 18);

          setNotebook((prev) => ({
            ...prev,
            cells: prev.cells.map((c) =>
              c.id === cellId
                ? {
                    ...c,
                    source: snapshot,
                    streamingSpeed: `${randomSpeed} tok/s`,
                  }
                : c
            ),
          }));

          currentTokenIdx++;
        } else {
          // Finished streaming
          if (activeIntervalRef.current) {
            clearInterval(activeIntervalRef.current);
            activeIntervalRef.current = null;
          }

          setNotebook((prev) => ({
            ...prev,
            cells: prev.cells.map((c) =>
              c.id === cellId
                ? {
                    ...c,
                    isAiWriting: false,
                    isStreaming: false,
                    status: 'idle',
                  }
                : c
            ),
          }));

          setIsAiGenerating(false);
          setStreamingCellId(null);
          onShowToast?.('✓ AI finished streaming OCT segmentation code into notebook');
          options?.onComplete?.(cellId);
        }
      }, 55);
    },
    [isAiGenerating, setNotebook, onShowToast]
  );

  // 3. EXECUTE LAST CELL
  const executeLastCell = useCallback(
    (onComplete?: (cellId: string) => void) => {
      // Find the last code cell, or the one just written
      let targetCell: NotebookCellItem | undefined;

      if (lastExecutedCellIdRef.current) {
        targetCell = notebook.cells.find((c) => c.id === lastExecutedCellIdRef.current);
      }

      if (!targetCell) {
        const codeCells = notebook.cells.filter((c) => c.type === 'code');
        targetCell = codeCells[codeCells.length - 1];
      }

      if (!targetCell) {
        onShowToast?.('No code cell found to execute');
        return;
      }

      const cellId = targetCell.id;
      lastExecutedCellIdRef.current = cellId;

      // Scroll into view
      const el = document.getElementById(cellId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Mark cell as running: In [*]:
      setNotebook((prev) => ({
        ...prev,
        cells: prev.cells.map((c) =>
          c.id === cellId
            ? {
                ...c,
                status: 'running',
                executionCount: null,
                outputs: [
                  {
                    type: 'text',
                    content: 'Executing in Python 3 kernel on NVIDIA A100 GPU...',
                  },
                ],
              }
            : c
        ),
      }));

      onShowToast?.(`▶ Executing cell ${cellId} in kernel...`);

      // Simulate kernel execution delay
      setTimeout(() => {
        const isOct = targetCell?.isOctSegmentation || targetCell?.source.includes('OCT') || targetCell?.source.includes('Retinal');

        let cellOutputs: CellOutput[] = [];

        if (isOct) {
          cellOutputs = [
            {
              type: 'text',
              content:
                '[Medical-Blocks OCT Engine v2.4] Initializing UNet Retinal Layer Segmenter...\n' +
                '✓ PyTorch CUDA device: cuda:0 (Compute Capability: 8.0)\n' +
                '✓ Model weights loaded: unet_oct_retina_v2.pth (5 target layer classes)\n' +
                'Loading DICOM OCT B-Scan volume: 16 frames x 512 x 512 (Spectralis SD-OCT)...\n' +
                'Applying axial speckle denoising and bilateral filter...\n' +
                'Inference completed in 38.4ms (26.0 FPS)\n' +
                '-----------------------------------------------------------------------\n' +
                'Layer Name               | Dice Score | Mean Thickness (µm) | Status\n' +
                '-------------------------+------------+---------------------+---------\n' +
                'Internal Limiting Membr. |   0.964    |      32.4 ± 3.1     | Normal\n' +
                'Inner Plexiform Layer    |   0.938    |      45.8 ± 4.2     | Normal\n' +
                'Inner Nuclear Layer      |   0.927    |      38.2 ± 3.8     | Normal\n' +
                'Retinal Pigment Epith.   |   0.952    |      28.7 ± 2.4     | Normal\n' +
                'Choroidal Boundary       |   0.915    |     242.1 ± 18.6    | Normal\n' +
                '-----------------------------------------------------------------------\n' +
                '✓ All 5 retinal layer boundaries detected with mean Dice = 0.939\n' +
                '✓ Interactive Retinal Thickness Map & B-Scan overlay rendered below:',
            },
            {
              type: 'image',
              content: 'OCT Retinal Layer B-Scan Visualizer',
            },
          ];
        } else {
          cellOutputs = [
            {
              type: 'text',
              content:
                'Execution completed successfully.\n' +
                'Return code: 0\n' +
                'Kernel memory: 1.42 GB / 40 GB\n' +
                '✓ Output generated without errors.',
            },
          ];
        }

        setNotebook((prev) => ({
          ...prev,
          cells: prev.cells.map((c) =>
            c.id === cellId
              ? {
                  ...c,
                  status: 'success',
                  isAiWriting: false,
                  isStreaming: false,
                  isOctSegmentation: isOct || c.isOctSegmentation,
                  executionCount: (c.executionCount || 6) + 1,
                  outputs: cellOutputs,
                }
              : c
          ),
        }));

        onShowToast?.(`✓ Finished execution of Cell [${cellId}]`);
        onComplete?.(cellId);
      }, 1200);
    },
    [notebook, setNotebook, onShowToast]
  );

  // 4. GENERAL SIMULATE AI WRITE (e.g. fix root or custom prompts)
  const simulateAiWrite = useCallback(
    ({ prompt, targetCellId, onComplete }: SimulateAiWriteOptions) => {
      const lower = prompt.toLowerCase();

      // Check if OCT Segmentation requested
      if (lower.includes('oct') || lower.includes('retina') || lower.includes('segmentation')) {
        streamOctSegmentationCode({
          targetCellId,
          onComplete: (id) => {
            onComplete?.(id, 'Generated end-to-end PyTorch OCT Retinal Layer Segmentation UNet pipeline.');
          },
        });
        return;
      }

      // Check if Execute last cell requested
      if (lower.includes('execute') || lower.includes('run last') || lower.includes('run cell')) {
        executeLastCell((id) => {
          onComplete?.(id, 'Executed notebook cell in Python 3 kernel.');
        });
        return;
      }

      // Check if Create cell requested
      if (lower.includes('create cell') || lower.includes('new cell') || lower.includes('add cell')) {
        const id = createCell('code');
        onComplete?.(id, 'Created new Python code cell in notebook.');
        return;
      }

      // Fix ROOT error in Cell 13
      if (lower.includes('root') || lower.includes('cell 13') || targetCellId === 'cell-13-code') {
        if (isAiGenerating) return;
        setIsAiGenerating(true);

        const cellId = 'cell-13-code';
        setStreamingCellId(cellId);
        lastExecutedCellIdRef.current = cellId;

        const rootFixTokens = [
          'import shutil\n',
          'from pathlib import Path\n\n',
          '# Guard against uninitialized ROOT in current kernel session\n',
          'try:\n',
          '    _ = ROOT\n',
          'except NameError:\n',
          '    BASE = Path.cwd() / "sync_test"\n',
          '    available_runs = sorted(BASE.glob("run_*"))\n',
          '    ROOT = available_runs[-1] if available_runs else BASE / "run_20260919_043653"\n\n',
          'if ROOT.exists():\n',
          '    shutil.rmtree(ROOT)\n',
          '    print(f"✓ Successfully removed test root: {ROOT.name}/")\n',
          'else:\n',
          '    print(f"Notice: Path {ROOT} does not exist. Nothing to remove.")\n',
        ];

        // Prepare cell
        setNotebook((prev) => ({
          ...prev,
          cells: prev.cells.map((c) =>
            c.id === cellId
              ? {
                  ...c,
                  isAiWriting: true,
                  isStreaming: true,
                  streamingStatusText: "Writing defensive fix for 'ROOT' NameError...",
                  streamingSpeed: '82 tok/s',
                  status: 'running',
                  source: '',
                  outputs: [],
                }
              : c
          ),
        }));

        // Scroll
        setTimeout(() => {
          const el = document.getElementById(cellId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);

        let tokenIdx = 0;
        let codeAcc = '';

        if (activeIntervalRef.current) clearInterval(activeIntervalRef.current);

        activeIntervalRef.current = window.setInterval(() => {
          if (tokenIdx < rootFixTokens.length) {
            codeAcc += rootFixTokens[tokenIdx];
            const snap = codeAcc;
            setNotebook((prev) => ({
              ...prev,
              cells: prev.cells.map((c) => (c.id === cellId ? { ...c, source: snap } : c)),
            }));
            tokenIdx++;
          } else {
            if (activeIntervalRef.current) {
              clearInterval(activeIntervalRef.current);
              activeIntervalRef.current = null;
            }

            setNotebook((prev) => ({
              ...prev,
              cells: prev.cells.map((c) =>
                c.id === cellId
                  ? {
                      ...c,
                      isAiWriting: false,
                      isStreaming: false,
                      status: 'success',
                      executionCount: (c.executionCount || 6) + 1,
                      outputs: [
                        {
                          type: 'text',
                          content:
                            '✓ Successfully removed test root: run_20260919_043653/\n' +
                            'Cleaned session artifacts in /home/jovyan/sync_test.',
                        },
                      ],
                    }
                  : c
              ),
            }));

            setIsAiGenerating(false);
            setStreamingCellId(null);
            onShowToast?.("✓ Fixed 'ROOT' NameError and executed cell successfully");
            onComplete?.(cellId, "Fixed uninitialized 'ROOT' reference with defensive Path resolution.");
          }
        }, 65);
        return;
      }

      // Default fallback write
      const newId = createCell('code');
      onComplete?.(newId, `Prepared new cell for: "${prompt}"`);
    },
    [isAiGenerating, createCell, streamOctSegmentationCode, executeLastCell, setNotebook, onShowToast]
  );

  return {
    isAiGenerating,
    streamingCellId,
    createCell,
    streamOctSegmentationCode,
    executeLastCell,
    simulateAiWrite,
    stopStreaming,
  };
}
