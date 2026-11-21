import { EMBED_MODEL, embedTexts, answerWithContext, OllamaError } from "../../../lib/ollama.mjs";
import { readIndex } from "../../../lib/store.mjs";
import { rankChunks } from "../../../lib/search.mjs";

export const runtime = "nodejs";

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (question.length < 3 || question.length > 500) {
    return Response.json({ error: "Question must be between 3 and 500 characters." }, { status: 400 });
  }
  try {
    const index = await readIndex();
    if (!index.documents.length) {
      return Response.json({ error: "Add a document to the knowledge base first." }, { status: 409 });
    }
    const matching = index.documents.filter((document) => document.embedModel === EMBED_MODEL);
    if (!matching.length) {
      return Response.json({ error: "The embedding model changed. Re-ingest your documents using the currently configured model." }, { status: 409 });
    }
    const [queryEmbedding] = await embedTexts([question]);
    const sources = rankChunks(matching, queryEmbedding, { topK: 4, minScore: 0.16 });
    if (!sources.length) {
      return Response.json({
        answer: "I could not find sufficiently relevant information in your uploaded documents.",
        sources: [], grounded: false,
      });
    }
    const answer = await answerWithContext(question, sources);
    return Response.json({
      answer, grounded: true,
      sources: sources.map((source, index) => ({
        citation: index + 1, title: source.title, documentId: source.documentId,
        chunkIndex: source.chunkIndex, excerpt: source.text, similarity: Number(source.score.toFixed(3)),
      })),
    });
  } catch (error) {
    return Response.json({
      error: error instanceof OllamaError ? error.message : "Unable to search the knowledge base.",
    }, { status: error instanceof OllamaError ? 502 : 500 });
  }
}
