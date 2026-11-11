export interface HighlightSegment {
  text: string
  match: boolean
}

// Splits `text` into plain and matched segments, so the template renders <mark>
// elements without v-html (a project name can never inject markup).
export function splitHighlight(text: string, term: string): HighlightSegment[] {
  const needle = term.trim().toLowerCase()
  if (!needle) return [{ text, match: false }]

  const haystack = text.toLowerCase()
  const segments: HighlightSegment[] = []
  let cursor = 0
  let index = haystack.indexOf(needle)

  while (index !== -1) {
    if (index > cursor) segments.push({ text: text.slice(cursor, index), match: false })
    segments.push({ text: text.slice(index, index + needle.length), match: true })
    cursor = index + needle.length
    index = haystack.indexOf(needle, cursor)
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false })

  return segments
}
