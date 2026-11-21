import { createHash, randomUUID } from "node:crypto";
import { normalizeText, chunkText } from "../../../lib/chunk.mjs";
import { EMBED_MODEL, embedTexts, OllamaError } from "../../../lib/ollama.mjs";
import { readIndex, addDocument, removeDocument, publicDocument } from "../../../lib/store.mjs";

export const runtime = "nodejs";

export async function GET() {
  try {
    const data = await readIndex();
    return Response.json({ documents: data.documents.map(publicDocument) });
  } catch {
    return Response.json({ error: "Could not read the local index." }, { status: 500 });
  }
}

export async function POST(request) {
  let input;
  try { input = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const title = typeof input?.title === "string" ? input.title.trim() : "";
  const content = normalizeText(input?.text);
  if (title.length < 2 || title.length > 120) {
    return Response.json({ error: "Title must contain 2 to 120 characters." }, { status: 400 });
  }
  if (content.length < 40 || content.length > 50000) {
    return Response.json({ error: "Document must contain 40 to 50,000 characters." }, { status: 400 });
  }
  const chunks = chunkText(content);
  if (chunks.length > 100) return Response.json({ error: "Too many chunks." }, { status: 400 });

  try {
    const vectors = await embedTexts(chunks.map((chunk) => chunk.text));
    const dimensions = vectors[0]?.length;
    if (!dimensions || vectors.some((vector) => vector.length !== dimensions)) {
      return Response.json({ error: "Inconsistent embedding dimensions." }, { status: 502 });
    }
    const document = {
      id: randomUUID(), title, sourceType: "text", pageCount: null, createdAt: new Date().toISOString(), characters: content.length,
      contentHash: createHash("sha256").update(content).digest("hex"),
      embedModel: EMBED_MODEL,
      chunks: chunks.map((chunk, i) => ({ ...chunk, embedding: vectors[i] })),
    };
    const result = await addDocument(document);
    return Response.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    return Response.json({
      error: error instanceof OllamaError ? error.message : "Unable to save the document.",
    }, { status: error instanceof OllamaError ? 502 : 500 });
  }
}

export async function DELETE(request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return Response.json({ error: "Invalid document ID." }, { status: 400 });
  try {
    const removed = await removeDocument(id);
    return Response.json({ removed }, { status: removed ? 200 : 404 });
  } catch {
    return Response.json({ error: "Unable to remove the document." }, { status: 500 });
  }
}
