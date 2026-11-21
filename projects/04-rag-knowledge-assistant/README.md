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
    Embed question, cosine similarity, top 4
             |
    Ollama /api/chat with retrieved passages
             |
    Answer + cited source excerpts

| Component | Implementation |
| --- | --- |
| UI | React + Next.js App Router |
| API | Next.js Node runtime route handlers |
| Chat model | Ollama llama3.2 |
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
