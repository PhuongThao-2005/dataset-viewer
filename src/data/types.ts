// src/data/types.ts
export interface ImageSample {
  id: string;
  category: string;       // e.g. "glioma", "meningioma", "pituitary", "no_tumor"
  subcategory?: string;   // optional finer label
  split: 'train' | 'test' | 'val';
  originalPath: string;   // path to original image (relative to /public/images/)
  maskPath: string;       // path to mask image (relative to /public/images/)
  metadata?: {
    width?: number;
    height?: number;
    source?: string;
    notes?: string;
  };
}

export interface DataManifest {
  name: string;
  description: string;
  categories: CategoryMeta[];
  samples: ImageSample[];
  generatedAt: string;
}

export interface CategoryMeta {
  id: string;
  label: string;
  color: string;
  description: string;
  count?: number;
}
