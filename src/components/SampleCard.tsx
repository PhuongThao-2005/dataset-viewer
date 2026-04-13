import { useState } from 'react';
import type { ImageSample, CategoryMeta } from '@/data/types';

interface Props {
  sample: ImageSample;
  category: CategoryMeta;
  onClick: () => void;
}

export default function SampleCard({ sample, category, onClick }: Props) {
  const [hovered, setHovered] = useState(false);
  const [maskError, setMaskError] = useState(false);

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
      {/* Show mask thumbnail only (fallback to original) */}
      <div className="relative">
        <div className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '1/1', background: '#0f172a' }}>
          <img
            src={maskError ? sample.originalPath : sample.maskPath}
            alt={maskError ? 'Original scan' : 'Mask'}
            className="w-full h-full object-cover"
            draggable={false}
            onError={() => setMaskError(true)}
          />
          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono text-[#93c5fd] bg-black/60 pointer-events-none">
            {maskError ? 'ORIG' : 'MASK'}
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
        {sample.metadata?.notes && (
          <p className="text-[11px] text-[#64748b] font-mono truncate">{sample.metadata.notes}</p>
        )}
      </div>
    </div>
  );
}
