import test from "node:test";
import assert from "node:assert/strict";
import { cosineSimilarity, rankChunks } from "../lib/search.mjs";
test("identical vectors have similarity near 1",()=>assert.ok(Math.abs(cosineSimilarity([1,2],[1,2])-1)<1e-12));
test("invalid or zero vectors return zero",()=>{assert.equal(cosineSimilarity([0,0],[1,1]),0);assert.equal(cosineSimilarity([1],[1,2]),0);assert.equal(cosineSimilarity([NaN,1],[1,1]),0)});
test("retrieval ranks expected chunk",()=>{const docs=[{id:"a",title:"Demo",chunks:[{index:0,text:"A",embedding:[1,0]},{index:1,text:"B",embedding:[0,1]}]}];const hits=rankChunks(docs,[1,0],{topK:1,minScore:0.1});assert.equal(hits.length,1);assert.equal(hits[0].text,"A")});
