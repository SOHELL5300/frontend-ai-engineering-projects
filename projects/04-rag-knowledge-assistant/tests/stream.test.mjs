import test from "node:test";
import assert from "node:assert/strict";
import { readNdjson, jsonLine } from "../lib/stream.mjs";
import { chatPayload } from "../lib/ollama.mjs";

function source(parts) {
  return new ReadableStream({
    start(controller) {
      for (const part of parts) controller.enqueue(new TextEncoder().encode(part));
      controller.close();
    },
  });
}
test("reads fragmented JSON lines including UTF-8 unicode and trailing lines", async () => {
  const payload = '{"message":{"content":"Hello 🌍"},"done":false}\n{"done":true}';
  const bytes = new TextEncoder().encode(payload);
  const fragments = [bytes.slice(0, 20), bytes.slice(20, 34), bytes.slice(34, 41), bytes.slice(41)];
  const chunks = new ReadableStream({
    start(controller) {
      for (const piece of fragments) controller.enqueue(piece);
      controller.close();
    },
  });
  const out = [];
  for await (const item of readNdjson(chunks)) out.push(item);
  assert.equal(out[0].message.content, "Hello 🌍");
  assert.equal(out[1].done, true);
});

test("rejects invalid or excessively large NDJSON messages", async () => {
  await assert.rejects(async () => {
    for await (const ignored of readNdjson(source(["not-json\n"]))) void ignored;
  }, SyntaxError);
  await assert.rejects(async () => {
    for await (const ignored of readNdjson(source(['{"a":"123456789"}\n']), { maxLineChars: 8 })) void ignored;
  }, /too long/);
});

test("framed stream events are valid JSON lines", () => {
  assert.deepEqual(JSON.parse(jsonLine({ type: "token", text: "abc" })), { type: "token", text: "abc" });
});

test("streaming and non-streaming chat payloads share citation formatting", () => {
  const input = [{ title: "RAG PDF", chunkIndex: 1, pageNumber: 2, text: "Acceptance code: 731" }];
  const a = chatPayload("Find code", input, true);
  const b = chatPayload("Find code", input, false);
  assert.equal(a.stream, true);
  assert.equal(b.stream, false);
  assert.deepEqual(a.messages, b.messages);
  assert.match(a.messages[1].content, /PDF page 2/);
  assert.match(a.messages[1].content, /SOURCE \[1\]/);
});
