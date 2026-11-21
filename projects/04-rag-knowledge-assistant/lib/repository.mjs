import { readIndex, addDocument as saveFile, removeDocument as deleteFile, publicDocument } from "./store.mjs";
import { rankChunks } from "./search.mjs";
import {
  listPostgresDocuments, countPostgresDocuments, savePostgresDocument,
  deletePostgresDocument, searchPostgresChunks, StorageError,
} from "./postgres.mjs";

export function storageMode() {
  const value = process.env.RAG_STORAGE || "file";
  if (value !== "file" && value !== "postgres") {
    throw new StorageError("RAG_STORAGE must be file or postgres.", 500, "DB_CONFIGURATION");
  }
  return value;
}

export async function listDocuments() {
  if (storageMode() === "postgres") return listPostgresDocuments();
  const index = await readIndex();
  return index.documents.map(publicDocument);
}

export async function countDocuments(model) {
  if (storageMode() === "postgres") return countPostgresDocuments(model);
  const index = await readIndex();
  return { total: index.documents.length, matching: index.documents.filter(doc => doc.embedModel === model).length };
}

export async function saveDocument(doc) {
  return storageMode() === "postgres" ? savePostgresDocument(doc) : saveFile(doc);
}

export async function deleteDocument(id) {
  return storageMode() === "postgres" ? deletePostgresDocument(id) : deleteFile(id);
}

export async function retrieveChunks(vector, model, options = {}) {
  if (storageMode() === "postgres") return searchPostgresChunks(vector, model, options);
  const index = await readIndex();
  return rankChunks(index.documents.filter(doc => doc.embedModel === model), vector, options);
}
