import { checkOllama } from "../../../lib/ollama.mjs";

export const runtime = "nodejs";
export async function GET() {
  return Response.json(await checkOllama(), { headers: { "cache-control": "no-store" } });
}
