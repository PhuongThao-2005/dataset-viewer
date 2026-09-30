import type { DataManifest, ImageSample } from './types';

export const FALLBACK_MANIFEST: DataManifest = {
  id: 'btrxd',
  name: "Medical X-ray Segmentation Viewer",
  description: "Fallback manifest used when no dataset manifest exists yet.",
  generatedAt: "2026-01-01",
  categories: [
    {
      id: "example_positive",
      label: "Example Positive",
      color: "#ef4444",
      description: "Example X-ray with a segmentation mask.",
    },
    {
      id: "normal",
      label: "Normal",
      color: "#22c55e",
      description: "Example normal X-ray without a mask.",
    },
  ],
  samples: generateFallbackSamples(),
};

function generateFallbackSamples(): ImageSample[] {
  return [
    {
      id: "example_xray_positive",
      dataset: "btrxd",
      category: "example_positive",
      status: "positive",
      split: "train",
      originalPath: "/images/example/original/example_xray.jpg",
      maskPath: "/images/example/mask/example_xray_mask.jpg",
      lesions: [{ id: "L1", areaRatio: 0.008 }],
      metadata: {
        source: "Fallback",
        notes: "Replace with public/manifests/btrxd.json",
        nLesions: 1,
        unionAreaRatio: 0.008,
      },
    },
    {
      id: "example_xray_normal",
      dataset: "btrxd",
      category: "normal",
      status: "normal",
      split: "train",
      originalPath: "/images/example/original/example_xray_normal.jpg",
      metadata: {
        source: "Fallback",
        nLesions: 0,
      },
    },
  ];
}
