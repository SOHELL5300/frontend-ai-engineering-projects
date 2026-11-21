// PDF extraction runs only on the Node server. No original PDF is written to disk.
import { normalizeText } from "./chunk.mjs";

export const MAX_PDF_BYTES = 4 * 1024 * 1024;
export const MAX_PDF_PAGES = 30;

export class PdfIngestionError extends Error {
  constructor(message, status = 422, code = "PDF_INVALID") {
    super(message);
    this.name = "PdfIngestionError";
    this.status = status;
    this.code = code;
  }
}

export function validatePdfFile(file) {
  if (!file || typeof file.arrayBuffer !== "function" || typeof file.name !== "string") {
    throw new PdfIngestionError("Choose a PDF document to upload.", 400, "PDF_REQUIRED");
  }
  if (!/\.pdf$/i.test(file.name) || (file.type && !["application/pdf", "application/octet-stream"].includes(file.type))) {
    throw new PdfIngestionError("Only PDF files are supported by this upload.", 415, "PDF_TYPE");
  }
  if (!Number.isSafeInteger(file.size) || file.size < 8 || file.size > MAX_PDF_BYTES) {
    throw new PdfIngestionError("PDF must be larger than 8 bytes and no more than 4 MB.", 413, "PDF_SIZE");
  }
}

export function validatePdfHeader(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < 8 || bytes.length > MAX_PDF_BYTES) {
    throw new PdfIngestionError("PDF must be a valid file no larger than 4 MB.", 413, "PDF_SIZE");
  }
  // MIME type and extension are user-controlled, so verify the file signature too.
  if (String.fromCharCode(...bytes.subarray(0, 5)) !== "%PDF-") {
    throw new PdfIngestionError("The uploaded file does not have a valid PDF header.", 415, "PDF_SIGNATURE");
  }
}

function extractionFailure(error) {
  if (error instanceof PdfIngestionError) return error;
  const name = String(error?.name || "");
  const message = String(error?.message || "");
  if (name.includes("Password") || /password|encrypted/i.test(message)) {
    return new PdfIngestionError("This PDF is password-protected. Remove the password before uploading.", 422, "PDF_PASSWORD");
  }
  return new PdfIngestionError("Could not read this PDF. Try a valid, unencrypted, text-based PDF.", 422, "PDF_PARSE");
}

export async function extractPdfPages(bytes, options = {}) {
  validatePdfHeader(bytes);
  let parser;
  try {
    if (options.parserFactory) {
      parser = await options.parserFactory(bytes);
    } else {
      // Keep PDF.js/Canvas off the client bundle; Next.js externalizes this dependency.
      await import("pdf-parse/worker");
      const { PDFParse } = await import("pdf-parse");
      parser = new PDFParse({ data: bytes });
    }
    const metadata = await parser.getInfo();
    const pageCount = metadata?.total;
    if (!Number.isInteger(pageCount) || pageCount < 1) {
      throw new PdfIngestionError("PDF has no readable pages.", 422, "PDF_EMPTY");
    }
    if (pageCount > MAX_PDF_PAGES) {
      throw new PdfIngestionError("PDF exceeds the 30-page limit. Split it into smaller documents.", 413, "PDF_PAGES");
    }
    const result = await parser.getText();
    if (!Array.isArray(result?.pages)) {
      throw new PdfIngestionError("PDF text extraction did not return page details.", 422, "PDF_PARSE");
    }
    const pages = result.pages
      .filter((page) => Number.isInteger(page.num) && page.num >= 1 && page.num <= pageCount)
      .map((page) => ({
        pageNumber: page.num,
        text: normalizeText(page.text).replace(/\n?--\s*\d+\s+of\s+\d+\s*--\s*$/i, "").trim(),
      }))
      .filter((page) => page.text.length > 0);
    if (!pages.length) {
      throw new PdfIngestionError(
        "No selectable text was found. This may be a scanned/image-only PDF; OCR is not included yet.",
        422, "PDF_NO_TEXT"
      );
    }
    return { pageCount, pages };
  } catch (error) {
    throw extractionFailure(error);
  } finally {
    if (parser) await parser.destroy().catch(() => {});
  }
}
