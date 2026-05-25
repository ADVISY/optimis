// Featured images (images à la une) downloaded locally from WordPress XML _thumbnail_id mapping.
// We keep them separate from other assets to avoid mixing with in-article images.

type GlobModule = Record<string, { default: string }>;

// Vite will replace this at build time.
const modules = import.meta.glob(
  "../assets/blog/featured/*.{jpg,jpeg,png,webp,avif,gif,svg}",
  { eager: true }
) as GlobModule;

const featuredBySlug: Record<string, string> = {};

for (const [filePath, mod] of Object.entries(modules)) {
  const fileName = filePath.split("/").pop();
  if (!fileName) continue;
  const slug = fileName.replace(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i, "");
  featuredBySlug[slug] = mod.default;
}

export function getFeaturedImageBySlug(slug: string): string | undefined {
  return featuredBySlug[slug];
}

export function getFeaturedImagesIndex(): Record<string, string> {
  return { ...featuredBySlug };
}
