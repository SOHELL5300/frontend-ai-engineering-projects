import test from "node:test";
import assert from "node:assert/strict";
import { storageMode } from "../lib/repository.mjs";
import { vectorLiteral, StorageError } from "../lib/postgres.mjs";

test("storage mode defaults to file and validates options", () => {
  const previous = process.env.RAG_STORAGE;
  try {
    delete process.env.RAG_STORAGE;
    assert.equal(storageMode(), "file");
    process.env.RAG_STORAGE = "postgres";
    assert.equal(storageMode(), "postgres");
    process.env.RAG_STORAGE = "invalid";
    assert.throws(() => storageMode(), (error) => error instanceof StorageError && error.code === "DB_CONFIGURATION");
  } finally {
    if (previous === undefined) delete process.env.RAG_STORAGE;
    else process.env.RAG_STORAGE = previous;
  }
});

test("pgvector literal serializes only valid numbers", () => {
  assert.equal(vectorLiteral([0.5,-1,0]), "[0.5,-1,0]");
  assert.throws(() => vectorLiteral([]), { code: "VECTOR_INVALID" });
  assert.throws(() => vectorLiteral([NaN]), { code: "VECTOR_INVALID" });
  assert.throws(() => vectorLiteral([Infinity]), { code: "VECTOR_INVALID" });
  assert.throws(() => vectorLiteral(Array(2001).fill(1)), { code: "VECTOR_INVALID" });
});
