import React from 'react';

/**
 * Parse WordPress Gutenberg content to React components
 * Handles headings, paragraphs, lists, blockquotes, images, links, and tables
 */
export function parseWordPressContent(content: string): React.ReactNode[] {
  // Remove WordPress block comments
  let cleanContent = content
    .replace(/<!-- wp:[^>]+-->/g, '')
    .replace(/<!-- \/wp:[^>]+-->/g, '')
    .trim();

  // Split by closing tags to identify elements
  const elements: React.ReactNode[] = [];
  
  // Use a simple DOM parser approach - parse as HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${cleanContent}</div>`, 'text/html');
  const container = doc.body.firstChild;
  
  if (!container) return elements;

  const parseNode = (node: Node, index: number): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (!text.trim()) return null;
      return text;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return null;

    const element = node as Element;
    const tagName = element.tagName.toLowerCase();
    const children = Array.from(element.childNodes).map((child, i) => parseNode(child, i)).filter(Boolean);

    switch (tagName) {
      case 'h2':
        return (
          <h2 key={index} className="mb-4 mt-8 text-2xl font-bold text-foreground">
            {children}
          </h2>
        );
      case 'h3':
        return (
          <h3 key={index} className="mb-3 mt-6 text-xl font-semibold text-foreground">
            {children}
          </h3>
        );
      case 'h4':
        return (
          <h4 key={index} className="mb-2 mt-4 text-lg font-semibold text-foreground">
            {children}
          </h4>
        );
      case 'p':
        if (!element.textContent?.trim()) return null;
        return (
          <p key={index} className="mb-4 text-foreground/90 leading-relaxed">
            {children}
          </p>
        );
      case 'blockquote':
        return (
          <blockquote key={index} className="my-6 border-l-4 border-primary bg-secondary/30 py-3 px-4 italic text-muted-foreground rounded-r-md">
            {children}
          </blockquote>
        );
      case 'cite':
        return (
          <cite key={index} className="not-italic text-foreground/80">
            {children}
          </cite>
        );
      case 'ul':
        return (
          <ul key={index} className="mb-4 ml-6 list-disc space-y-2 text-foreground/90">
            {children}
          </ul>
        );
      case 'ol':
        return (
          <ol key={index} className="mb-4 ml-6 list-decimal space-y-2 text-foreground/90">
            {children}
          </ol>
        );
      case 'li':
        return (
          <li key={index} className="leading-relaxed">
            {children}
          </li>
        );
      case 'a':
        const href = element.getAttribute('href') || '#';
        const isExternal = href.startsWith('http') && !href.includes('le-comparateur-optimis.ch');
        const isInternal = href.includes('le-comparateur-optimis.ch') || href.startsWith('/');
        
        // Convert internal links to relative paths
        let linkHref = href;
        if (href.includes('le-comparateur-optimis.ch')) {
          try {
            const url = new URL(href);
            linkHref = url.pathname;
          } catch {
            linkHref = href;
          }
        }
        
        return (
          <a
            key={index}
            href={linkHref}
            className="text-primary hover:underline font-medium"
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
        );
      case 'strong':
      case 'b':
        return (
          <strong key={index} className="font-semibold">
            {children}
          </strong>
        );
      case 'em':
      case 'i':
        return (
          <em key={index} className="italic">
            {children}
          </em>
        );
      case 'figure':
        return (
          <figure key={index} className="my-6">
            {children}
          </figure>
        );
      case 'img':
        const src = element.getAttribute('src') || '';
        const alt = element.getAttribute('alt') || '';
        // Skip images from the old WordPress site (they return 421/404)
        if (src.includes('le-comparateur-optimis.ch/wp-content/uploads') || src.includes('${WP_IMAGE_BASE}') || src.includes('WP_IMAGE_BASE')) {
          return null;
        }
        return (
          <img
            key={index}
            src={src}
            alt={alt}
            className="w-full rounded-lg shadow-md"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        );
      case 'table':
        return (
          <div key={index} className="my-6 overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              {children}
            </table>
          </div>
        );
      case 'thead':
        return (
          <thead key={index} className="bg-secondary">
            {children}
          </thead>
        );
      case 'tbody':
        return <tbody key={index}>{children}</tbody>;
      case 'tr':
        return <tr key={index} className="border-b border-border">{children}</tr>;
      case 'th':
        return (
          <th key={index} className="px-4 py-2 text-left font-semibold text-foreground">
            {children}
          </th>
        );
      case 'td':
        return (
          <td key={index} className="px-4 py-2 text-foreground/90">
            {children}
          </td>
        );
      case 'br':
        return <br key={index} />;
      case 'div':
      case 'span':
        return <React.Fragment key={index}>{children}</React.Fragment>;
      default:
        return children.length > 0 ? (
          <React.Fragment key={index}>{children}</React.Fragment>
        ) : null;
    }
  };

  Array.from(container.childNodes).forEach((node, index) => {
    const parsed = parseNode(node, index);
    if (parsed) {
      elements.push(parsed);
    }
  });

  return elements;
}

/**
 * Simple markdown-like parser for simpler content format
 */
export function parseSimpleContent(content: string): React.ReactNode[] {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    if (!line.trim()) return;

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={index} className="mb-4 mt-8 text-2xl font-bold text-foreground">
          {line.replace('## ', '')}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={index} className="mb-3 mt-6 text-xl font-semibold text-foreground">
          {line.replace('### ', '')}
        </h3>
      );
    } else if (line.startsWith('> ')) {
      elements.push(
        <blockquote
          key={index}
          className="my-4 border-l-4 border-primary bg-secondary/30 py-2 pl-4 italic text-muted-foreground"
        >
          {line.replace('> ', '')}
        </blockquote>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <li key={index} className="ml-6 list-disc text-foreground">
          {parseBoldText(line.replace('- ', ''))}
        </li>
      );
    } else if (line.match(/^\d+\. /)) {
      elements.push(
        <li key={index} className="ml-6 list-decimal text-foreground">
          {parseBoldText(line.replace(/^\d+\. /, ''))}
        </li>
      );
    } else {
      elements.push(
        <p key={index} className="mb-4 text-foreground/90">
          {parseBoldText(line)}
        </p>
      );
    }
  });

  return elements;
}

function parseBoldText(text: string): React.ReactNode {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      part
    )
  );
}
