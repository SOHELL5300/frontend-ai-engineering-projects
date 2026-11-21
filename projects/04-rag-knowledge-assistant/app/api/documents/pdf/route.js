import { createHash, randomUUID } from "node:crypto";
import { MAX_PDF_BYTES, PdfIngestionError, extractPdfPages, validatePdfFile } from "../../../../lib/pdf.mjs";
import { preparePdfChunks } from "../../../../lib/pdf-ingest.mjs";
import { EMBED_MODEL, embedTexts, OllamaError } from "../../../../lib/ollama.mjs";
import { saveDocument } from "../../../../lib/repository.mjs";
import { StorageError } from "../../../../lib/postgres.mjs";

export const runtime = "nodejs";

export async function POST(request) {
  const announcedLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(announcedLength) && announcedLength > MAX_PDF_BYTES + 1024 * 64) {
    return Response.json({ error: "Upload exceeds the 4 MB PDF limit.", code: "PDF_SIZE" }, { status: 413 });
  }
  try {
    let form;
    try { form = await request.formData(); } catch {
      throw new PdfIngestionError("Unable to read the PDF upload.", 400, "PDF_FORM");
    }
    const file = form.get("file");
    validatePdfFile(file);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const parsed = await extractPdfPages(bytes);
    const prepared = preparePdfChunks(parsed.pages);
    // Use bytes for PDF deduplication. The original uploaded file is not persisted.
    const contentHash = createHash("sha256").update(bytes).digest("hex");
    const vectors = await embedTexts(prepared.chunks.map((chunk) => chunk.text));
    const dimensions = vectors[0]?.length;
    if (!dimensions || vectors.some((vector) => vector.length !== dimensions)) {
      throw new OllamaError("Ollama returned inconsistent PDF embedding dimensions.");
    }
    const title = file.name.replace(/\.pdf$/i, "").trim().slice(0, 120);
    const document = {
      id: randomUUID(), title: title.length >= 2 ? title : "PDF document",
      sourceType: "pdf", pageCount: parsed.pageCount,
      createdAt: new Date().toISOString(), characters: prepared.characters,
      contentHash, embedModel: EMBED_MODEL,
      chunks: prepared.chunks.map((chunk, i) => ({ ...chunk, embedding: vectors[i] })),
    };
    const result = await saveDocument(document);
    return Response.json(result, { status: result.created ? 201 : 200 });
  } catch (error) {
    if (error instanceof PdfIngestionError) {
      return Response.json({ error: error.message, code: error.code }, { status: error.status });
    }
    if (error instanceof OllamaError || error instanceof StorageError) {
      return Response.json({ error: error.message, code: error.code }, { status: error.status });
    }
    console.error("[RAG] Failed to ingest PDF", error);
    return Response.json({ error: "PDF ingestion failed unexpectedly." }, { status: 500 });
  }
}
