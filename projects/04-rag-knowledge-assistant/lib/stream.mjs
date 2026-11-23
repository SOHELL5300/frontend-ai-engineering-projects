// Incremental NDJSON reader shared by Node tests and the Ollama stream adapter.
// Handles UTF-8 boundaries and lines split across arbitrary network packets.
export async function* readNdjson(readable, { signal, maxLineChars = 65536 } = {}) {
  const reader = readable.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  try {
    while (true) {
      if (signal?.aborted) throw signal.reason ?? new Error("Stream aborted");
      const { done, value } = await reader.read();
      if (done) break;
      pending += decoder.decode(value, { stream: true });
      let boundary;
      while ((boundary = pending.indexOf("\n")) !== -1) {
        const raw = pending.slice(0, boundary).trim();
        pending = pending.slice(boundary + 1);
        if (raw) {
          if (raw.length > maxLineChars) throw new Error("NDJSON line too long");
          yield JSON.parse(raw);
        }
      }
      if (pending.length > maxLineChars) throw new Error("NDJSON line too long");
    }
    pending += decoder.decode();
    if (pending.trim()) {
      if (pending.length > maxLineChars) throw new Error("NDJSON line too long");
      yield JSON.parse(pending.trim());
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export function jsonLine(event) {
  return JSON.stringify(event) + "\n";
}
