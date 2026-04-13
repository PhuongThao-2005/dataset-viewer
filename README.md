# BTRXD Viewer

Basic Next.js website to browse BTRXD-style brain MRI images by category, with before/after mask comparison.

## Folder Structure

```text
BTRXD_viewer/
  public/
    images/
      <category>/
        original/
        mask/
    manifest.json
  scripts/
    generate_manifest.py
  src/
    components/
    data/
    pages/
    styles/
```

## Dataset Processing Flow (Kaggle -> Viewer)

1. Download dataset from Kaggle to local machine.
2. Run `scripts/generate_manifest.py` to:
  - copy/resize source images into `public/images/...`
  - create or copy masks into `public/images/.../mask`
  - generate `public/manifest.json`
3. Start app with `npm run dev` (or deploy to Vercel).

## Quick Local Test

1. Install dependencies:

```bash
npm install
```

1. Generate a small manifest for testing:

```bash
python scripts/generate_manifest.py --dataset "D:/datasets/BTRXD" --output "./public" --max 30
```

1. Run:

```bash
npm run dev
```

1. Open `http://localhost:3000`

## Cloud Storage Setup (recommended for Vercel)

Use this mode when dataset is large.

1. Generate optimized images + manifest with cloud URLs:

```bash
python scripts/generate_manifest.py --dataset "D:/datasets/BTRXD" --output "./public" --cloud-base-url "https://your-cdn-domain.com" --cloud-prefix "images"
```

1. Upload local folder `public/images/` to cloud storage at:
  - `https://your-cdn-domain.com/images/...`
2. Keep `public/manifest.json` in this project (do not upload raw dataset to Vercel).
3. Deploy app to Vercel normally.

The app will read `manifest.json`, and each sample image path will point to your cloud URL.

## If Your Labels Are Only In `dataset.xlsx`

If folders are just `images/` and `masks/` (no class subfolders), use XLSX mode:

```bash
python scripts/generate_manifest.py --dataset "D:/datasets/BTRXD/images" --masks "D:/datasets/BTRXD/masks" --labels-xlsx "D:/datasets/BTRXD/dataset.xlsx" --image-col "image" --mask-col "mask" --class-col "class" --split-col "split" --output "./public" --cloud-base-url "https://your-cdn-domain.com" --cloud-prefix "images"
```

Notes:

- `--image-col`, `--mask-col`, `--class-col`, `--split-col` must match your XLSX header names.
- If your XLSX has no split column, remove `--split-col ...` and add `--default-split train`.
- If image/mask values in XLSX include absolute paths, script will also try basename fallback.

For one-hot labels (no single `class` column), use:

```bash
python scripts/generate_manifest.py --dataset "D:/datasets/BTRXD/images" --masks "D:/datasets/BTRXD/masks" --labels-xlsx "D:/datasets/BTRXD/dataset.xlsx" --image-col "image_id" --class-onehot-cols "osteochondroma,multiple osteochondromas,simple bone cyst,giant cell tumor,osteofibroma,synovial osteochondroma,other bt,osteosarcoma,other mt" --default-split train --output "./public"
```

## Example Commands

```bash
python scripts/generate_manifest.py --dataset "D:/datasets/BTRXD" --output "./public"
```

Optional:

```bash
python scripts/generate_manifest.py --dataset "D:/datasets/BTRXD" --masks "D:/datasets/BTRXD_masks" --output "./public" --max 50
```

Cloud URL + separate masks:

```bash
python scripts/generate_manifest.py --dataset "D:/datasets/BTRXD" --masks "D:/datasets/BTRXD_masks" --output "./public" --cloud-base-url "https://your-cdn-domain.com" --cloud-prefix "images"
```

## Vercel Notes

- Keep image size optimized (script already resizes large images).
- For very large datasets, store images on cloud object storage (S3/R2) and keep only `manifest.json` in the app.
- Commit code only; avoid committing huge raw Kaggle dataset folders.

