// Keep ingestion deterministic: the same input produces the same text chunks.
export function normalizeText(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

export function chunkText(value, options = {}) {
  const size = options.size ?? 950;
  const overlap = options.overlap ?? 150;
  if (!Number.isInteger(size) || size < 100 || !Number.isInteger(overlap) || overlap < 0 || overlap >= size) {
    throw new RangeError("Invalid chunk size or overlap.");
  }
  const text = normalizeText(value);
  if (!text) return [];

  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const limit = Math.min(start + size, text.length);
    let end = limit;
    if (limit < text.length) {
      const lastBoundary = Math.max(text.lastIndexOf(" ", limit), text.lastIndexOf("\n", limit));
      if (lastBoundary > start + Math.floor(size * 0.6)) end = lastBoundary;
    }
    const content = text.slice(start, end).trim();
    if (content) chunks.push({ index: chunks.length, text: content });
    if (end >= text.length) break;
    const next = Math.max(0, end - overlap);
    start = Math.max(start + 1, next);
    while (start < text.length && /\s/.test(text[start])) start++;
  }
  return chunks;
}
