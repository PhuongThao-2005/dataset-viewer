import type { CategoryMeta, ImageSample } from '@/data/types';

interface Props {
  categories: CategoryMeta[];
  samples: ImageSample[];
  activeCat: string | null;
}

export default function StatsBar({ categories, samples, activeCat }: Props) {
  const filtered = samples.filter(s => {
    if (activeCat && s.category !== activeCat) return false;
    return true;
  });

  const byCategory = categories.map(cat => ({
    ...cat,
    count: samples.filter(s => s.category === cat.id).length,
  }));
  const hasStatus = samples.some(s => Boolean(s.status));
  const hasLesionInfo = samples.some(s => s.lesions || typeof s.metadata?.nLesions === 'number');
  const positiveCount = samples.filter(s => s.status === 'positive').length;
  const normalCount = samples.filter(s => s.status === 'normal').length;
  const totalLesions = samples.reduce((sum, sample) => {
    return sum + (sample.metadata?.nLesions ?? sample.lesions?.length ?? 0);
  }, 0);
  const multiLesionCount = samples.filter(sample => {
    const lesionCount = sample.metadata?.nLesions ?? sample.lesions?.length ?? 0;
    return lesionCount >= 2;
  }).length;
  const statsColumns = hasStatus || hasLesionInfo ? 'md:grid-cols-4' : 'md:grid-cols-3';

  return (
    <div className={`grid grid-cols-1 ${statsColumns} gap-3 mb-6`}>
      <div className="rounded-xl p-4" style={{ background: '#1f2937', border: '1px solid #334155' }}>
        <div className="text-[11px] font-mono text-[#64748b] mb-1">TOTAL IMAGES</div>
        <div className="text-2xl font-mono text-[#e2e8f0]">{samples.length}</div>
        <div className="text-[10px] font-mono text-[#64748b] mt-1">showing {filtered.length}</div>
      </div>

      <div className="rounded-xl p-4" style={{ background: '#1f2937', border: '1px solid #334155' }}>
        <div className="text-[11px] font-mono text-[#64748b] mb-1">CATEGORIES</div>
        <div className="text-2xl font-mono text-[#e2e8f0]">{categories.length}</div>
        <div className="flex items-center gap-1 mt-1">
          {byCategory.map(c => (
            <div key={c.id} className="w-2 h-2 rounded-full" style={{ background: c.color }} title={c.label} />
          ))}
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: '#1f2937', border: '1px solid #334155' }}>
        <div className="text-[11px] font-mono text-[#64748b] mb-2">DISTRIBUTION</div>
        <div className="flex h-4 rounded overflow-hidden gap-0.5">
          {byCategory.map(c => (
            <div
              key={c.id}
              style={{
                flex: c.count,
                background: c.color + '88',
                border: `1px solid ${c.color}44`,
              }}
              title={`${c.label}: ${c.count}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-2">
          {byCategory.map(c => (
            <div key={c.id} className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: c.color }} />
              <span className="text-[9px] font-mono text-[#64748b]">{c.label.slice(0,4).toUpperCase()}</span>
            </div>
          ))}
        </div>
        {hasStatus && (
          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#334155]">
            <span className="text-[10px] font-mono text-[#ef4444]">POS {positiveCount}</span>
            <span className="text-[10px] font-mono text-[#22c55e]">NORMAL {normalCount}</span>
          </div>
        )}
      </div>

      {(hasStatus || hasLesionInfo) && (
        <div className="rounded-xl p-4" style={{ background: '#1f2937', border: '1px solid #334155' }}>
          <div className="text-[11px] font-mono text-[#64748b] mb-2">SEGMENTATION</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {hasStatus && (
              <>
                <div>
                  <div className="text-lg font-mono text-[#ef4444]">{positiveCount}</div>
                  <div className="text-[9px] font-mono text-[#64748b]">positive</div>
                </div>
                <div>
                  <div className="text-lg font-mono text-[#22c55e]">{normalCount}</div>
                  <div className="text-[9px] font-mono text-[#64748b]">normal</div>
                </div>
              </>
            )}
            {hasLesionInfo && (
              <>
                <div>
                  <div className="text-lg font-mono text-[#e2e8f0]">{totalLesions}</div>
                  <div className="text-[9px] font-mono text-[#64748b]">lesions</div>
                </div>
                <div>
                  <div className="text-lg font-mono text-[#e2e8f0]">{multiLesionCount}</div>
                  <div className="text-[9px] font-mono text-[#64748b]">multi-lesion</div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
