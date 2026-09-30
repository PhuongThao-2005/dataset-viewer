export type DatasetId = 'btrxd' | 'fracatlas';

export interface LesionInfo {
  id: string;
  areaPx?: number;
  areaRatio?: number;
  bbox?: number[];
  sizeGroup?: 'small' | 'medium' | 'large';
}

export interface ImageSample {
  id: string;
  dataset: DatasetId;
  category: string;
  status?: 'positive' | 'normal';
  split?: 'train' | 'test' | 'val';
  originalPath: string;
  maskPath?: string;
  overlayPath?: string;
  lesions?: LesionInfo[];
  metadata?: {
    width?: number;
    height?: number;
    filename?: string;
    source?: string;
    notes?: string;
    nLesions?: number;
    unionAreaPx?: number;
    unionAreaRatio?: number;
  };
}

export interface DataManifest {
  id?: DatasetId;
  name: string;
  description: string;
  categories: CategoryMeta[];
  samples: ImageSample[];
  generatedAt?: string;
}

export interface CategoryMeta {
  id: string;
  label: string;
  color: string;
  description: string;
  count?: number;
}
