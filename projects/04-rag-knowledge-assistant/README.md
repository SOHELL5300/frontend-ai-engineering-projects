# 04 — RAG Knowledge Assistant

A **real local-first Retrieval-Augmented Generation app** using Next.js, React, Ollama embeddings, cosine-similarity search, and evidence-backed AI answers.

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

No cloud API key is required. If you change the embedding model, **delete and re-index old documents** to avoid incompatible embedding spaces.

## Demonstration

1. Select Add document. The interface includes a sample guide; you may also paste text or import a TXT/Markdown file.
2. Click Index document. Ollama creates real vectors; they are persisted in .data/rag-index.json.
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

Keep the existing \`OLLAMA_EMBED_MODEL=embeddinggemma\`, but change your **local** \`.env.local\` to:

~~~dotenv
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_CHAT_MODEL=qwen2.5:1.5b
OLLAMA_EMBED_MODEL=embeddinggemma
OLLAMA_CHAT_TIMEOUT_MS=240000
OLLAMA_EMBED_KEEP_ALIVE=0
~~~

Restart the dev server after changing \`.env.local\`. Changing only the chat model does **not** require re-indexing your documents; changing the embedding model **does**.

**Observed developer test, not a guarantee:** an 8 GB RAM Windows laptop returned an in-app answer in about 10–20 seconds with \`qwen2.5:1.5b\`, while \`llama3.2\` failed to complete a short direct prompt after more than five minutes. Performance varies with memory pressure, CPU/GPU capabilities, retrieval size, and hardware.

**Accuracy warning:** the smaller model previously answered "RAG" as "Rich Answers Generation" when prompted without context (the correct expansion is "Retrieval-Augmented Generation"). This is why students must verify actual generated answers against retrieved sources. A quick response is not proof of groundedness.

### RAG acceptance checklist

- [ ] Index a TXT/Markdown document and see nonzero chunks in the UI
- [ ] Ask a fact contained in the document and inspect the returned source passage
- [ ] Check that each factual claim is supported by the cited passage, not just accompanied by a citation marker
- [ ] Ask a fact *absent* from the document and check that the model avoids invention
- [ ] Run \`npm test\` and \`npm run build\`; do not treat successful API responses as substitutes for tests
- [ ] Never publish private documents or \`.data/rag-index.json\`

## Architecture

    Text / TXT / Markdown
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
| Storage | Local JSON file with atomic rename |
| Tests | Node built-in test runner |

## APIs

- GET /api/health: Ollama status and installed-model checks
- GET /api/documents: document metadata
- POST /api/documents: JSON with title and text (40 to 50,000 characters)
- DELETE /api/documents?id=UUID: remove indexed document
- POST /api/ask: JSON with question; returns answer, retrieval status and sources

## Important limitations

This is a **single-user localhost teaching demo**, NOT a public production service.

- .data contains source text and embeddings and must remain private. Never commit private documents, secrets or API keys.
- There is no authentication, tenant isolation, rate limiting, PDF parsing or malware scanning.
- File storage serializes writes only within one Node process; it does not handle multiple replicas or serverless environments.
- Exact vector comparison is suitable for small demonstrations, not massive indexes.
- Similarity percentage is NOT calibrated model confidence. A retrieved source does not guarantee a correct answer.
- Retrieved text is treated as untrusted, but prompt injection and model hallucinations remain possible.
- The answer endpoint is not yet streaming; loading/error UI states are implemented.
- The current version supports UTF-8 TXT and Markdown only. PDF parsing and pgvector storage are next upgrades.

## Future extensions

PDF ingestion, Postgres/pgvector, hybrid search, reranking, streaming with AbortController, RAG evaluation, observability, authentication and tenancy.

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
