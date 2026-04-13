import type { DataManifest, ImageSample } from './types';

// ─────────────────────────────────────────────────────────────
// DEMO MANIFEST
// Replace this with your own manifest.json generated from Kaggle
// See: /scripts/generate_manifest.py
// ─────────────────────────────────────────────────────────────

export const DEMO_MANIFEST: DataManifest = {
  name: "Brain Tumor MRI Dataset (BTRXD)",
  description: "Segmentation dataset với ảnh gốc và binary mask cho 4 loại khối u não.",
  generatedAt: "2025-01-01",
  categories: [
    {
      id: "glioma",
      label: "Glioma",
      color: "#ff4444",
      description: "Khối u xuất phát từ tế bào glial — dạng phổ biến nhất, thường ác tính.",
    },
    {
      id: "meningioma",
      label: "Meningioma",
      color: "#ffa500",
      description: "Khối u màng não, thường lành tính, phát triển chậm.",
    },
    {
      id: "pituitary",
      label: "Pituitary",
      color: "#8b5cf6",
      description: "Khối u tuyến yên, ảnh hưởng đến hệ nội tiết.",
    },
    {
      id: "no_tumor",
      label: "No Tumor",
      color: "#00ff88",
      description: "Ảnh não không có khối u — dùng làm negative sample.",
    },
  ],
  samples: [
    // DEMO samples — dùng placeholder images từ Unsplash (grayscale medical-looking)
    // Khi có dataset thật, replace bằng đường dẫn ảnh thực tế
    ...generateDemoSamples(),
  ],
};

function generateDemoSamples(): ImageSample[] {
  const categories = ['glioma', 'meningioma', 'pituitary', 'no_tumor'];
  const samples: ImageSample[] = [];
  
  // Using placeholder MRI-like images via picsum (grayscale)
  const placeholderOriginals = [
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Axial_MRI_of_human_head_in_patient_with_progressive_multifocal_leukoencephalopathy_with_HIV_disease.jpg/440px-Axial_MRI_of_human_head_in_patient_with_progressive_multifocal_leukoencephalopathy_with_HIV_disease.jpg',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Axial_MRI_of_human_head_in_patient_with_progressive_multifocal_leukoencephalopathy_with_HIV_disease.jpg/440px-Axial_MRI_of_human_head_in_patient_with_progressive_multifocal_leukoencephalopathy_with_HIV_disease.jpg',
  ];

  let id = 1;
  for (const cat of categories) {
    for (let i = 0; i < 6; i++) {
      const seed = (id * 17) % 100;
      samples.push({
        id: `${cat}_${String(i + 1).padStart(3, '0')}`,
        category: cat,
        split: (i < 4 ? 'train' : i < 5 ? 'val' : 'test') as ImageSample['split'],
        // These are PUBLIC placeholder paths — replace with your actual dataset paths
        originalPath: `/images/${cat}/original/${cat}_${String(i + 1).padStart(3, '0')}.jpg`,
        maskPath: `/images/${cat}/mask/${cat}_${String(i + 1).padStart(3, '0')}_mask.jpg`,
        metadata: {
          source: 'Kaggle BTRXD',
          notes: `Demo sample ${id}`,
        },
      });
      id++;
    }
  }
  return samples;
}
