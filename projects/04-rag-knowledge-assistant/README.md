# 04 — RAG Knowledge Assistant

A **real Retrieval-Augmented Generation app** using Next.js, React, Ollama embeddings, cosine-similarity search, and evidence-backed AI answers. Choose local JSON or PostgreSQL + pgvector storage.

Part of [Frontend AI Engineering Projects](https://github.com/SOHELL5300/frontend-ai-engineering-projects) and [Frontend AI Engineer Kit](https://frontendaiengineer.com).

## Learning objectives

- Understand ingestion, chunking, embedding, vector similarity, retrieval and grounded generation
- Integrate a React application with server-side AI route handlers
- Inspect actual cited source chunks and relevance scores
- Practice loading, empty, error, and model-connection UI states

## Setup (local)

Requirements: Node.js 20.9+ (22 recommended), Ollama installed locally, enough memory to run the models.

1. From the repository root: cd projects/04-rag-knowledge-assistant
2. Run: npm install
3. Copy .env.example to .env.local (PowerShell: Copy-Item .env.example .env.local)
4. Run: ollama pull llama3.2
5. Run: ollama pull embeddinggemma
6. Start Ollama if needed: ollama serve
7. Run: npm run dev
8. Open http://localhost:3000

No cloud API key is required. If you change the embedding model, **re-index documents for the new model** to avoid incompatible embedding spaces. Existing model-specific vectors remain in their original index.

## Demonstration

1. Select Add document. The interface includes a sample guide; you may also paste text or import a TXT/Markdown file.
2. Click Index document. Ollama creates real vectors; they are persisted in .data/rag-index.json by default, or PostgreSQL with RAG_STORAGE=postgres.
3. Ask a question, for example: What happens during indexing?
4. Expand Retrieved evidence to examine which chunks were used.
5. Try a question the documents cannot answer. Compare model output against its evidence.
6. Run npm test to exercise chunking and retrieval logic.


## Low-resource setup (8 GB RAM)

If the default Llama 3.2 model takes minutes to answer a short prompt on your computer, prefer a smaller chat model rather than only increasing the HTTP timeout:

~~~powershell
ollama pull qwen2.5:1.5b
ollama run qwen2.5:1.5b "Explain RAG in one sentence."
~~~

Keep the existing `OLLAMA_EMBED_MODEL=embeddinggemma`, but change your **local** `.env.local` to:

~~~dotenv
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_CHAT_MODEL=qwen2.5:1.5b
OLLAMA_EMBED_MODEL=embeddinggemma
OLLAMA_CHAT_TIMEOUT_MS=240000
OLLAMA_EMBED_KEEP_ALIVE=0
~~~

Restart the dev server after changing `.env.local`. Changing only the chat model does **not** require re-indexing your documents; changing the embedding model **does**.

**Observed developer test, not a guarantee:** an 8 GB RAM Windows laptop returned an in-app answer in about 10–20 seconds with `qwen2.5:1.5b`, while `llama3.2` failed to complete a short direct prompt after more than five minutes. Performance varies with memory pressure, CPU/GPU capabilities, retrieval size, and hardware.

**Accuracy warning:** the smaller model previously answered "RAG" as "Rich Answers Generation" when prompted without context (the correct expansion is "Retrieval-Augmented Generation"). This is why students must verify actual generated answers against retrieved sources. A quick response is not proof of groundedness.

### RAG acceptance checklist

- [ ] Index a TXT/Markdown document and see nonzero chunks in the UI
- [ ] Ask a fact contained in the document and inspect the returned source passage
- [ ] Check that each factual claim is supported by the cited passage, not just accompanied by a citation marker
- [ ] Ask a fact *absent* from the document and check that the model avoids invention
- [ ] Run `npm test` and `npm run build`; do not treat successful API responses as substitutes for tests
- [ ] Never publish private documents or `.data/rag-index.json`

## V2 milestone: PDF ingestion (PR #2)

PDF upload is available under **Add document → PDF**. The browser sends a multipart form upload to `POST /api/documents/pdf`; the server validates filename, MIME type, PDF header, byte size, and page count, then extracts selectable text by actual page number using `pdf-parse` v2. Chunks are generated **within page boundaries** so citations show the correct original PDF page.

The original PDF file is **not saved**. Extracted text, page numbers, and embedding vectors remain in the ignored local JSON index. Duplicate PDFs with identical bytes and the same embedding model are reused. Existing indexed TXT/Markdown documents and V1 data remain readable.

### Upload limits and expected errors

- PDF format only, maximum **4 MB**, **30 pages**, **50,000 extracted characters** and **100 chunks**
- Password-encrypted PDFs are rejected; upload a password-free copy
- Scanned/image-only PDFs without selectable text are rejected with an explicit OCR-not-supported error
- No outbound PDF upload to a cloud provider; parsing and Ollama embedding run on your local Node server
- On an 8 GB RAM machine, index small PDFs (1–5 pages) initially to limit embedding time
- Untrusted PDFs should be treated as potentially hostile inputs. This local demo is not a hardened public PDF-processing service

### Manual acceptance tests

1. Run `npm install`, `npm test` and `npm run build` from this project directory; Node 22.3+ recommended.
2. In **Add document**, switch to PDF and upload a small **text-based** PDF. Verify it appears in Your documents with a page count.
3. Ask about a fact on page 2; inspect the retrieved source row showing **Page 2** and verify the underlying excerpt.
4. Verify a previously indexed TXT/Markdown document still works.
5. Attempt to upload an image-only scan and a non-PDF renamed to `.pdf`. Expect actionable rejection.
6. Do not merge the PR before the PDF upload, existing TXT workflow and real Ollama answer flow pass locally.

See the `pdf-parse` library usage and Next.js worker setup in its official project documentation.

## V3 milestone: PostgreSQL + pgvector

This PR adds an **optional database-backed vector index**. The RAG application works in both modes:

- `RAG_STORAGE=file` (default): local JSON index, zero database setup, retained for students
- `RAG_STORAGE=postgres`: PostgreSQL documents and pgvector embeddings with exact SQL cosine search

Existing PDF/TXT ingestion, Ollama models, and page-aware citations use the same React workflow. Database records are isolated from file storage: switching the mode will show a different set of documents. There is **no automatic migration of existing JSON documents**.

### PostgreSQL setup (local)

**Students on Windows:** PostgreSQL with pgvector must already be available before running the migration. An existing managed PostgreSQL instance with pgvector enabled is also suitable. On a laptop with 8 GB RAM, running Ollama and a local database simultaneously may increase memory pressure.

Use a **dedicated lab database** instead of your website's production database. Keep its connection string in `.env.local`, never in Git.

Install PostgreSQL with the **pgvector** extension available to the server. Create an empty database and a user with permission to create tables and enable the extension (or have an administrator enable it first).

Update `.env.local` (do not commit passwords):

~~~dotenv
RAG_STORAGE=postgres
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/rag_lab
OLLAMA_CHAT_MODEL=qwen2.5:1.5b
OLLAMA_EMBED_MODEL=embeddinggemma
~~~

Run:

~~~powershell
npm install
npm run db:migrate
npm test
npm run build
npm run dev
~~~

The migration is repeatable and creates `rag_documents`, `rag_chunks`, the `vector` extension, foreign keys and metadata indexes. The app does **not** run migrations during requests.

### How retrieval works

`POST /api/ask` first embeds the question using Ollama. In PostgreSQL mode, it filters by the embedding-model name and vector dimension, then ranks source chunks using `<=>` (pgvector cosine distance). A parameterized query returns the top three matching chunks, with page metadata and similarity scores. In file mode, the previous in-memory cosine ranking remains unchanged.

All document writes occur in transactions; duplicate documents are detected through a unique index on content hash and embedding model. Deleting a document cascades to its chunks.

### Important limitations

- This is **exact search**, not HNSW/IVFFlat approximate nearest-neighbor indexing. The vector column does not enforce a fixed dimension, allowing models with different vector sizes. Dedicated indexes and per-model dimensions are later performance upgrades.
- There is no multi-tenant access control or public deployment authentication. Do **not** expose the API publicly without securing it.
- A pgvector-compatible PostgreSQL environment and credentials are required for database mode.
- This milestone has unit tests and CI. A **real Postgres/pgvector integration test** must still be run before claiming a verified database workflow.
- For localhost, start with small PDFs. Real embedding speed depends on hardware.
- Do not commit database URLs, passwords, `.env.local`, index files or sensitive document contents.

### Suggested acceptance tests

1. In default file mode, check your existing indexed PDF and its page-2 citation are still present.
2. Switch to PostgreSQL mode, run the migration and restart the server.
3. Upload a small TXT/PDF and verify document listing.
4. Ask for its page-specific code and confirm evidence references the correct PDF page.
5. Delete the document and verify its chunks disappear.
6. Re-upload the same file and confirm duplicate behavior.
7. Switch back to file mode and verify your original local documents reappear.


## Architecture

    Text / TXT / Markdown / PDF (page-aware extraction)
             |
    POST /api/documents
             |
    Normalize, chunk, embed via Ollama /api/embed
             |
    Local JSON vector index (.data, gitignored)
             |
    POST /api/ask
             |
    Embed question, cosine similarity, top 3
             |
    Ollama /api/chat with retrieved passages
             |
    Answer + cited source excerpts

| Component | Implementation |
| --- | --- |
| UI | React + Next.js App Router |
| API | Next.js Node runtime route handlers |
| Chat model | Ollama llama3.2 (default); qwen2.5:1.5b recommended for limited RAM |
| Embeddings | Ollama embeddinggemma |
| Search | Exact cosine similarity (top K) |
| Storage | Local JSON file (default), or PostgreSQL + pgvector |
| Tests | Node built-in test runner |

## APIs

- GET /api/health: Ollama status and installed-model checks
- GET /api/documents: document metadata
- POST /api/documents: JSON with title and text (40 to 50,000 characters)
- POST /api/documents/pdf: multipart/form-data file for PDF indexing (4 MB, 30 pages, 50k extracted characters)
- DELETE /api/documents?id=UUID: remove indexed document
- POST /api/ask: JSON with question; returns answer, retrieval status and sources

## Important limitations

This is a **single-user localhost teaching demo**, NOT a public production service.

- .data contains source text and embeddings and must remain private. Never commit private documents, secrets or API keys.
- There is no authentication, tenant isolation, rate limiting, OCR or malware scanning. The PDF parser is for small, trusted local files only.
- File storage serializes writes only within one Node process; it does not handle multiple replicas or serverless environments.
- Exact vector comparison is suitable for small demonstrations, not massive indexes.
- Similarity percentage is NOT calibrated model confidence. A retrieved source does not guarantee a correct answer.
- Retrieved text is treated as untrusted, but prompt injection and model hallucinations remain possible.
- The answer endpoint is not yet streaming; loading/error UI states are implemented.
- The current version supports TXT, Markdown, and selectable-text PDFs. Image-only scans require OCR (not supported). pgvector is a future upgrade.

## Future extensions

Postgres/pgvector, OCR, hybrid search, reranking, streaming with AbortController, RAG evaluation, observability, authentication and tenancy.

## Validation

Run npm test for pure JavaScript tests. Run npm run build after npm install. Real end-to-end checks require Ollama running and both models available. This project has not been represented as production-deployed.


## Fixing chat timeouts on Windows

If indexing succeeds (`POST /api/documents 201`) but asking a question fails after two minutes, the old code had a 120-second timeout for every Ollama operation. The revised Ollama provider now distinguishes **chat model timeouts** (HTTP 504) from an unreachable Ollama server (HTTP 502), logs request timings, and limits generated output size.

Before retrying, open a separate PowerShell terminal:

~~~powershell
ollama list
ollama ps
Measure-Command { ollama run llama3.2 "Define RAG in one sentence." }
~~~

If direct generation is also slow, inspect RAM/VRAM and the processor column in `ollama ps`. On machines with limited memory, Ollama may run on CPU or repeatedly load models. The embedding model is now unloaded between requests by default so the chat model has more room.

The default chat timeout is now **240 seconds**. You can increase it locally by adding `OLLAMA_CHAT_TIMEOUT_MS=360000` to `.env.local` and restarting Next.js. This merely allows more time; it does not accelerate generation. Chat requests limit the response to 256 tokens and context to 3072 tokens to lower inference work.

The UI still waits for a complete response. Streaming updates and cancellation are planned for a later version. These long server-side timeouts are suitable for localhost, not necessarily hosted serverless deployments.

**Separate warning:** React hydration mismatch involving `cz-shortcut-listen="true"` is typically caused by a browser extension injecting an HTML attribute. Try an extension-free/private browser window; it does not cause the Ollama API timeout.

## Troubleshooting slow RAG chat on 8 GB laptops

A short, already-loaded Ollama chat test is not equivalent to the full RAG path: the app embeds the question, retrieves up to three source chunks, and then asks the chat model to process those chunks. If the browser reports a chat timeout, first confirm that a simple `/api/chat` request succeeds.

For short answers, you can **optionally** add these lines to your private `.env.local` and restart Next.js:

~~~dotenv
OLLAMA_CHAT_NUM_PREDICT=128
OLLAMA_CHAT_NUM_CTX=2048
~~~

These settings bound the output length and context window, but they are not a guaranteed timeout fix. Keep the higher defaults for documents requiring longer context. Do not raise the 240-second timeout just to mask a slow request.

The Next.js terminal now logs **chat request metadata** (number of sources, context length and configured limits) and **Ollama timing metrics** (wall time, model load time, prompt evaluation time, generation time and token counts). The app deliberately does **not** log uploaded document contents, prompts, database URLs or credentials.

If the problem only occurs in the full app, compare the terminal's chat logs with an Ollama request containing the same approximate context length. Later streaming support will provide partial responses and cancellation instead of waiting for the full reply.

## V4 milestone: streamed answers, Stop and Retry

This milestone introduces **POST /api/ask/stream**, a streaming NDJSON endpoint. It uses the same embeddings, PostgreSQL/file retrieval, Ollama model and citation prompt as the existing non-streaming API. The old **POST /api/ask** endpoint remains available for backwards compatibility.

Request: JSON `{"question":"..."}` (3–500 characters). Response: `application/x-ndjson` lines:

~~~json
{"type":"sources","sources":[{"citation":1,"title":"Sample","pageNumber":2,"excerpt":"...", "similarity":0.5}]}
{"type":"token","text":"The acceptance"}
{"type":"token","text":" code is ... [1]"}
{"type":"done","grounded":true}
~~~

If a backend failure happens after streaming begins, the server sends `{"type":"error","message":"...","code":"..."}` instead. A client abort ends the upstream Ollama request and retains already-received text in the UI. **Stop** cancels the active request; **Retry** resends the last submitted question. Empty retrievals return the same not-found response without invoking the chat model.

The server processes Ollama's NDJSON incrementally and forwards token text to the browser. The UI differentiates retrieving, generating, stopped, completed and interrupted states. Retrieved evidence and original PDF page numbers stay visible.

### Verification on an 8 GB Windows laptop

1. Keep your existing `.env.local` values for `qwen2.5:1.5b`, `embeddinggemma`, and `RAG_STORAGE=postgres`.
2. Start PostgreSQL in Docker if needed, then run `npm install`, `npm test`, `npm run build`, and `npm run dev`.
3. Ask for the page-2 acceptance code. Confirm the answer **appears incrementally**, and source [1] cites **Page 2**.
4. Ask a longer question and select **Stop generation**. The answer should stop updating, retain any partial response, and show **Stopped**.
5. Select **Retry question**. Verify a fresh answer starts, and the old answer is replaced rather than appended.
6. Ask about a fact not contained in the PDF and confirm the model avoids inventing information.
7. Check the Next.js console for Ollama streamed timing metrics; never paste sensitive document content or database credentials into logs.

### Boundaries

- Streaming improves the perception of responsiveness but **does not guarantee faster model inference** or higher quality.
- On Stop, ongoing database/embedding work may already have been started and may complete before the cancellation is observed. The upstream Ollama streaming request is abortable.
- This is still a single-user educational prototype, not a secured public multi-tenant API.
