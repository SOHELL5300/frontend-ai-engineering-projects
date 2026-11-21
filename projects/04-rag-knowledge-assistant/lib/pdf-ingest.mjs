import { chunkText, normalizeText } from "./chunk.mjs";
import { PdfIngestionError } from "./pdf.mjs";

// Chunk each page individually to preserve accurate page references.
export function preparePdfChunks(pages) {
  if (!Array.isArray(pages) || !pages.length) {
    throw new PdfIngestionError("No readable text was found in this PDF.", 422, "PDF_NO_TEXT");
  }
  let characters = 0;
  const chunks = [];
  for (const page of pages) {
    if (!Number.isInteger(page.pageNumber) || page.pageNumber < 1) {
      throw new PdfIngestionError("Invalid PDF page metadata.");
    }
    const text = normalizeText(page.text);
    characters += text.length;
    if (characters > 50000) {
      throw new PdfIngestionError("Extracted PDF text exceeds 50,000 characters. Split the PDF.", 413, "PDF_TEXT_SIZE");
    }
    for (const item of chunkText(text)) {
      chunks.push({ index: chunks.length, text: item.text, pageNumber: page.pageNumber });
      if (chunks.length > 100) {
        throw new PdfIngestionError("PDF creates too many chunks (maximum 100).", 413, "PDF_CHUNKS");
      }
    }
  }
  if (characters < 40 || !chunks.length) {
    throw new PdfIngestionError("PDF contains too little searchable text (minimum 40 characters).", 422, "PDF_NO_TEXT");
  }
  return { characters, chunks };
}
