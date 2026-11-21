CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS rag_documents (
  id UUID PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  source_type VARCHAR(16) NOT NULL CHECK(source_type IN ('text','pdf')),
  page_count INTEGER,
  characters INTEGER NOT NULL,
  content_hash CHAR(64) NOT NULL,
  embed_model VARCHAR(128) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(content_hash, embed_model)
);

CREATE TABLE IF NOT EXISTS rag_chunks (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL CHECK(chunk_index >= 0),
  page_number INTEGER,
  content TEXT NOT NULL,
  embedding VECTOR NOT NULL,
  embedding_dims INTEGER NOT NULL CHECK (embedding_dims BETWEEN 1 AND 2000),
  UNIQUE(document_id,chunk_index)
);

CREATE INDEX IF NOT EXISTS rag_chunks_document_idx ON rag_chunks(document_id);
CREATE INDEX IF NOT EXISTS rag_documents_model_idx ON rag_documents(embed_model);

-- Exact cosine search is used first; HNSW/IVFFlat indexes require choosing
-- fixed vector dimensions and a model-aware index strategy.
