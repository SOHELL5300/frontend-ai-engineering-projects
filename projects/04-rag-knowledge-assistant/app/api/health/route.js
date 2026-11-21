import { checkOllama } from "../../../lib/ollama.mjs";
import { storageMode } from "../../../lib/repository.mjs";

export const runtime = "nodejs";
export async function GET() {
  return Response.json({ ...(await checkOllama()), storageMode: storageMode() }, { headers: { "cache-control": "no-store" } });
}
