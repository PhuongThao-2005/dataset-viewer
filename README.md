# BTRXD Viewer

Multi-dataset medical X-ray segmentation viewer built with Next.js. The app can browse categories, search sample IDs, inspect masks, and view lesion metadata from static JSON manifests.

Currently supported dataset slots:

- `BTRXD`
- `FracAtlas`

## Manifest Structure

The viewer reads dataset manifests from:

```text
public/
  manifests/
    btrxd.json
    fracatlas.json
    fracatlas.example.json
```

`public/manifests/btrxd.json` is the current BTRXD manifest. `public/manifests/fracatlas.json` is optional; if it does not exist, the app still builds and the FracAtlas option is shown as not generated.

The legacy `public/manifest.json` path is still accepted as a fallback for BTRXD during transition, but new generated manifests should use `public/manifests/btrxd.json`.

## Manifest Schema

Each sample uses the generic schema:

```ts
{
  id: string;
  dataset: 'btrxd' | 'fracatlas';
  category: string;
  status?: 'positive' | 'normal';
  split?: 'train' | 'val' | 'test';
  originalPath: string;
  maskPath?: string;
  overlayPath?: string;
  lesions?: Array<{
    id: string;
    areaPx?: number;
    areaRatio?: number;
    bbox?: number[];
    sizeGroup?: 'small' | 'medium' | 'large';
  }>;
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
```

Image paths can be local public paths such as `/images/...` or absolute cloud URLs.

## Dataset Processing Flow

1. Download or prepare the dataset locally.
2. Generate or export a manifest into `public/manifests/<dataset>.json`.
3. Store images locally under `public/images/...` for small tests, or upload them to object storage and keep cloud URLs in the manifest.
4. Run the app.

## BTRXD Generation

The existing script now writes BTRXD manifests to `public/manifests/btrxd.json` and image assets to `public/images/...`:

```bash
python scripts/generate_manifest.py --dataset "D:/datasets/BTRXD" --output "./public"
```

Cloud URL mode:

```bash
python scripts/generate_manifest.py --dataset "D:/datasets/BTRXD" --output "./public" --cloud-base-url "https://your-cdn-domain.com" --cloud-prefix "images"
```

For XLSX labels:

```bash
python scripts/generate_manifest.py --dataset "D:/datasets/BTRXD/images" --masks "D:/datasets/BTRXD/masks" --labels-xlsx "D:/datasets/BTRXD/dataset.xlsx" --image-col "image" --mask-col "mask" --class-col "class" --split-col "split" --output "./public"
```

For one-hot labels:

```bash
python scripts/generate_manifest.py --dataset "D:/datasets/BTRXD/images" --masks "D:/datasets/BTRXD/masks" --labels-xlsx "D:/datasets/BTRXD/dataset.xlsx" --image-col "image_id" --class-onehot-cols "osteochondroma,multiple osteochondromas,simple bone cyst,giant cell tumor,osteofibroma,synovial osteochondroma,other bt,osteosarcoma,other mt" --default-split train --output "./public"
```

## FracAtlas

FracAtlas should generate:

```text
public/manifests/fracatlas.json
```

Expected categories are:

- `fractured`
- `normal`

Use `public/manifests/fracatlas.example.json` as a small reference manifest with one fractured sample containing two lesions and one normal sample.

## Adding A Dataset

1. Add a new manifest file under `public/manifests/`.
2. Use stable category IDs and include a `categories` array when possible.
3. Include `status`, `lesions`, and area ratios only when they are available.
4. Add the dataset ID to `DATASET_CONFIGS` in `src/pages/index.tsx`.

Statistics, category filters, status filters, lesion count filters, grid cards, and the lightbox are computed from the selected manifest. Avoid hard-coding dataset counts in the frontend.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build Check

```bash
npm run build
```

## Deployment Notes

- Do not commit raw datasets or thousands of image files.
- Keep large image assets in cloud storage such as S3, R2, or a CDN.
- Commit code and small manifest files only.
- `public/images` is ignored by git.
