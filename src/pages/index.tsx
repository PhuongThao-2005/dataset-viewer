import { useState, useMemo, useCallback, useEffect } from 'react';
import Head from 'next/head';
import type { GetStaticProps } from 'next';
import type { DataManifest, ImageSample, CategoryMeta, DatasetId } from '@/data/types';
import { FALLBACK_MANIFEST } from '@/data/manifest';
import SampleCard from '@/components/SampleCard';
import LightboxModal from '@/components/LightboxModal';
import StatsBar from '@/components/StatsBar';

interface DatasetOption {
  id: DatasetId;
  label: string;
  available: boolean;
}

interface Props {
  manifests: Partial<Record<DatasetId, DataManifest>>;
  datasetOptions: DatasetOption[];
  initialDataset: DatasetId;
}

type StatusFilter = 'all' | 'positive' | 'normal';
type LesionCountFilter = 'all' | 'one' | 'multi';
type SortMode = 'default' | 'smallest_lesion' | 'largest_lesion';

const PAGE_SIZE = 24;
const DEFAULT_CATEGORY_COLOR = '#64748b';
const DATASET_CONFIGS: Array<{ id: DatasetId; label: string; fileName: string }> = [
  { id: 'btrxd', label: 'BTRXD', fileName: 'btrxd.json' },
  { id: 'fracatlas', label: 'FracAtlas', fileName: 'fracatlas.json' },
];
const CATEGORY_COLOR_PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899',
];

function getColorFromCategoryId(id: string) {
  const hash = Array.from(id).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return CATEGORY_COLOR_PALETTE[hash % CATEGORY_COLOR_PALETTE.length];
}

function formatDatasetLabel(option: DatasetOption) {
  return option.available ? option.label : `${option.label} (not generated)`;
}

function getLesionCount(sample: ImageSample) {
  return sample.metadata?.nLesions ?? sample.lesions?.length ?? 0;
}

function getSmallestLesionRatio(sample: ImageSample) {
  const ratios = sample.lesions
    ?.map(lesion => lesion.areaRatio)
    .filter((value): value is number => typeof value === 'number');
  if (!ratios || ratios.length === 0) return null;
  return Math.min(...ratios);
}

