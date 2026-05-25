import { describe, it, expect } from "vitest";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

import { blogPosts } from "@/data/blogPosts";

type DownloadItem = {
  slug: string;
  thumbnailId: string;
  imageUrl: string;
  targetPath: string;
};

type PostFromXml = {
  id: string;
  slug: string;
  title: string;
  thumbnailId: string | null;
  category: string;
  categorySlug: string;
  date: string;
  contentPreview: string;
};

function getFirstDirectChildByLocalName(parent: Element, localName: string): Element | null {
  for (const child of Array.from(parent.children)) {
    if (child.localName === localName) return child;
  }
  return null;
}

function textOfDirectChild(parent: Element, localName: string): string {
  return (getFirstDirectChildByLocalName(parent, localName)?.textContent || "").trim();
}

function getMetaValue(item: Element, key: string): string | null {
  const metas = Array.from(item.getElementsByTagName("*"))
    .filter((el) => el.localName === "postmeta") as Element[];

  for (const meta of metas) {
    const metaKey = textOfDirectChild(meta, "meta_key")
      .replace("<![CDATA[", "")
      .replace("]]>", "")
      .trim();
    if (metaKey !== key) continue;
    return textOfDirectChild(meta, "meta_value")
      .replace("<![CDATA[", "")
      .replace("]]>", "")
      .trim();
  }

  return null;
}

function extensionFromUrl(url: string): string {
  const match = url.match(/\.([^./?]+)(?:\?|$)/);
  return (match?.[1] || "jpg").toLowerCase();
}

function cleanTitle(title: string): string {
  return title
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .trim();
}

describe("featured images from WordPress XML", () => {
  it("exports a download list for current slugs AND lists posts not yet imported", () => {
    const xmlPath = path.resolve(process.cwd(), "src/data/wordpress-export.xml");
    const xml = readFileSync(xmlPath, "utf8");

    const doc = new DOMParser().parseFromString(xml, "text/xml");
    const items = Array.from(doc.getElementsByTagName("item"));

    const attachmentUrlById = new Map<string, string>();
    const postThumbnailBySlug = new Map<string, string>();
    const allPublishedPosts: PostFromXml[] = [];

    for (const item of items) {
      const postType = textOfDirectChild(item, "post_type");
      const status = textOfDirectChild(item, "status");
      const postId = textOfDirectChild(item, "post_id");

      if (postType === "attachment") {
        const attachmentUrl = textOfDirectChild(item, "attachment_url");
        if (postId && attachmentUrl) attachmentUrlById.set(postId, attachmentUrl);
        continue;
      }

      if (postType !== "post" || status !== "publish") continue;
      const slug = textOfDirectChild(item, "post_name");
      if (!slug) continue;

      const thumbnailId = getMetaValue(item, "_thumbnail_id");
      if (thumbnailId) postThumbnailBySlug.set(slug, thumbnailId);

      // Get category
      const categoryEl = item.querySelector("category[domain='category']");
      const category = categoryEl?.textContent?.replace(/<!\[CDATA\[|\]\]>/g, "").trim() || "Non classé";
      const categorySlug = categoryEl?.getAttribute("nicename") || "non-classe";

      // Get date
      const pubDate = textOfDirectChild(item, "post_date");
      const date = pubDate ? pubDate.split(" ")[0] : new Date().toISOString().split("T")[0];

      // Get title
      const title = cleanTitle(item.querySelector("title")?.textContent || "");

      // Get content preview (first 200 chars)
      const contentEl = Array.from(item.children).find(c => c.localName === "encoded");
      const content = contentEl?.textContent || "";
      const contentPreview = content.slice(0, 500);

      allPublishedPosts.push({
        id: postId,
        slug,
        title,
        thumbnailId,
        category,
        categorySlug,
        date,
        contentPreview,
      });
    }

    // Current slugs in blogPosts
    const existingSlugs = new Set(blogPosts.map((p) => p.slug));
    
    // Posts NOT yet imported
    const postsToImport = allPublishedPosts.filter(p => !existingSlugs.has(p.slug));

    // Downloads for current posts
    const slugs = Array.from(existingSlugs);
    const downloads: DownloadItem[] = [];
    const missingSlugs: string[] = [];
    const missingAttachments: Array<{ slug: string; thumbnailId: string }> = [];

    for (const slug of slugs) {
      const thumbnailId = postThumbnailBySlug.get(slug);
      if (!thumbnailId) {
        missingSlugs.push(slug);
        continue;
      }

      const imageUrl = attachmentUrlById.get(thumbnailId);
      if (!imageUrl) {
        missingAttachments.push({ slug, thumbnailId });
        continue;
      }

      const ext = extensionFromUrl(imageUrl);
      downloads.push({
        slug,
        thumbnailId,
        imageUrl,
        targetPath: `src/assets/blog/featured/${slug}.${ext}`,
      });
    }

    // Prepare download list for posts to import (next 10)
    const next50ToImport = postsToImport.slice(0, 50).map(p => {
      const imageUrl = p.thumbnailId ? attachmentUrlById.get(p.thumbnailId) : null;
      return {
        ...p,
        imageUrl,
        targetPath: imageUrl 
          ? `src/assets/blog/featured/${p.slug}.${extensionFromUrl(imageUrl)}`
          : null,
      };
    });

    const outDir = path.resolve(process.cwd(), "src/data");
    mkdirSync(outDir, { recursive: true });

    writeFileSync(
      path.join(outDir, "featuredImageDownloads.generated.json"),
      JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          existingCount: existingSlugs.size,
          totalInXml: allPublishedPosts.length,
          remainingToImport: postsToImport.length,
          slugs,
          downloads,
          missingSlugs,
          missingAttachments,
          next50ToImport,
        },
        null,
        2
      ),
      "utf8"
    );

    // The test should not fail the suite; it only produces an artifact.
    expect(Array.isArray(downloads)).toBe(true);
    expect(postsToImport.length).toBeGreaterThanOrEqual(0);
  });
});
