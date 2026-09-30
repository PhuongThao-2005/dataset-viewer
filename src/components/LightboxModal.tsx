import { useEffect } from 'react';
import type { ImageSample, CategoryMeta } from '@/data/types';

interface Props {
  sample: ImageSample;
  category: CategoryMeta;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

function formatAreaRatio(value: number) {
  const percent = value <= 1 ? value * 100 : value;
  return `${percent.toFixed(2)}%`;
}

export default function LightboxModal({ sample, category, onClose, onPrev, onNext }: Props) {
  const lesionCount = sample.metadata?.nLesions ?? sample.lesions?.length;
  const lesionRatios = sample.lesions?.filter(lesion => typeof lesion.areaRatio === 'number') ?? [];
  const annotation = sample.overlayPath
    ? { title: 'GT OVERLAY', src: sample.overlayPath, alt: 'Ground truth overlay' }
    : sample.maskPath
      ? { title: 'SEGMENTATION MASK', src: sample.maskPath, alt: 'Segmentation mask' }
      : { title: 'No annotation', src: undefined, alt: 'No annotation' };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  const renderPanel = (title: string, src: string | undefined, alt: string, color = '#64748b') => (
    <div className="p-4">
      <div className="text-xs font-mono mb-2 flex items-center gap-2" style={{ color }}>
        <span className="w-2 h-2 rounded-full" style={{ background: color }} />
        {title}
      </div>
      <div className="rounded-lg overflow-hidden flex items-center justify-center" style={{ background: '#0f172a', minHeight: '260px' }}>
        {src ? (
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-contain"
        style={{ maxHeight: 'min(56vh, 460px)' }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
        ) : (
          <div className="text-xs font-mono text-[#64748b] py-24">{title}</div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-2xl overflow-hidden"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          <div className="border-b md:border-b-0 md:border-r border-[#334155]">
            {renderPanel('ORIGINAL SCAN', sample.originalPath, 'Original scan')}
          </div>
          {renderPanel(annotation.title, annotation.src, annotation.alt, '#93c5fd')}
        </div>

        {/* Metadata footer */}
        <div className="px-6 py-4 border-t border-[#334155] flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono text-[#64748b]">
            {sample.metadata?.width && sample.metadata?.height && (
              <span>Resolution: <span className="text-[#e2e8f0]">{sample.metadata.width}x{sample.metadata.height}</span></span>
            )}
            {typeof lesionCount === 'number' && (
              <span>Lesions: <span className="text-[#e2e8f0]">{lesionCount}</span></span>
            )}
            {typeof sample.metadata?.unionAreaRatio === 'number' && (
              <span>Union area: <span className="text-[#e2e8f0]">{formatAreaRatio(sample.metadata.unionAreaRatio)}</span></span>
            )}
            {lesionRatios.map((lesion, idx) => (
              <span key={lesion.id || idx}>
                {lesion.id || `L${idx + 1}`}: <span className="text-[#e2e8f0]">{formatAreaRatio(lesion.areaRatio as number)}</span>
              </span>
            ))}
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
