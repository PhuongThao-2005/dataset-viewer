import { useState, useRef, useCallback, useEffect } from 'react';

interface Props {
  originalSrc: string;
  maskSrc: string;
  label?: string;
}

export default function ImageCompare({ originalSrc, maskSrc, label }: Props) {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [origError, setOrigError] = useState(false);
  const [maskError, setMaskError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSlider(e.clientX);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    updateSlider(e.touches[0].clientX);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (isDragging) updateSlider(e.clientX); };
    const onTouch = (e: TouchEvent) => { if (isDragging) updateSlider(e.touches[0].clientX); };
    const onUp = () => setIsDragging(false);
    
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouch);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onUp);
    };
  }, [isDragging, updateSlider]);

  const placeholder = (type: 'orig' | 'mask') => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1525] text-[#64748b]">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="20" height="20" rx="3"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="M21 15l-5-5L5 21"/>
      </svg>
      <span className="text-xs mt-2 font-mono">{type === 'orig' ? 'original' : 'mask'}</span>
      <span className="text-[10px] mt-1 opacity-50">image not found</span>
    </div>
  );

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="compare-container rounded-lg overflow-hidden select-none"
        style={{ aspectRatio: '1/1', cursor: isDragging ? 'col-resize' : 'col-resize' }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {/* Original (bottom layer) */}
        <div className="absolute inset-0">
          {origError ? placeholder('orig') : (
            <img
              src={originalSrc}
              alt="Original scan"
              className="w-full h-full object-cover"
              draggable={false}
              onError={() => setOrigError(true)}
            />
          )}
        </div>

        {/* Mask (top layer, clipped) */}
        <div
          className="compare-after"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          {maskError ? placeholder('mask') : (
            <img
              src={maskSrc}
              alt="Mask overlay"
              className="w-full h-full object-cover"
              draggable={false}
              onError={() => setMaskError(true)}
            />
          )}
        </div>

        {/* Divider */}
        <div className="compare-divider" style={{ left: `${sliderPos}%` }}>
          <div className="compare-handle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a0e1a">
              <path d="M8 5l-6 7 6 7M16 5l6 7-6 7" stroke="#0a0e1a" strokeWidth="2.5" fill="none"/>
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono text-white bg-black/60 pointer-events-none">
          ORIG
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono text-[#93c5fd] bg-black/60 pointer-events-none">
          MASK
        </div>
      </div>
    </div>
  );
}
