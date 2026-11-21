import test from "node:test";
import assert from "node:assert/strict";
import { chunkText, normalizeText } from "../lib/chunk.mjs";

test("normalizes whitespace and line endings", () => {
  assert.equal(normalizeText("  Hello   world\r\n\r\n\r\nagain  "), "Hello world\n\nagain");
});
test("returns no chunks for whitespace", () => {
  assert.deepEqual(chunkText(" \n "), []);
});
test("single small document returns one chunk", () => {
  assert.deepEqual(chunkText("Hello world", { size: 100, overlap: 20 }), [{ index: 0, text: "Hello world" }]);
});
test("long documents split into ordered overlapping chunks", () => {
  const words = Array.from({ length: 180 }, (_, i) => "word" + i).join(" ");
  const chunks = chunkText(words, { size: 120, overlap: 30 });
  assert.ok(chunks.length > 3);
  assert.ok(chunks.every((chunk, i) => chunk.index === i && chunk.text.length <= 120));
  assert.ok(chunks.some((chunk, i) => i > 0 && chunks[i - 1].text.includes(chunk.text.split(" ")[0])));
});
test("invalid overlap cannot create an infinite loop", () => {
  assert.throws(() => chunkText("hello", { size: 100, overlap: 100 }), RangeError);
});
