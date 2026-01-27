/**
 * Script to parse WordPress XML and generate blog posts data
 * This runs in a browser context and outputs the full blogPosts.ts content
 * 
 * To use: Copy this logic into browser console with the XML content loaded
 */

export interface ExtractedPost {
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

export interface ExtractedAttachment {
  id: string;
  url: string;
  alt?: string;
}

/**
 * Clean HTML entities in text
 */
function cleanText(text: string): string {
  return text
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .trim();
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(dateStr: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

/**
 * Get file extension from URL
 */
function getExtension(url: string): string {
  const match = url.match(/\.([^./?]+)(?:\?|$)/);
  return match ? match[1].toLowerCase() : 'jpg';
}

/**
 * Extract text content from an element, handling CDATA
 */
function getElementText(element: Element | null): string {
  if (!element) return '';
  return cleanText(element.textContent || '');
}

/**
 * Get meta value from postmeta elements
 */
function getMetaValue(item: Element, metaKey: string): string | null {
  const metas = item.querySelectorAll('postmeta');
  for (const meta of Array.from(metas)) {
    const key = meta.querySelector('meta_key')?.textContent?.replace('<![CDATA[', '').replace(']]>', '').trim();
    if (key === metaKey) {
      const value = meta.querySelector('meta_value')?.textContent?.replace('<![CDATA[', '').replace(']]>', '').trim();
      return value || null;
    }
  }
  return null;
}

/**
 * Parse WordPress XML export file
 */
export function parseWordPressXML(xmlContent: string): {
  posts: ExtractedPost[];
  attachments: Map<string, ExtractedAttachment>;
} {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');
  
  const items = doc.querySelectorAll('item');
  const posts: ExtractedPost[] = [];
  const attachments = new Map<string, ExtractedAttachment>();
  
  // Process all items
  items.forEach((item) => {
    const postType = getElementText(item.querySelector('post_type'));
    const status = getElementText(item.querySelector('status'));
    const postId = getElementText(item.querySelector('post_id'));
    
    if (postType === 'attachment') {
      // Extract attachment data
      const attachmentUrl = getElementText(item.querySelector('attachment_url'));
      const altMeta = getMetaValue(item, '_wp_attachment_image_alt');
      
      if (postId && attachmentUrl) {
        attachments.set(postId, {
          id: postId,
          url: attachmentUrl,
          alt: altMeta || undefined,
        });
      }
    } else if (postType === 'post' && status === 'publish') {
      // Extract post data
      const slug = getElementText(item.querySelector('post_name'));
      const title = getElementText(item.querySelector('title'));
      
      // Get content from content:encoded
      const contentElements = item.getElementsByTagName('content:encoded');
      const content = contentElements.length > 0 
        ? cleanText(contentElements[0].textContent || '')
        : '';
      
      // Get category
      const categoryElement = item.querySelector('category[domain="category"]');
      const category = categoryElement ? cleanText(categoryElement.textContent || '') : 'Non classé';
      const categorySlug = categoryElement?.getAttribute('nicename') || 'non-classe';
      
      // Get date
      const postDate = getElementText(item.querySelector('post_date'));
      
      // Get meta values
      const thumbnailId = getMetaValue(item, '_thumbnail_id');
      const readTimeStr = getMetaValue(item, 'post-read-time');
      const readTime = readTimeStr ? parseInt(readTimeStr, 10) : 3;
      const excerpt = getMetaValue(item, 'listing-short-details') || '';
      
      if (postId && slug && title) {
        posts.push({
          id: postId,
          slug,
          title,
          excerpt,
          content,
          category,
          categorySlug,
          date: formatDate(postDate),
          readTime: isNaN(readTime) ? 3 : readTime,
          thumbnailId,
        });
      }
    }
  });
  
  // Sort posts by date (newest first)
  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return { posts, attachments };
}

/**
 * Generate a download list of images to fetch
 */
export function generateImageDownloadList(
  posts: ExtractedPost[],
  attachments: Map<string, ExtractedAttachment>
): Array<{ slug: string; thumbnailId: string; imageUrl: string; localPath: string }> {
  const downloads: Array<{ slug: string; thumbnailId: string; imageUrl: string; localPath: string }> = [];
  
  posts.forEach((post) => {
    if (post.thumbnailId && attachments.has(post.thumbnailId)) {
      const attachment = attachments.get(post.thumbnailId)!;
      const extension = getExtension(attachment.url);
      downloads.push({
        slug: post.slug,
        thumbnailId: post.thumbnailId,
        imageUrl: attachment.url,
        localPath: `src/assets/blog/${post.slug}.${extension}`,
      });
    }
  });
  
  return downloads;
}

/**
 * Escape string for TypeScript template literal
 */
function escapeForTS(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\${/g, '\\${');
}

/**
 * Convert slug to valid JS variable name
 */
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
 * Generate the blogPosts.ts file content
 */
export function generateBlogPostsTS(
  posts: ExtractedPost[],
  attachments: Map<string, ExtractedAttachment>
): string {
  // Track which images exist and generate imports
  const imageImports: string[] = [];
  const postImageVars = new Map<string, string>();
  
  posts.forEach((post) => {
    if (post.thumbnailId && attachments.has(post.thumbnailId)) {
      const attachment = attachments.get(post.thumbnailId)!;
      const extension = getExtension(attachment.url);
      const varName = `${slugToVarName(post.slug)}Img`;
      
      imageImports.push(
        `import ${varName} from "@/assets/blog/${post.slug}.${extension}";`
      );
      postImageVars.set(post.slug, varName);
    }
  });
  
  // Generate posts array
  const postsCode = posts.map((post) => {
    const imageVar = postImageVars.get(post.slug) || 'defaultBlogImg';
    
    return `  {
    id: "${post.id}",
    slug: "${post.slug}",
    title: ${JSON.stringify(post.title)},
    excerpt: ${JSON.stringify(post.excerpt)},
    content: \`${escapeForTS(post.content)}\`,
    category: "${post.category}",
    categorySlug: "${post.categorySlug}",
    date: "${post.date}",
    readTime: ${post.readTime},
    image: ${imageVar},
  }`;
  }).join(',\n');
  
  return `// Auto-generated from WordPress XML export
// Contains blog posts from le-comparateur-optimis.ch

// Default fallback image
import defaultBlogImg from "@/assets/blog/comparer-assurances.jpg";

// Featured images for each post
${imageImports.join('\n')}

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
  ).map((cat) => JSON.parse(cat) as { name: string; slug: string }),
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
