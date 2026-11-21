import { Pool } from "pg";

let pool;

export class StorageError extends Error {
  constructor(message, status = 503, code = "STORAGE_ERROR") {
    super(message);
    this.name = "StorageError";
    this.status = status;
    this.code = code;
  }
}

export function vectorLiteral(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > 2000 ||
      value.some(v => typeof v !== "number" || !Number.isFinite(v))) {
    throw new StorageError("Expected 1–2000 finite embedding values.", 422, "VECTOR_INVALID");
  }
  return "[" + value.join(",") + "]";
}

function connectionPool() {
  if (!process.env.DATABASE_URL) {
    throw new StorageError("DATABASE_URL is missing. Set it or use RAG_STORAGE=file.", 503, "DB_CONFIGURATION");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL, max: 5,
      connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

function publicRow(row) {
  return {
    id: row.id, title: row.title, sourceType: row.source_type,
    pageCount: row.page_count, characters: row.characters,
    embedModel: row.embed_model, chunkCount: Number(row.chunk_count),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

function safeError(error) {
  if (error instanceof StorageError) return error;
  if (error?.code === "42P01" || error?.code === "42704") {
    return new StorageError("Database tables or pgvector are missing. Run npm run db:migrate.", 503, "DB_MIGRATION_REQUIRED");
  }
  console.error("[RAG] Database failure:", error?.code || error?.name || "unknown");
  return new StorageError("Unable to access the configured PostgreSQL database.", 503, "DB_UNAVAILABLE");
}

export async function listPostgresDocuments() {
  const sql = "SELECT d.*, COUNT(c.id)::int AS chunk_count FROM rag_documents d LEFT JOIN rag_chunks c ON c.document_id=d.id GROUP BY d.id ORDER BY d.created_at DESC";
  try {
    const result = await connectionPool().query(sql);
    return result.rows.map(publicRow);
  } catch (error) { throw safeError(error); }
}

export async function countPostgresDocuments(model) {
  try {
    const result = await connectionPool().query("SELECT COUNT(*)::int AS total, COUNT(*) FILTER(WHERE embed_model=$1)::int AS matching FROM rag_documents", [model]);
    return result.rows[0];
  } catch (error) { throw safeError(error); }
}

export async function savePostgresDocument(doc) {
  let client;
  try {
    client = await connectionPool().connect();
    await client.query("BEGIN");
    const sql = "INSERT INTO rag_documents(id,title,source_type,page_count,characters,content_hash,embed_model,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(content_hash,embed_model) DO NOTHING RETURNING id";
    const inserted = await client.query(sql, [doc.id,doc.title,doc.sourceType||"text",doc.pageCount??null,doc.characters,doc.contentHash,doc.embedModel,doc.createdAt]);
    if (!inserted.rowCount) {
      const dup = await client.query("SELECT d.*,COUNT(c.id)::int AS chunk_count FROM rag_documents d LEFT JOIN rag_chunks c ON c.document_id=d.id WHERE d.content_hash=$1 AND d.embed_model=$2 GROUP BY d.id", [doc.contentHash, doc.embedModel]);
      await client.query("COMMIT");
      return { document: publicRow(dup.rows[0]), created: false };
    }
    const dimensions = doc.chunks[0]?.embedding?.length;
    if (!dimensions || doc.chunks.some(c => c.embedding.length !== dimensions)) {
      throw new StorageError("Inconsistent embedding dimensions.", 422, "VECTOR_DIMENSIONS");
    }
    for (const chunk of doc.chunks) {
      await client.query("INSERT INTO rag_chunks(document_id,chunk_index,page_number,content,embedding,embedding_dims) VALUES($1,$2,$3,$4,$5::vector,$6)", [
        doc.id,chunk.index,chunk.pageNumber??null,chunk.text,vectorLiteral(chunk.embedding),dimensions,
      ]);
    }
    const selected = await client.query("SELECT d.*,COUNT(c.id)::int AS chunk_count FROM rag_documents d JOIN rag_chunks c ON c.document_id=d.id WHERE d.id=$1 GROUP BY d.id", [doc.id]);
    await client.query("COMMIT");
    return { document: publicRow(selected.rows[0]), created: true };
  } catch (error) {
    if (client) await client.query("ROLLBACK").catch(() => {});
    throw safeError(error);
  } finally {
    client?.release();
  }
}

export async function deletePostgresDocument(id) {
  try {
    const result = await connectionPool().query("DELETE FROM rag_documents WHERE id=$1", [id]);
    return result.rowCount > 0;
  } catch (error) { throw safeError(error); }
}

export async function searchPostgresChunks(vector, model, options = {}) {
  const topK = options.topK ?? 3, minScore = options.minScore ?? 0.16;
  if (!Number.isInteger(topK) || topK < 1 || topK > 10 || !Number.isFinite(minScore) || minScore < -1 || minScore > 1) {
    throw new StorageError("Invalid retrieval options.", 400, "SEARCH_OPTIONS");
  }
  const queryVector = vectorLiteral(vector);
  const sql = [
    "SELECT d.id AS document_id,d.title,d.source_type,c.chunk_index,c.page_number,c.content,",
    "1-(c.embedding <=> $1::vector) AS similarity",
    "FROM rag_chunks c JOIN rag_documents d ON d.id=c.document_id",
    "WHERE d.embed_model=$2 AND c.embedding_dims=$3",
    "AND 1-(c.embedding <=> $1::vector)>=$4",
    "ORDER BY c.embedding <=> $1::vector ASC LIMIT $5",
  ].join(" ");
  try {
    const result = await connectionPool().query(sql,[queryVector,model,vector.length,minScore,topK]);
    return result.rows.map(row => ({
      documentId: row.document_id, title: row.title, sourceType: row.source_type,
      chunkIndex: row.chunk_index, pageNumber: row.page_number,
      text: row.content, score: Number(row.similarity),
    }));
  } catch (error) { throw safeError(error); }
}