export default function Home({ manifests, datasetOptions, initialDataset }: Props) {
  const [activeDataset, setActiveDataset] = useState<DatasetId>(initialDataset);
  const manifest = manifests[activeDataset] || manifests[initialDataset] || FALLBACK_MANIFEST;
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [lesionCountFilter, setLesionCountFilter] = useState<LesionCountFilter>('all');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const hasStatus = samples.some(s => Boolean(s.status));
  const hasAreaRatios = samples.some(s => s.lesions?.some(lesion => typeof lesion.areaRatio === 'number'));

  useEffect(() => {
    setActiveCat(null);
    setStatusFilter('all');
    setLesionCountFilter('all');
    setSortMode('default');
    setSearch('');
    setPage(1);
    setLightbox(null);
  }, [activeDataset]);

  const filtered = useMemo(() => {
    const next = samples.filter(s => {
      if (activeCat && s.category !== activeCat) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (lesionCountFilter === 'one' && getLesionCount(s) !== 1) return false;
      if (lesionCountFilter === 'multi' && getLesionCount(s) < 2) return false;
      if (search && !s.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (sortMode === 'default') return next;
    return [...next].sort((a, b) => {
      const aRatio = getSmallestLesionRatio(a);
      const bRatio = getSmallestLesionRatio(b);
      if (aRatio === null && bRatio === null) return 0;
      if (aRatio === null) return 1;
      if (bRatio === null) return -1;
      return sortMode === 'smallest_lesion' ? aRatio - bRatio : bRatio - aRatio;
    });
  }, [samples, activeCat, statusFilter, lesionCountFilter, search, sortMode]);

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
        <div
          className="scan-line fixed top-0 left-0 right-0 h-px pointer-events-none z-50"
          style={{ background: 'linear-gradient(90deg, transparent, #93c5fd55, transparent)' }}
        />

        <header className="sticky top-0 z-40 backdrop-blur-md border-b border-[#334155]"
          style={{ background: 'rgba(11,18,32,0.9)' }}>
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: '#93c5fd22', border: '1px solid #93c5fd44' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#93c5fd" strokeWidth="2">
                  <path d="M12 2a9 9 0 1 0 0 18A9 9 0 0 0 12 2z"/>
                  <path d="M8 12a4 4 0 0 0 8 0"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-mono font-medium text-[#e2e8f0] leading-none truncate">{name}</h1>
                <p className="text-[10px] font-mono text-[#64748b] mt-0.5">Medical X-ray Segmentation Viewer</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end">
              <select
                value={activeDataset}
                onChange={e => setActiveDataset(e.target.value as DatasetId)}
                className="px-3 py-2 text-xs font-mono rounded-lg outline-none"
                style={{
                  background: '#1f2937',
                  border: '1px solid #334155',
                  color: '#e2e8f0',
                }}
              >
                {datasetOptions.map(option => (
                  <option key={option.id} value={option.id} disabled={!option.available}>
                    {formatDatasetLabel(option)}
                  </option>
                ))}
              </select>

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
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <StatsBar
            categories={categoriesWithColor}
            samples={samples}
            activeCat={activeCat}
          />

          <div className="flex items-center gap-2 mb-4 flex-wrap">
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

          <div className="flex items-center gap-2 mb-6 flex-wrap">
            {hasStatus && (
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
                className="px-3 py-2 rounded-lg text-xs font-mono outline-none"
                style={{ background: '#1f2937', border: '1px solid #334155', color: '#e2e8f0' }}
              >
                <option value="all">All Status</option>
                <option value="positive">Positive</option>
                <option value="normal">Normal</option>
              </select>
            )}

            <select
              value={lesionCountFilter}
              onChange={e => { setLesionCountFilter(e.target.value as LesionCountFilter); setPage(1); }}
              className="px-3 py-2 rounded-lg text-xs font-mono outline-none"
              style={{ background: '#1f2937', border: '1px solid #334155', color: '#e2e8f0' }}
            >
              <option value="all">All Lesion Counts</option>
              <option value="one">1 lesion</option>
              <option value="multi">2+ lesions</option>
            </select>

            {hasAreaRatios && (
              <select
                value={sortMode}
                onChange={e => { setSortMode(e.target.value as SortMode); setPage(1); }}
                className="px-3 py-2 rounded-lg text-xs font-mono outline-none"
                style={{ background: '#1f2937', border: '1px solid #334155', color: '#e2e8f0' }}
              >
                <option value="default">Default sort</option>
                <option value="smallest_lesion">Smallest lesion first</option>
                <option value="largest_lesion">Largest lesion first</option>
              </select>
            )}
          </div>

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

          {paginated.length === 0 ? (
            <div className="text-center py-24 text-[#64748b] font-mono">
              <div className="text-4xl mb-3">□</div>
              <div className="text-sm">No samples found</div>
              <div className="text-xs mt-1 opacity-60">Try adjusting your filters</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {paginated.map((sample, idx) => (
                <SampleCard
                  key={`${sample.dataset}-${sample.id}`}
                  sample={sample}
                  category={getCategoryById(sample.category)}
                  onClick={() => openLightbox(idx)}
                />
              ))}
            </div>
          )}

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

        <footer className="mt-16 border-t border-[#334155] px-4 py-6 text-center">
          <p className="text-xs font-mono text-[#64748b]">
            {name} · {samples.length} samples · {categories.length} categories
          </p>
        </footer>
      </div>

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

function normalizeManifest(raw: any, dataset: DatasetId): DataManifest {
  const rawSamples = Array.isArray(raw?.samples) ? raw.samples : [];
  const samples: ImageSample[] = rawSamples.map((sample: any, index: number): ImageSample => {
    const category = String(sample.category || sample.status || 'unknown');
    const status = sample.status === 'positive' || sample.status === 'normal'
      ? sample.status
      : dataset === 'fracatlas'
        ? category === 'normal' ? 'normal' : 'positive'
        : undefined;
    const lesions = Array.isArray(sample.lesions) ? sample.lesions : undefined;
    const metadata = {
      ...(sample.metadata || {}),
      ...(lesions && typeof sample.metadata?.nLesions !== 'number' ? { nLesions: lesions.length } : {}),
    };

    return {
      ...sample,
      id: String(sample.id || sample.metadata?.filename || `${dataset}_${index}`),
      dataset,
      category,
      status,
      originalPath: String(sample.originalPath || ''),
      maskPath: sample.maskPath || undefined,
      overlayPath: sample.overlayPath || undefined,
      lesions,
      metadata,
    };
  });

  const categoryIds = Array.from(new Set(samples.map(sample => sample.category)));
  const rawCategories = Array.isArray(raw?.categories) ? raw.categories : [];
  const categoriesFromManifest: CategoryMeta[] = rawCategories.map((cat: any) => ({
    id: String(cat.id),
    label: String(cat.label || cat.id),
    color: String(cat.color || DEFAULT_CATEGORY_COLOR),
    description: String(cat.description || ''),
    count: cat.count,
  }));
  const knownCategoryIds = new Set(categoriesFromManifest.map(cat => cat.id));
  const generatedCategories: CategoryMeta[] = categoryIds
    .filter(id => !knownCategoryIds.has(id))
    .map(id => ({
      id,
      label: id,
      color: DEFAULT_CATEGORY_COLOR,
      description: `Category: ${id}`,
      count: samples.filter(sample => sample.category === id).length,
    }));

  return {
    id: dataset,
    name: String(raw?.name || `${dataset.toUpperCase()} Dataset`),
    description: String(raw?.description || 'Medical X-ray segmentation dataset'),
    generatedAt: raw?.generatedAt,
    categories: [...categoriesFromManifest, ...generatedCategories],
    samples,
  };
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const fs = require('fs');
  const path = require('path');
  const manifests: Partial<Record<DatasetId, DataManifest>> = {};

  for (const dataset of DATASET_CONFIGS) {
    const manifestPath = path.join(process.cwd(), 'public', 'manifests', dataset.fileName);
    const legacyPath = dataset.id === 'btrxd'
      ? path.join(process.cwd(), 'public', 'manifest.json')
      : null;
    const resolvedPath = fs.existsSync(manifestPath)
      ? manifestPath
      : legacyPath && fs.existsSync(legacyPath)
        ? legacyPath
        : null;

    if (!resolvedPath) continue;

    try {
      const raw = JSON.parse(fs.readFileSync(resolvedPath, 'utf-8'));
      manifests[dataset.id] = normalizeManifest(raw, dataset.id);
      console.log(`Loaded ${dataset.id} manifest: ${manifests[dataset.id]?.samples.length ?? 0} samples`);
    } catch (error) {
      console.warn(`Could not load ${dataset.id} manifest`, error);
    }
  }

  if (!manifests.btrxd && !manifests.fracatlas) {
    manifests.btrxd = normalizeManifest(FALLBACK_MANIFEST, 'btrxd');
  }

  const datasetOptions = DATASET_CONFIGS.map(dataset => ({
    id: dataset.id,
    label: dataset.label,
    available: Boolean(manifests[dataset.id]),
  }));
  const initialDataset: DatasetId = manifests.btrxd ? 'btrxd' : 'fracatlas';

  return {
    props: {
      manifests: JSON.parse(JSON.stringify(manifests)),
      datasetOptions,
      initialDataset,
    },
  };
};
