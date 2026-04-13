import { useEffect } from 'react';
import type { ImageSample, CategoryMeta } from '@/data/types';

interface Props {
  sample: ImageSample;
  category: CategoryMeta;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function LightboxModal({ sample, category, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl rounded-2xl overflow-hidden"
        style={{ background: '#111827', border: '1px solid #334155' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#334155]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ background: category.color }} />
            <span className="text-sm font-mono" style={{ color: category.color }}>{category.label}</span>
            <span className="text-[#64748b] font-mono text-sm">→</span>
            <span className="text-sm font-mono text-[#e2e8f0]">{sample.id}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] hover:text-white hover:bg-[#1e2d47] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Images side by side */}
        <div className="grid grid-cols-2 gap-0">
          <div className="p-4 border-r border-[#334155]">
            <div className="text-xs font-mono text-[#64748b] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#64748b]" />
              ORIGINAL SCAN
            </div>
            <div className="rounded-lg overflow-hidden" style={{ background: '#0f172a' }}>
              <img
                src={sample.originalPath}
                alt="Original"
                className="w-full h-auto object-contain"
                style={{ maxHeight: '400px' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>

          <div className="p-4">
            <div className="text-xs font-mono text-[#93c5fd] mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#93c5fd] pulse-dot" />
              SEGMENTATION MASK
            </div>
            <div className="rounded-lg overflow-hidden" style={{ background: '#0f172a' }}>
              <img
                src={sample.maskPath}
                alt="Mask"
                className="w-full h-auto object-contain"
                style={{ maxHeight: '400px' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>

        {/* Metadata footer */}
        <div className="px-6 py-4 border-t border-[#334155] flex items-center justify-between">
          <div className="flex items-center gap-6 text-xs font-mono text-[#64748b]">
            {sample.metadata?.source && (
              <span>Source: <span className="text-[#e2e8f0]">{sample.metadata.source}</span></span>
            )}
            {sample.metadata?.notes && (
              <span>Notes: <span className="text-[#e2e8f0]">{sample.metadata.notes}</span></span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onPrev && (
              <button
                onClick={onPrev}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-[#64748b] hover:text-white border border-[#334155] hover:border-[#93c5fd66] transition-all"
              >
                ← Prev
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-[#64748b] hover:text-white border border-[#334155] hover:border-[#93c5fd66] transition-all"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
