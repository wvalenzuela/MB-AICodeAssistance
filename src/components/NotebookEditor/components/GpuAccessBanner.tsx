import React, { useState } from 'react';
import { Cpu, CheckCircle2, X } from 'lucide-react';

interface GpuAccessBannerProps {
  currentGpu: string;
  onUpdateGpu: (newGpu: string) => void;
}

export const GpuAccessBanner: React.FC<GpuAccessBannerProps> = ({
  currentGpu,
  onUpdateGpu,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isGpuActive = currentGpu.includes('A100') || currentGpu.includes('NVIDIA');

  const handleAttachGpu = () => {
    onUpdateGpu('NVIDIA A100-SXM4-80GB (Active)');
    setIsModalOpen(false);
  };

  const handleDetachGpu = () => {
    onUpdateGpu('none (CPU only)');
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-[#fafbfc] border-b border-zinc-200 px-4 py-2 flex items-center justify-between text-xs select-none shrink-0">
        <div className="text-zinc-600 font-sans">
          <span>GPU: </span>
          <span className={isGpuActive ? 'text-emerald-700 font-semibold' : 'text-zinc-800'}>
            {currentGpu}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer ${
            isGpuActive
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
              : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50/70 shadow-2xs'
          }`}
          title="Manage GPU compute acceleration"
        >
          <Cpu className={`w-3.5 h-3.5 ${isGpuActive ? 'text-emerald-600' : 'text-indigo-600'}`} />
          <span className="tracking-wide">
            {isGpuActive ? 'GPU ATTACHED' : 'REQUEST GPU ACCESS'}
          </span>
        </button>
      </div>

      {/* GPU Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-zinc-200 w-full max-w-md p-5 text-zinc-800 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-sm text-zinc-900">Medical-Blocks GPU Acceleration</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-zinc-600">
              <p>
                Allocate high-throughput GPU accelerators to your active kernel session for PyTorch DICOM volume segmentation and deep learning inference.
              </p>

              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg space-y-1.5">
                <div className="flex items-center justify-between font-medium text-zinc-900">
                  <span>Available GPU Accelerator:</span>
                  <span className="text-indigo-600 font-semibold">NVIDIA A100 SXM4 80GB</span>
                </div>
                <div className="text-zinc-500 text-[11px]">
                  Memory: 80GB HBM2e • CUDA 12.2 • Compute Capability: 8.0
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              {isGpuActive ? (
                <button
                  type="button"
                  onClick={handleDetachGpu}
                  className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md font-medium text-xs cursor-pointer"
                >
                  Detach GPU (Switch to CPU)
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleAttachGpu}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isGpuActive ? 'Confirm Keep Attached' : 'Attach NVIDIA A100 (80GB)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GpuAccessBanner;
