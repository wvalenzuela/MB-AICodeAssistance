import React, { useState } from 'react';
import { Layers, Eye, EyeOff, BarChart3, CheckCircle2, Sliders, Download } from 'lucide-react';

interface RetinalLayer {
  id: string;
  name: string;
  shortName: string;
  color: string;
  dice: number;
  thickness: string;
  visible: boolean;
}

const INITIAL_LAYERS: RetinalLayer[] = [
  { id: 'ilm', name: 'Internal Limiting Membrane (ILM)', shortName: 'ILM', color: '#06b6d4', dice: 0.964, thickness: '32.4 µm', visible: true },
  { id: 'ipl', name: 'Inner Plexiform Layer (IPL)', shortName: 'IPL', color: '#10b981', dice: 0.938, thickness: '45.8 µm', visible: true },
  { id: 'inl', name: 'Inner Nuclear Layer (INL)', shortName: 'INL', color: '#f59e0b', dice: 0.927, thickness: '38.2 µm', visible: true },
  { id: 'rpe', name: 'Retinal Pigment Epithelium (RPE)', shortName: 'RPE', color: '#f43f5e', dice: 0.952, thickness: '28.7 µm', visible: true },
  { id: 'choroid', name: 'Choroid / Scleral Boundary', shortName: 'Choroid', color: '#8b5cf6', dice: 0.915, thickness: '242.1 µm', visible: true },
];

