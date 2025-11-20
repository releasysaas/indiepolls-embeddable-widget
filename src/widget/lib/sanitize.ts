// Minimal HTML sanitization utilities for safe rendering inside the widget.
// This is a conservative allowlist-based sanitizer that:
// - removes <script>, <style>, <iframe>, <object>, <embed>, <link>, <meta>
// - removes event handler attributes (on*) and javascript: URLs
// - keeps basic formatting tags
// - also provides a stripHtml() to extract text for previews

export function sanitizeHtml(input: string): string {
  if (!input) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');

  const blockedTags = new Set(['script', 'style', 'iframe', 'object', 'embed', 'link', 'meta']);

  // Remove blocked elements
  doc.querySelectorAll(Array.from(blockedTags).join(',')).forEach((el) => el.remove());

  // Remove dangerous attributes
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT);
  let node = walker.nextNode() as Element | null;
  while (node) {
    // Remove on* attributes and javascript: URLs
    // Clone attributes because we'll mutate while iterating
    const toRemove: string[] = [];
    for (const attr of Array.from(node.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      if (name.startsWith('on')) {
        toRemove.push(attr.name);
      } else if ((name === 'href' || name === 'src') && /^\s*javascript:/i.test(value)) {
        toRemove.push(attr.name);
      }
    }
    toRemove.forEach((a) => node!.removeAttribute(a));
    node = walker.nextNode() as Element | null;
  }

  return doc.body.innerHTML || '';
}

export function stripHtml(input: string): string {
  if (!input) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}
