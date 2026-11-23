import { EMBED_MODEL, embedTexts, streamAnswerWithContext, OllamaError } from "../../../../lib/ollama.mjs";
import { countDocuments, retrieveChunks } from "../../../../lib/repository.mjs";
import { StorageError } from "../../../../lib/postgres.mjs";
import { jsonLine } from "../../../../lib/stream.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sourceDTO(source, index) {
  return {
    citation: index + 1, title: source.title, documentId: source.documentId,
    chunkIndex: source.chunkIndex, pageNumber: source.pageNumber, sourceType: source.sourceType,
    excerpt: source.text, similarity: Number(source.score.toFixed(3)),
  };
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (question.length < 3 || question.length > 500) {
    return Response.json({ error: "Question must be between 3 and 500 characters." }, { status: 400 });
  }
  const abort = new AbortController();
  const onAbort = () => abort.abort(request.signal.reason);
  if (request.signal.aborted) abort.abort(request.signal.reason);
  else request.signal.addEventListener("abort", onAbort, { once: true });
  const encoder = new TextEncoder();
  let closed = false;
  let iterator;
  const stream = new ReadableStream({
    start(controller) {
      const send = (event) => {
        if (!closed && !abort.signal.aborted) controller.enqueue(encoder.encode(jsonLine(event)));
      };
      const run = async () => {
        try {
          const count = await countDocuments(EMBED_MODEL);
          if (abort.signal.aborted) return;
          if (!count.total) throw new StorageError("Add a document to the knowledge base first.", 409, "NO_DOCUMENTS");
          if (!count.matching) throw new StorageError("The embedding model changed. Re-ingest your documents using the current embedding model.", 409, "EMBED_MODEL_MISMATCH");
          const [embedding] = await embedTexts([question]);
          if (abort.signal.aborted) return;
          const sources = await retrieveChunks(embedding, EMBED_MODEL, { topK: 3, minScore: 0.16 });
          if (abort.signal.aborted) return;
          send({ type: "sources", sources: sources.map(sourceDTO) });
          if (!sources.length) {
            send({ type: "token", text: "I could not find sufficiently relevant information in your uploaded documents." });
            send({ type: "done", grounded: false });
            return;
          }
          iterator = streamAnswerWithContext(question, sources, { signal: abort.signal });
          for await (const event of iterator) {
            if (abort.signal.aborted) break;
            if (event.type === "token") send(event);
            if (event.type === "done") send({ type: "done", grounded: true });
          }
        } catch (error) {
          if (!abort.signal.aborted) {
            console.error("[RAG] Stream failed:", error?.code || error?.name || "unknown");
            send({
              type: "error",
              code: error instanceof OllamaError || error instanceof StorageError ? error.code : "STREAM_ERROR",
              message: error instanceof OllamaError || error instanceof StorageError ? error.message : "Unable to stream the answer.",
            });
          }
        } finally {
          request.signal.removeEventListener("abort", onAbort);
          if (!closed) { closed = true; controller.close(); }
        }
      };
      void run();
    },
    cancel() {
      closed = true;
      abort.abort(new Error("Client stopped generation"));
      void iterator?.return?.().catch(() => {});
      request.signal.removeEventListener("abort", onAbort);
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