export const OctSegmentationOutput: React.FC = () => {
  const [layers, setLayers] = useState<RetinalLayer[]>(INITIAL_LAYERS);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.85);
  const [activeTab, setActiveTab] = useState<'bscan' | 'metrics' | 'profile'>('bscan');

  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  const toggleAll = (visible: boolean) => {
    setLayers((prev) => prev.map((l) => ({ ...l, visible })));
  };

  return (
    <div className="mt-3 rounded-lg border border-zinc-200 bg-white overflow-hidden shadow-2xs font-sans">
      {/* Top Header of the Output Widget */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide">OCT Retinal Layer Segmentation (PyTorch UNet v2)</span>
          <span className="px-2 py-0.5 rounded-full bg-white/15 text-[10px] font-mono text-zinc-200">
            512 × 512 SD-OCT
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-zinc-800 p-0.5 rounded-md border border-zinc-700 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('bscan')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                activeTab === 'bscan' ? 'bg-zinc-700 text-white font-medium shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              B-Scan Overlay
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('metrics')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                activeTab === 'metrics' ? 'bg-zinc-700 text-white font-medium shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Layer Metrics
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                activeTab === 'profile' ? 'bg-zinc-700 text-white font-medium shadow-xs' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Thickness Profile
            </button>
          </div>
        </div>
      </div>

      {/* Main B-Scan Visualization Tab */}
      {activeTab === 'bscan' && (
        <div className="p-4 bg-zinc-950 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* OCT Canvas / SVG Screen */}
          <div className="relative w-full max-w-[560px] aspect-[16/9] bg-[#090b0e] rounded-lg border border-zinc-800 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Simulated Optical Coherence Tomography (OCT) B-Scan Layer Structure */}
            <svg 
              viewBox="0 0 512 288" 
              className="w-full h-full object-cover select-none"
              preserveAspectRatio="none"
            >
              <defs>
                {/* OCT Speckle Noise Filter */}
                <radialGradient id="foveaShine" cx="50%" cy="40%" r="50%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#05070a" stopOpacity="0.9" />
                </radialGradient>
                <linearGradient id="vitreousGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#080c14" />
                  <stop offset="100%" stopColor="#111827" />
                </linearGradient>
                <linearGradient id="retinaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="40%" stopColor="#475569" />
                  <stop offset="70%" stopColor="#64748b" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="rpeGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
              </defs>

              {/* Vitreous Body Background (Dark low signal) */}
              <rect width="512" height="288" fill="url(#vitreousGrad)" />

              {/* Retinal Tissue Cross-Section with Central Foveal Depression */}
              {/* Layer 1: Neurosensory Retina */}
              <path
                d="M 0,110 Q 140,118 220,138 Q 256,152 292,138 Q 372,118 512,110 L 512,210 Q 372,210 256,210 Q 140,210 0,210 Z"
                fill="url(#retinaGrad)"
                opacity="0.85"
              />

              {/* Layer 2: Highly Reflective RPE / Photoreceptor IS/OS junction band */}
              <path
                d="M 0,205 Q 140,207 256,208 Q 372,207 512,205 L 512,218 Q 372,220 256,220 Q 140,220 0,218 Z"
                fill="url(#rpeGlow)"
                opacity="0.9"
              />

              {/* Layer 3: Choroid (heterogeneous vascular reflections) */}
              <path
                d="M 0,218 Q 256,220 512,218 L 512,270 Q 256,275 0,270 Z"
                fill="#1e1b4b"
                opacity="0.75"
              />

              {/* Speckle / Granular noise simulation */}
              <circle cx="120" cy="140" r="1.5" fill="#94a3b8" opacity="0.3" />
              <circle cx="210" cy="165" r="1.2" fill="#94a3b8" opacity="0.4" />
              <circle cx="340" cy="145" r="1.8" fill="#cbd5e1" opacity="0.35" />
              <circle cx="430" cy="155" r="1.4" fill="#94a3b8" opacity="0.4" />
              <circle cx="256" cy="180" r="1.6" fill="#e2e8f0" opacity="0.4" />

              {/* AI SEGMENTATION OVERLAYS (Color coded retinal boundaries) */}
              {/* 1. ILM (Internal Limiting Membrane - Top Boundary) */}
              {layers.find((l) => l.id === 'ilm')?.visible && (
                <path
                  d="M 0,110 Q 140,118 220,138 Q 256,152 292,138 Q 372,118 512,110"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity={overlayOpacity}
                />
              )}

              {/* 2. IPL / INL (Inner Retinal Boundary) */}
              {layers.find((l) => l.id === 'ipl')?.visible && (
                <path
                  d="M 0,145 Q 140,150 220,165 Q 256,174 292,165 Q 372,150 512,145"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.2"
                  strokeDasharray="4 2"
                  strokeLinecap="round"
                  opacity={overlayOpacity}
                />
              )}

              {/* 3. INL / OPL Boundary */}
              {layers.find((l) => l.id === 'inl')?.visible && (
                <path
                  d="M 0,175 Q 140,178 220,188 Q 256,192 292,188 Q 372,178 512,175"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity={overlayOpacity}
                />
              )}

              {/* 4. RPE (Retinal Pigment Epithelium - Hyperreflective Band) */}
              {layers.find((l) => l.id === 'rpe')?.visible && (
                <path
                  d="M 0,205 Q 140,207 256,208 Q 372,207 512,205"
                  fill="none"
                  stroke="#f43f5e"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  opacity={overlayOpacity}
                />
              )}

              {/* 5. Choroidal / Scleral Junction */}
              {layers.find((l) => l.id === 'choroid')?.visible && (
                <path
                  d="M 0,260 Q 140,265 256,268 Q 372,265 512,260"
                  fill="none"
                  stroke="#8b5cf6"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  opacity={overlayOpacity}
                />
              )}

              {/* Fovea centralis marker */}
              <line x1="256" y1="130" x2="256" y2="170" stroke="#f8fafc" strokeWidth="1" strokeDasharray="2 2" opacity="0.6" />
              <text x="260" y="142" fill="#e2e8f0" fontSize="9" fontFamily="monospace">Foveal Pit</text>
            </svg>

            {/* Corner Badges */}
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs rounded text-[10px] font-mono text-zinc-300 border border-white/10">
              Macular Scan: B-08/16
            </div>
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 rounded text-[10px] font-mono">
              Mean Dice: 0.939
            </div>
          </div>

          {/* Right Controls: Layer Visibility & Opacity */}
          <div className="w-full md:w-64 flex flex-col gap-3 text-xs text-zinc-300">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                Retinal Boundaries
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleAll(true)}
                  className="text-[10px] text-zinc-400 hover:text-white px-1 cursor-pointer"
                >
                  All
                </button>
                <span className="text-zinc-600">|</span>
                <button
                  type="button"
                  onClick={() => toggleAll(false)}
                  className="text-[10px] text-zinc-400 hover:text-white px-1 cursor-pointer"
                >
                  None
                </button>
              </div>
            </div>

            {/* Layer Toggles */}
            <div className="space-y-1.5">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`flex items-center justify-between p-2 rounded-md border transition-all cursor-pointer select-none ${
                    layer.visible 
                      ? 'bg-zinc-900 border-zinc-700/80 hover:border-zinc-600' 
                      : 'bg-zinc-950/60 border-zinc-900 opacity-50 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: layer.color }} 
                    />
                    <span className="font-medium text-xs text-zinc-200 truncate">{layer.shortName}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[11px] text-zinc-400">{layer.thickness}</span>
                    {layer.visible ? (
                      <Eye className="w-3.5 h-3.5 text-sky-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Opacity Slider */}
            <div className="pt-2 border-t border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <Sliders className="w-3 h-3" />
                  Overlay Opacity
                </span>
                <span className="font-mono">{Math.round(overlayOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                className="w-full accent-sky-500 h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Metrics Table Tab */}
      {activeTab === 'metrics' && (
        <div className="p-4 overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 bg-zinc-50">
                <th className="py-2 px-3 font-semibold">Anatomical Layer</th>
                <th className="py-2 px-3 font-semibold">Dice Score</th>
                <th className="py-2 px-3 font-semibold">Mean Thickness</th>
                <th className="py-2 px-3 font-semibold">Clinical Status</th>
                <th className="py-2 px-3 font-semibold">Confidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-zinc-800">
              {layers.map((l) => (
                <tr key={l.id} className="hover:bg-zinc-50/80">
                  <td className="py-2.5 px-3 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: l.color }} />
                    <span className="font-sans font-medium">{l.name}</span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-emerald-600">{l.dice.toFixed(3)}</td>
                  <td className="py-2.5 px-3">{l.thickness}</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-sans font-medium">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      Normal
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-zinc-600">98.4%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Thickness Profile Tab */}
      {activeTab === 'profile' && (
        <div className="p-4 bg-zinc-50 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-zinc-700">
            <span className="font-semibold flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-sky-600" />
              Retinal Cross-Sectional Thickness Profile (Temporal to Nasal)
            </span>
            <span className="text-zinc-500 text-[11px] font-mono">ETDRS Macular Grid 1mm / 3mm / 6mm</span>
          </div>
          
          {/* Visual Bar representation */}
          <div className="h-32 bg-white rounded-lg border border-zinc-200 p-3 flex items-end gap-2 relative">
            <div className="absolute inset-x-3 top-3 border-b border-dashed border-zinc-200" />
            <div className="absolute inset-x-3 top-16 border-b border-dashed border-zinc-200" />
            {Array.from({ length: 32 }).map((_, i) => {
              // Create realistic foveal depression curve
              const distFromCenter = Math.abs(i - 16);
              const heightPct = Math.min(95, Math.max(30, 85 - (16 - distFromCenter) * 2.8));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                  <div 
                    style={{ height: `${heightPct}%` }}
                    className="w-full bg-gradient-to-t from-sky-600 to-cyan-400 rounded-t-xs hover:brightness-110 transition-all cursor-pointer relative"
                    title={`Column ${i}: ${Math.round(heightPct * 3.2)} µm`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
            <span>Temporal (T)</span>
            <span className="font-bold text-zinc-800">Fovea (F) ~ 212 µm</span>
            <span>Nasal (N)</span>
          </div>
        </div>
      )}

      {/* Bottom Status bar */}
      <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-[11px] text-zinc-500">
        <span className="flex items-center gap-1.5 text-zinc-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Inference complete: <strong>38.4 ms</strong> on NVIDIA A100 GPU</span>
        </span>
        <span className="font-mono text-zinc-400">MB-Inference-Engine v2.4</span>
      </div>
    </div>
  );
};

export default OctSegmentationOutput;
