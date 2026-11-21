import test from "node:test";
import assert from "node:assert/strict";
import { CHAT_TIMEOUT_MS, answerWithContext, embedTexts, OllamaError } from "../lib/ollama.mjs";

test("chat request uses bounded generation options and returns an answer", async () => {
  const original = globalThis.fetch;
  let payload;
  try {
    globalThis.fetch = async (url, options) => {
      assert.ok(url.endsWith("/api/chat"));
      assert.ok(options.signal);
      payload = JSON.parse(options.body);
      return { ok: true, json: async () => ({ message: { content: "Grounded answer [1]." } }) };
    };
    const answer = await answerWithContext("What is RAG?", [{ title: "Guide", chunkIndex: 0, text: "RAG uses documents." }]);
    assert.equal(answer, "Grounded answer [1].");
    assert.equal(payload.stream, false);
    assert.equal(payload.options.num_predict, 256);
    assert.equal(payload.options.num_ctx, 3072);
    assert.ok(CHAT_TIMEOUT_MS >= 120000);
  } finally {
    globalThis.fetch = original;
  }
});

test("timeout errors are distinguished from connectivity failures", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => { const e = new Error("Timed out"); e.name = "TimeoutError"; throw e; };
    await assert.rejects(
      () => answerWithContext("Question?", [{ title: "Guide", chunkIndex: 0, text: "Answer." }]),
      (e) => e instanceof OllamaError && e.code === "OLLAMA_TIMEOUT" && e.status === 504
    );
  } finally {
    globalThis.fetch = original;
  }
});

test("embedding requests can unload model after inference", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async (url, options) => {
      assert.ok(url.endsWith("/api/embed"));
      assert.equal(JSON.parse(options.body).keep_alive, "0");
      return { ok: true, json: async () => ({ embeddings: [[1, 2]] }) };
    };
    assert.deepEqual(await embedTexts(["hello"]), [[1, 2]]);
  } finally {
    globalThis.fetch = original;
  }
});
