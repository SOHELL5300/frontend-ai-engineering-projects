// Embedding cosine similarity; no vector database required for this local teaching demo.
export function cosineSimilarity(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || !a.length || a.length !== b.length) return 0;
  let dot = 0;
  let sumA = 0;
  let sumB = 0;
  for (let i = 0; i < a.length; i++) {
    if (!Number.isFinite(a[i]) || !Number.isFinite(b[i])) return 0;
    dot += a[i] * b[i];
    sumA += a[i] * a[i];
    sumB += b[i] * b[i];
  }
  if (sumA === 0 || sumB === 0) return 0;
  return dot / (Math.sqrt(sumA) * Math.sqrt(sumB));
}

export function rankChunks(documents, queryEmbedding, options = {}) {
  const topK = options.topK ?? 4;
  const minScore = options.minScore ?? 0.16;
  if (!Number.isInteger(topK) || topK < 1 || topK > 10) throw new RangeError("topK must be 1-10.");
  return documents.flatMap((document) =>
    document.chunks.map((chunk) => ({
      documentId: document.id,
      title: document.title,
      chunkIndex: chunk.index,
      text: chunk.text,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))
  ).filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
