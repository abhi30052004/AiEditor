function escapeHtml(input) {
  return String(input)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function textToHtml(input) {
  const trimmed = String(input || '').trim()

  if (!trimmed) {
    return '<p></p>'
  }

  return trimmed
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br />')}</p>`)
    .join('')
}

export function htmlToPlainText(html) {
  if (typeof window === 'undefined') {
    return String(html || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const doc = new DOMParser().parseFromString(html || '', 'text/html')
  return (doc.body.textContent || '').trim()
}
