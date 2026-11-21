import test from "node:test";
import assert from "node:assert/strict";
import { MAX_PDF_BYTES, PdfIngestionError, extractPdfPages, validatePdfFile, validatePdfHeader } from "../lib/pdf.mjs";
import { preparePdfChunks } from "../lib/pdf-ingest.mjs";

const file = (name, type, size) => ({ name, type, size, arrayBuffer: async () => new ArrayBuffer(size) });
const pdfBytes = Uint8Array.from(Buffer.from("%PDF-1.7\nhello world\n"));

test("file name, MIME type and byte budget are validated", () => {
  assert.doesNotThrow(() => validatePdfFile(file("notes.PDF", "application/pdf", 1200)));
  assert.throws(() => validatePdfFile(file("malware.exe", "application/pdf", 1200)), { code: "PDF_TYPE" });
  assert.throws(() => validatePdfFile(file("oversized.pdf", "application/pdf", MAX_PDF_BYTES + 1)), { code: "PDF_SIZE" });
  assert.throws(() => validatePdfFile(null), { code: "PDF_REQUIRED" });
});
test("PDF header is checked rather than trusting content type", () => {
  assert.doesNotThrow(() => validatePdfHeader(pdfBytes));
  assert.throws(() => validatePdfHeader(Uint8Array.from(Buffer.from("not a pdf at all"))), { code: "PDF_SIGNATURE" });
});
test("page-aware text chunks never cross a page boundary", () => {
  const pages = [
    { pageNumber: 2, text: "First document page contains many facts about vector embeddings, search, and context." },
    { pageNumber: 3, text: "Second document page discusses citations and grounded AI generation." },
  ];
  const { characters, chunks } = preparePdfChunks(pages);
  assert.ok(characters > 40);
  assert.deepEqual(chunks.map((chunk) => chunk.pageNumber), [2, 3]);
  assert.equal(chunks[0].index, 0);
  assert.equal(chunks[1].index, 1);
});
test("PDF parser preserves actual page numbers and drops blank pages", async () => {
  let destroyed = false;
  const result = await extractPdfPages(pdfBytes, {
    parserFactory: async () => ({
      getInfo: async () => ({ total: 3 }),
      getText: async () => ({ pages: [
        { num: 1, text: "A first page has useful knowledge.\\n-- 1 of 3 --" },
        { num: 2, text: "    " },
        { num: 3, text: "A third page also has useful knowledge and citations." },
      ] }),
      destroy: async () => { destroyed = true; },
    }),
  });
  assert.equal(result.pageCount, 3);
  assert.deepEqual(result.pages.map((p) => p.pageNumber), [1, 3]);
  assert.equal(destroyed, true);
});
test("rejects image-only PDFs and overlong PDFs", async () => {
  const create = (count, pages) => async () => ({
    getInfo: async () => ({ total: count }),
    getText: async () => ({ pages }),
    destroy: async () => {},
  });
  await assert.rejects(() => extractPdfPages(pdfBytes, { parserFactory: create(1, [{ num: 1, text: "" }]) }), { code: "PDF_NO_TEXT" });
  await assert.rejects(() => extractPdfPages(pdfBytes, { parserFactory: create(31, []) }), { code: "PDF_PAGES" });
});
test("rejects password-protected PDFs with actionable error", async () => {
  await assert.rejects(() => extractPdfPages(pdfBytes, {
    parserFactory: async () => ({
      getInfo: async () => { const e = new Error("password required"); e.name = "PasswordException"; throw e; },
      destroy: async () => {},
    }),
  }), (err) => err instanceof PdfIngestionError && err.code === "PDF_PASSWORD");
});
