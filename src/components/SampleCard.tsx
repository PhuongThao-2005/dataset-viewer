import { useState } from 'react';
import type { ImageSample, CategoryMeta } from '@/data/types';

interface Props {
  sample: ImageSample;
  category: CategoryMeta;
  onClick: () => void;
}

function formatAreaRatio(value: number) {
  const percent = value <= 1 ? value * 100 : value;
  return `${percent.toFixed(2)}%`;
}

export default function SampleCard({ sample, category, onClick }: Props) {
  const [hovered, setHovered] = useState(false);
  const [failedPreviews, setFailedPreviews] = useState<Set<'overlay' | 'mask'>>(new Set());
  const lesionCount = sample.metadata?.nLesions ?? sample.lesions?.length;
  const preview =
    sample.overlayPath && !failedPreviews.has('overlay')
      ? { src: sample.overlayPath, label: 'OVERLAY', alt: 'Ground truth overlay', type: 'overlay' as const }
      : sample.maskPath && !failedPreviews.has('mask')
        ? { src: sample.maskPath, label: 'MASK', alt: 'Mask', type: 'mask' as const }
        : { src: sample.originalPath, label: 'ORIG', alt: 'Original scan', type: 'original' as const };
  const lesionRatios = sample.lesions?.filter(lesion => typeof lesion.areaRatio === 'number') ?? [];

  return (
    <div
      className="rounded-xl overflow-hidden cursor-pointer fade-in transition-all duration-200"
      style={{
        background: '#1f2937',
        border: `1px solid ${hovered ? category.color + '55' : '#334155'}`,
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Show annotation thumbnail when available, falling back to the original scan. */}
      <div className="relative">
        <div className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '1/1', background: '#0f172a' }}>
          <img
            src={preview.src}
            alt={preview.alt}
            className="w-full h-full object-cover"
            draggable={false}
            onError={() => {
              if (preview.type === 'overlay' || preview.type === 'mask') {
                setFailedPreviews(prev => new Set(prev).add(preview.type));
              }
            }}
          />
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono text-[#93c5fd] bg-black/60 pointer-events-none">
            {preview.label}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span
            className="text-xs font-mono truncate"
            style={{ color: category.color }}
          >
            {sample.id}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#64748b] mb-1">
          <span className="truncate">{category.label}</span>
          {sample.status && (
            <span style={{ color: sample.status === 'positive' ? '#f87171' : '#4ade80' }}>
              {sample.status.toUpperCase()}
            </span>
          )}
        </div>
        {typeof lesionCount === 'number' && (
          <p className="text-[10px] text-[#94a3b8] font-mono">
            {lesionCount} {lesionCount === 1 ? 'lesion' : 'lesions'}
          </p>
        )}
        {lesionRatios.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {lesionRatios.slice(0, 3).map((lesion, idx) => (
              <div key={lesion.id || idx} className="text-[10px] text-[#64748b] font-mono truncate">
                {lesion.id || `L${idx + 1}`}: {formatAreaRatio(lesion.areaRatio as number)}
              </div>
            ))}
          </div>
        )}
        {sample.metadata?.notes && (
          <p className="text-[11px] text-[#64748b] font-mono truncate">{sample.metadata.notes}</p>
        )}
      </div>
    </div>
  );
}
