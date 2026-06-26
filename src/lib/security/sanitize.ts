import sanitizeHtml from 'sanitize-html';

export function sanitizeTrustedHtml(input: string): string {
  if (!input || !input.trim()) {
    return '';
  }

  return sanitizeHtml(input, {
    allowedTags: [
      'p',
      'h1',
      'h2',
      'h3',
      'h4',
      'strong',
      'em',
      'a',
      'ul',
      'ol',
      'li',
      'blockquote',
      'hr',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'br',
      'code',
      'pre',
      'iframe',
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'loading', 'referrerpolicy'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesAppliedToAttributes: ['href', 'src'],
    allowedIframeHostnames: [
      'www.youtube.com',
      'youtube.com',
      'www.google.com',
      'maps.google.com',
      'www.openstreetmap.org',
      'embed.openstreetmap.org',
    ],
    disallowedTagsMode: 'discard',
  });
}

export function sanitizeMapEmbed(input: string): string {
  const trimmed = input?.trim() || '';

  if (!trimmed) {
    return '';
  }

  if (trimmed.includes('<iframe')) {
    const sanitized = sanitizeTrustedHtml(trimmed);
    return sanitized.includes('<iframe') ? sanitized : '';
  }

  const normalized = trimmed.replace(/\s+/g, '');
  if (!/^https?:\/\//i.test(normalized)) {
    return '';
  }

  return `<iframe src="${normalized}" class="w-full h-full border-0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
}
