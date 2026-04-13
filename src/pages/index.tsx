import { useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import type { DataManifest, ImageSample, CategoryMeta } from '@/data/types';
import SampleCard from '@/components/SampleCard';
import LightboxModal from '@/components/LightboxModal';
import StatsBar from '@/components/StatsBar';

interface Props {
  manifest: DataManifest;
}

const PAGE_SIZE = 24;
const DEFAULT_CATEGORY_COLOR = '#64748b';
const CATEGORY_COLOR_PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
];

function getColorFromCategoryId(id: string) {
  const hash = Array.from(id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return CATEGORY_COLOR_PALETTE[hash % CATEGORY_COLOR_PALETTE.length];
}

export default function Home({ manifest }: Props) {
  const { categories, samples, name, description } = manifest;
  const categoriesWithColor = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      color: !cat.color || cat.color === DEFAULT_CATEGORY_COLOR
        ? getColorFromCategoryId(cat.id)
        : cat.color,
    }));
  }, [categories]);

  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState<number | null>(null); // index in filtered

  const filtered = useMemo(() => {
    return samples.filter(s => {
      if (activeCat && s.category !== activeCat) return false;
      if (search && !s.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [samples, activeCat, search]);

  const paginated = useMemo(() => {
    return filtered.slice(0, page * PAGE_SIZE);
  }, [filtered, page]);

  const getCategoryById = useCallback((id: string): CategoryMeta => {
    return categoriesWithColor.find(c => c.id === id) || {
      id,
      label: id,
      color: getColorFromCategoryId(id),
      description: '',
    };
  }, [categoriesWithColor]);

  const openLightbox = (idx: number) => setLightbox(idx);
  const closeLightbox = () => setLightbox(null);

  const prevLightbox = lightbox !== null && lightbox > 0
    ? () => setLightbox(lightbox - 1) : undefined;
  const nextLightbox = lightbox !== null && lightbox < filtered.length - 1
    ? () => setLightbox(lightbox + 1) : undefined;

  return (
    <>
      <Head>
        <title>{name}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen" style={{ background: '#0b1220' }}>
        {/* Scan line effect */}
        <div
          className="scan-line fixed top-0 left-0 right-0 h-px pointer-events-none z-50"
          style={{ background: 'linear-gradient(90deg, transparent, #93c5fd55, transparent)' }}
        />

        {/* Header */}
        <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[#334155]"
          style={{ background: 'rgba(11,18,32,0.9)' }}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: '#93c5fd22', border: '1px solid #93c5fd44' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2">
                  <path d="M12 2a9 9 0 1 0 0 18A9 9 0 0 0 12 2z"/>
                  <path d="M8 12a4 4 0 0 0 8 0"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-mono font-medium text-[#e2e8f0] leading-none">{name}</h1>
                <p className="text-[10px] font-mono text-[#64748b] mt-0.5">Mask Segmentation Viewer</p>
              </div>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#64748b]"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search by ID..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-8 pr-3 py-2 text-xs font-mono rounded-lg outline-none"
                style={{
                  background: '#1f2937',
                  border: '1px solid #334155',
                  color: '#e2e8f0',
                  '::placeholder': { color: '#64748b' },
                } as any}
              />
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          {/* Stats */}
          <StatsBar
            categories={categoriesWithColor}
            samples={samples}
            activeCat={activeCat}
          />

          {/* Category filter pills */}
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <button
              onClick={() => { setActiveCat(null); setPage(1); }}
              className="px-4 py-2 rounded-full text-xs font-mono transition-all"
              style={{
                background: !activeCat ? '#e2e8f022' : 'transparent',
                color: !activeCat ? '#e2e8f0' : '#64748b',
                border: `1px solid ${!activeCat ? '#e2e8f033' : '#334155'}`,
              }}
            >
              All Categories
              <span className="ml-2 text-[10px] opacity-60">{samples.length}</span>
            </button>

            {categoriesWithColor.map(cat => {
              const count = samples.filter(s => s.category === cat.id).length;
              const active = activeCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCat(active ? null : cat.id); setPage(1); }}
                  className="px-4 py-2 rounded-full text-xs font-mono transition-all flex items-center gap-2"
                  style={{
                    background: active ? cat.color + '22' : 'transparent',
                    color: active ? cat.color : '#64748b',
                    border: `1px solid ${active ? cat.color + '55' : '#334155'}`,
                  }}
                  title={cat.description}
                >
                  <span className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                  {cat.label}
                  <span className="text-[10px] opacity-60">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Active category info */}
          {activeCat && (() => {
            const cat = categoriesWithColor.find(c => c.id === activeCat);
            if (!cat) return null;
            return (
              <div
                className="rounded-xl px-4 py-3 mb-6 text-sm font-mono flex items-start gap-3 fade-in"
                style={{ background: cat.color + '11', border: `1px solid ${cat.color}33` }}
              >
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: cat.color }} />
                <div>
                  <span className="font-medium" style={{ color: cat.color }}>{cat.label}</span>
                  <span className="text-[#64748b] ml-3">{cat.description}</span>
                </div>
              </div>
            );
          })()}

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-[#64748b]">
              {filtered.length} samples
              {search && <span> matching <span className="text-[#e2e8f0]">"{search}"</span></span>}
            </span>
            {paginated.length < filtered.length && (
              <span className="text-xs font-mono text-[#64748b]">
                showing {paginated.length} of {filtered.length}
              </span>
            )}
          </div>

          {/* Grid */}
          {paginated.length === 0 ? (
            <div className="text-center py-24 text-[#64748b] font-mono">
              <div className="text-4xl mb-3">◻</div>
              <div className="text-sm">No samples found</div>
              <div className="text-xs mt-1 opacity-60">Try adjusting your filters</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {paginated.map((sample, idx) => (
                <SampleCard
                  key={sample.id}
                  sample={sample}
                  category={getCategoryById(sample.category)}
                  onClick={() => openLightbox(idx)}
                />
              ))}
            </div>
          )}

          {/* Load more */}
          {paginated.length < filtered.length && (
            <div className="mt-8 text-center">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-3 rounded-xl text-sm font-mono transition-all"
                style={{
                  background: '#1f2937',
                  border: '1px solid #334155',
                  color: '#e2e8f0',
                }}
              >
                Load more ({filtered.length - paginated.length} remaining)
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 border-t border-[#334155] px-4 py-6 text-center">
          <p className="text-xs font-mono text-[#64748b]">
            {name} · {samples.length} samples · {categories.length} categories
          </p>
        </footer>
      </div>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <LightboxModal
          sample={filtered[lightbox]}
          category={getCategoryById(filtered[lightbox].category)}
          onClose={closeLightbox}
          onPrev={prevLightbox}
          onNext={nextLightbox}
        />
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // Try to load real manifest.json from public folder at build time
  let manifest: DataManifest;
  
  try {
    const fs = require('fs');
    const path = require('path');
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    
    if (fs.existsSync(manifestPath)) {
      const raw = fs.readFileSync(manifestPath, 'utf-8');
      manifest = JSON.parse(raw);
      console.log(`✅ Loaded manifest.json: ${manifest.samples.length} samples`);
    } else {
      throw new Error('manifest.json not found');
    }
  } catch (e) {
    // Fallback to demo data
    console.log('⚠️  No manifest.json found, using demo data');
    const { DEMO_MANIFEST } = require('@/data/manifest');
    manifest = DEMO_MANIFEST;
  }

  return {
    props: { manifest },
  };
};
