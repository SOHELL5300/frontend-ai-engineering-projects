import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { listPostgresDocuments, countPostgresDocuments, savePostgresDocument, deletePostgresDocument, searchPostgresChunks } from "../lib/postgres.mjs";

test("pgvector integration: CRUD, deduplication, cosine search and page citations", {
  skip: process.env.RAG_PG_INTEGRATION !== "true" || !process.env.DATABASE_URL,
}, async () => {
  const unique = randomUUID();
  const model = "test-model-" + unique;
  const doc = {
    id: randomUUID(), title: "Integration PDF", sourceType: "pdf", pageCount: 2,
    characters: 60, contentHash: createHash("sha256").update(unique).digest("hex"),
    embedModel: model, createdAt: new Date().toISOString(),
    chunks: [
      { index: 0, pageNumber: 1, text: "Page one background information.", embedding: [0,1,0] },
      { index: 1, pageNumber: 2, text: "Acceptance code CITATION-PAGE-TWO-731.", embedding: [1,0,0] },
    ],
  };
  try {
    assert.equal((await savePostgresDocument(doc)).created, true);
    const duplicate = await savePostgresDocument({...doc, id: randomUUID()});
    assert.equal(duplicate.created, false);
    assert.equal(duplicate.document.id, doc.id);
    assert.equal((await countPostgresDocuments(model)).matching, 1);
    assert.ok((await listPostgresDocuments()).some(row => row.id === doc.id && row.chunkCount === 2));
    const hits = await searchPostgresChunks([1,0,0], model, {topK: 2, minScore: 0.2});
    assert.equal(hits.length, 1);
    assert.equal(hits[0].pageNumber, 2);
    assert.equal(hits[0].chunkIndex, 1);
    assert.ok(Math.abs(hits[0].score-1)<0.00001);
    assert.deepEqual(await searchPostgresChunks([1,0], model), []);
  } finally {
    assert.equal(await deletePostgresDocument(doc.id), true);
    assert.equal(await deletePostgresDocument(doc.id), false);
  }
});
