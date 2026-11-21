import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

// Local single-process demonstration store, not suitable for serverless or concurrent deployments.
const STORE_PATH = path.join(process.cwd(), ".data", "rag-index.json");
let pending = Promise.resolve();

export async function readIndex() {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const data = JSON.parse(raw);
    if (data.version !== 1 || !Array.isArray(data.documents)) throw new Error("Unexpected index format.");
    return data;
  } catch (error) {
    if (error.code === "ENOENT") return { version: 1, documents: [] };
    throw error;
  }
}

// Serialize writes inside this Node process and replace the file atomically.
function updateIndex(change) {
  const operation = pending.then(async () => {
    const index = await readIndex();
    const result = change(index);
    await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
    const temporary = STORE_PATH + "." + randomUUID() + ".tmp";
    try {
      await fs.writeFile(temporary, JSON.stringify(index), { mode: 0o600 });
      await fs.rename(temporary, STORE_PATH);
    } finally {
      await fs.rm(temporary, { force: true }).catch(() => {});
    }
    return result;
  });
  pending = operation.then(() => {}, () => {});
  return operation;
}

export function publicDocument(document) {
  return {
    id: document.id, title: document.title, createdAt: document.createdAt,
    chunkCount: document.chunks.length, characters: document.characters,
    embedModel: document.embedModel,
  };
}

export async function addDocument(document) {
  return updateIndex((index) => {
    const duplicate = index.documents.find((item) =>
      item.contentHash === document.contentHash && item.embedModel === document.embedModel);
    if (duplicate) return { document: publicDocument(duplicate), created: false };
    index.documents.unshift(document);
    return { document: publicDocument(document), created: true };
  });
}

export async function removeDocument(id) {
  return updateIndex((index) => {
    const initial = index.documents.length;
    index.documents = index.documents.filter((document) => document.id !== id);
    return index.documents.length < initial;
  });
}
