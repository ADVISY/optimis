/**
 * WordPress XML Parser Script
 * 
 * This script parses a WordPress XML export file to extract:
 * 1. All posts with their _thumbnail_id metadata
 * 2. All attachments with their post_id and attachment_url
 * 3. Creates a mapping of post slugs to their featured image URLs
 * 
 * Usage: This script is meant to be run in a browser context where
 * the XML content is available, or can be adapted for Node.js with xml2js
 */

export interface PostData {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categorySlug: string;
  date: string;
  readTime: number;
  thumbnailId: string | null;
}

export interface AttachmentData {
  id: string;
  url: string;
  alt?: string;
}

export interface ImageMapping {
  [slug: string]: {
    thumbnailId: string;
    imageUrl: string;
    localPath: string;
  };
}

/**
 * Parse WordPress XML content to extract posts and attachments
 */
export function parseWordPressXML(xmlContent: string): {
  posts: PostData[];
  attachments: Map<string, AttachmentData>;
  imageMapping: ImageMapping;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');
  
  const items = doc.querySelectorAll('item');
  const posts: PostData[] = [];
  const attachments = new Map<string, AttachmentData>();
  
  // First pass: collect all items
  items.forEach((item) => {
    const postType = item.querySelector('post_type')?.textContent || '';
    const postId = item.querySelector('post_id')?.textContent || '';
    const postName = item.querySelector('post_name')?.textContent || '';
    const status = item.querySelector('status')?.textContent || '';
    
    if (postType === 'attachment') {
      // This is an attachment (image)
      const attachmentUrl = item.querySelector('attachment_url')?.textContent || '';
      const altMeta = Array.from(item.querySelectorAll('postmeta')).find(
        meta => meta.querySelector('meta_key')?.textContent === '_wp_attachment_image_alt'
      );
      const alt = altMeta?.querySelector('meta_value')?.textContent || '';
      
      if (postId && attachmentUrl) {
        attachments.set(postId, {
          id: postId,
          url: attachmentUrl,
          alt,
        });
      }
    } else if (postType === 'post' && status === 'publish') {
      // This is a blog post
      const title = item.querySelector('title')?.textContent || '';
      const contentEncoded = item.querySelector('encoded')?.textContent || '';
      const category = item.querySelector('category')?.textContent || '';
      const categorySlug = item.querySelector('category')?.getAttribute('nicename') || '';
      const pubDate = item.querySelector('post_date')?.textContent || '';
      
      // Get thumbnail ID from postmeta
      const thumbnailMeta = Array.from(item.querySelectorAll('postmeta')).find(
        meta => meta.querySelector('meta_key')?.textContent === '_thumbnail_id'
      );
      const thumbnailId = thumbnailMeta?.querySelector('meta_value')?.textContent || null;
      
      // Get excerpt from listing-short-details meta
      const excerptMeta = Array.from(item.querySelectorAll('postmeta')).find(
        meta => meta.querySelector('meta_key')?.textContent === 'listing-short-details'
      );
      const excerpt = excerptMeta?.querySelector('meta_value')?.textContent || '';
      
      // Get read time from post-read-time meta
      const readTimeMeta = Array.from(item.querySelectorAll('postmeta')).find(
        meta => meta.querySelector('meta_key')?.textContent === 'post-read-time'
      );
      const readTime = parseInt(readTimeMeta?.querySelector('meta_value')?.textContent || '3', 10);
      
      if (postId && postName && title) {
        posts.push({
          id: postId,
          slug: postName,
          title: cleanTitle(title),
          excerpt: excerpt || '',
          content: contentEncoded,
          category: category || 'Non classé',
          categorySlug: categorySlug || 'non-classe',
          date: formatDate(pubDate),
          readTime: readTime || 3,
          thumbnailId,
        });
      }
    }
  });
  
  // Second pass: create image mapping
  const imageMapping: ImageMapping = {};
  posts.forEach((post) => {
    if (post.thumbnailId && attachments.has(post.thumbnailId)) {
      const attachment = attachments.get(post.thumbnailId)!;
      const extension = getExtension(attachment.url);
      imageMapping[post.slug] = {
        thumbnailId: post.thumbnailId,
        imageUrl: attachment.url,
        localPath: `src/assets/blog/${post.slug}.${extension}`,
      };
    }
  });
  
  return { posts, attachments, imageMapping };
}

function cleanTitle(title: string): string {
  return title
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
}

function getExtension(url: string): string {
  const match = url.match(/\.([^./?]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : 'jpg';
}

/**
 * Generate the blogPosts.ts file content from parsed data
 */
export function generateBlogPostsFile(
  posts: PostData[],
  imageMapping: ImageMapping
): string {
  // Generate imports for local images
  const imports: string[] = [];
  const usedImages = new Set<string>();
  
  posts.forEach((post) => {
    if (imageMapping[post.slug]) {
      const varName = slugToVarName(post.slug);
      if (!usedImages.has(varName)) {
        usedImages.add(varName);
        imports.push(
          `import ${varName}Img from "@/assets/blog/${post.slug}.${getExtension(imageMapping[post.slug].imageUrl)}";`
        );
      }
    }
  });
  
  // Generate blog posts array
  const postsCode = posts.map((post) => {
    const imageVar = imageMapping[post.slug] 
      ? `${slugToVarName(post.slug)}Img`
      : '""';
    
    return `  {
    id: "${post.id}",
    slug: "${post.slug}",
    title: ${JSON.stringify(post.title)},
    excerpt: ${JSON.stringify(post.excerpt)},
    content: ${JSON.stringify(post.content)},
    category: "${post.category}",
    categorySlug: "${post.categorySlug}",
    date: "${post.date}",
    readTime: ${post.readTime},
    image: ${imageVar},
  }`;
  }).join(',\n');
  
  return `// Auto-generated from WordPress XML export
// Contains blog posts from le-comparateur-optimis.ch

${imports.join('\n')}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  categorySlug: string;
  date: string;
  readTime: number;
  image: string;
  metaDescription?: string;
}

export const blogPosts: BlogPost[] = [
${postsCode}
];

// Categories derived from posts
export const categories = [
  { name: "Tous", slug: "all" },
  ...Array.from(
    new Set(blogPosts.map((post) => JSON.stringify({ name: post.category, slug: post.categorySlug })))
  ).map((cat) => JSON.parse(cat)),
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPostsByCategory(categorySlug: string): BlogPost[] {
  if (categorySlug === "all") return blogPosts;
  return blogPosts.filter((post) => post.categorySlug === categorySlug);
}

export function getPaginatedPostsByCategory(
  categorySlug: string,
  page: number,
  postsPerPage: number
): { posts: BlogPost[]; totalPages: number } {
  const filteredPosts = getPostsByCategory(categorySlug);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (page - 1) * postsPerPage;
  const posts = filteredPosts.slice(startIndex, startIndex + postsPerPage);
  return { posts, totalPages };
}
`;
}

function slugToVarName(slug: string): string {
  return slug
    .split('-')
    .map((word, index) => 
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('')
    .replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Generate a download list for images
 */
export function generateImageDownloadList(imageMapping: ImageMapping): string {
  const lines = Object.entries(imageMapping).map(([slug, data]) => {
    return `${data.imageUrl} -> ${data.localPath}`;
  });
  
  return lines.join('\n');
}
