"use client";

import { useCallback, useEffect, useState } from "react";

const SAMPLE = "Retrieval augmented generation, or RAG, connects a language model to outside documents. During indexing, the app splits a document into overlapping chunks, makes embedding vectors, and stores them. During retrieval, the app embeds the question and compares it with indexed chunks using cosine similarity. The best chunks are included in the chat model prompt to produce a source-grounded answer. Students should inspect the citations because a generated answer can still be incorrect. A similarity score is not a calibrated confidence score. Production applications also require authentication, tenant isolation, monitoring, evaluation, and durable vector storage.";
const MAX_PDF_BYTES = 4 * 1024 * 1024;

async function api(url, options = {}) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Error(data.error || "Request failed.");
  return data;
}

export default function Studio() {
  const [docs, setDocs] = useState([]);
  const [health, setHealth] = useState(null);
  const [tab, setTab] = useState("ask");
  const [sourceKind, setSourceKind] = useState("text");
  const [pdfFile, setPdfFile] = useState(null);
  const [title, setTitle] = useState("RAG Introduction");
  const [content, setContent] = useState(SAMPLE);
  const [question, setQuestion] = useState("What happens during the indexing stage?");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState("");

  const refresh = useCallback(async () => {
    try {
      const [documents, status] = await Promise.all([api("/api/documents"), api("/api/health")]);
      setDocs(documents.documents);
      setHealth(status);
    } catch (reason) {
      setError(reason.message);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function index(event) {
    event.preventDefault();
    setLoading("index");
    setError("");
    setNotice("");
    try {
      let indexed;
      if (sourceKind === "pdf") {
        if (!pdfFile) throw Error("Select a PDF file before indexing.");
        if (pdfFile.size > MAX_PDF_BYTES) throw Error("PDF files must be 4 MB or smaller.");
        const body = new FormData();
        body.append("file", pdfFile, pdfFile.name);
        indexed = await api("/api/documents/pdf", { method: "POST", body });
      } else {
        indexed = await api("/api/documents", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, text: content }),
        });
      }
      setNotice(indexed.created ? "Document indexed successfully." : "This document is already indexed; existing vectors were reused.");
      setPdfFile(null);
      setResult(null);
      await refresh();
      setTab("ask");
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading("");
    }
  }

  async function ask(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setResult(null);
    setLoading("ask");
    try {
      setResult(await api("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      }));
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading("");
    }
  }

  async function remove(id) {
    if (!window.confirm("Delete this indexed document?")) return;
    setLoading("delete");
    setError("");
    setNotice("");
    try {
      await api("/api/documents?id=" + encodeURIComponent(id), { method: "DELETE" });
      setResult(null);
      setNotice("Document removed from local knowledge base.");
      await refresh();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setLoading("");
    }
  }

  async function importText(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!/\.(txt|md|markdown)$/i.test(file.name) || file.size > 100000) {
      setError("Choose a TXT or Markdown file smaller than 100 KB.");
      return;
    }
    setTitle(file.name.replace(/\.(txt|md|markdown)$/i, "").slice(0, 120));
    setContent(await file.text());
    setError("");
  }

  function importPdf(event) {
    const file = event.target.files?.[0];
    setPdfFile(null);
    setError("");
    if (!file) return;
    if (!/\.pdf$/i.test(file.name) || file.size > MAX_PDF_BYTES) {
      setError("Choose a PDF file no larger than 4 MB.");
      event.target.value = "";
      return;
    }
    setPdfFile(file);
  }

  const ready = health?.online && health?.chatReady && health?.embedReady;
  const chunkCount = docs.reduce((sum, doc) => sum + doc.chunkCount, 0);

  return <main className="shell">
    <header>
      <a href="https://frontendaiengineer.com" target="_blank" rel="noreferrer" className="brand">
        <b>F/</b> FRONTEND AI <span>/ KNOWLEDGE STUDIO</span>
      </a>
      <a href="https://github.com/SOHELL5300/frontend-ai-engineering-projects" target="_blank" rel="noreferrer" className="link">GitHub ↗</a>
    </header>

    <section className="hero">
      <small>● PROJECT 04 / RETRIEVAL AUGMENTED GENERATION</small>
      <h1>Make AI answer from <em>your knowledge.</em></h1>
      <p>Index PDFs, text and Markdown. Generate embeddings, retrieve relevant passages and inspect page-aware citations with local Ollama models.</p>
      <div className="status">
        <strong>{ready ? "● Ollama connected" : health?.online ? "● Pull required models" : "● Ollama disconnected"}</strong>
        <span className="storage-indicator" aria-label="Active storage backend">{health?.storageMode === "postgres" ? "▦ PostgreSQL + pgvector" : "▤ Local JSON"}</span>
        <button type="button" onClick={refresh}>↻ Refresh status</button>
      </div>
      {!ready && <p className="hint">Run Ollama locally and pull your configured chat model and embeddinggemma. See the README for low-memory setup.</p>}
    </section>

    <section className="stats">
      <div><b>{docs.length}</b><span>Indexed documents</span></div>
      <div><b>{chunkCount}</b><span>Searchable chunks</span></div>
      <div><b>LOCAL</b><span>Embeddings + generation</span></div>
    </section>

    <div className="workspace">
      <aside>
        <div className="heading">
          <div><small>01 / KNOWLEDGE BASE</small><h2>Your documents</h2></div>
          <button type="button" className="add" onClick={() => setTab("add")}>+ Add</button>
        </div>
        {docs.length ? docs.map((doc) => <div className="doc" key={doc.id}>
          <div className="fileicon">{doc.sourceType === "pdf" ? "PDF" : "▤"}</div>
          <div className="docinfo">
            <strong title={doc.title}>{doc.title}</strong>
            <span>
              {doc.sourceType === "pdf" ? "PDF · " + doc.pageCount + " page" + (doc.pageCount === 1 ? "" : "s") + " · " : "Text · "}
              {doc.chunkCount} chunks
            </span>
          </div>
          <button type="button" aria-label={"Delete " + doc.title} disabled={!!loading} onClick={() => remove(doc.id)}>×</button>
        </div>) : <div className="placeholder">No documents yet. Index the sample guide or upload a text-based PDF.</div>}
        <div className="pipeline">
          <small>THE RETRIEVAL PIPELINE</small>
          <p><i>01</i> Document ingestion</p>
          <p><i>02</i> Chunk + embed</p>
          <p><i>03</i> Similarity search</p>
          <p><i>04</i> Page-aware citations</p>
        </div>
      </aside>

      <section className="panel">
        <nav aria-label="Knowledge studio workspace">
          <button type="button" className={tab === "ask" ? "active" : ""} onClick={() => setTab("ask")}>✦ Ask knowledge base</button>
          <button type="button" className={tab === "add" ? "active" : ""} onClick={() => setTab("add")}>＋ Add document</button>
        </nav>
        {error && <div role="alert" className="error">{error} <button type="button" aria-label="Dismiss error" onClick={() => setError("")}>×</button></div>}
        {notice && <div role="status" className="notice">{notice} <button type="button" aria-label="Dismiss notice" onClick={() => setNotice("")}>×</button></div>}
        <div className="inside">
          {tab === "add" ? <>
            <small>INDEXING / STEP 01</small>
            <h2>Build your knowledge base.</h2>
            <p>Choose a source type. Content is chunked, embedded by Ollama, and stored in your local knowledge index.</p>
            <div className="source-modes" role="group" aria-label="Document source type">
              <button type="button" aria-pressed={sourceKind === "text"} className={sourceKind === "text" ? "chosen" : ""} onClick={() => { setSourceKind("text"); setError(""); }}>Text / Markdown</button>
              <button type="button" aria-pressed={sourceKind === "pdf"} className={sourceKind === "pdf" ? "chosen" : ""} onClick={() => { setSourceKind("pdf"); setError(""); }}>PDF document</button>
            </div>
            <form onSubmit={index}>
              {sourceKind === "pdf" ? <>
                <label htmlFor="pdf-document">CHOOSE PDF FILE</label>
                <div className="uploadcard">
                  <div className="uploadsymbol">▣</div>
                  <strong>{pdfFile ? pdfFile.name : "Import a text-based PDF"}</strong>
                  <span>{pdfFile ? (pdfFile.size / 1024).toFixed(0) + " KB selected" : "PDF · Up to 4 MB · 30 pages"}</span>
                  <input id="pdf-document" type="file" accept=".pdf,application/pdf" onChange={importPdf}/>
                </div>
                <p className="filehelp">Page numbers are preserved in citations. Image-only/scanned or password-protected PDFs are not supported. The original PDF file is not saved.</p>
              </> : <>
                <label htmlFor="title">DOCUMENT TITLE</label>
                <input id="title" required minLength={2} maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)}/>
                <div className="labelline">
                  <label htmlFor="document">DOCUMENT TEXT</label>
                  <label className="upload">↑ Import TXT / MD <input type="file" accept=".txt,.md,.markdown" onChange={importText}/></label>
                </div>
                <textarea id="document" value={content} minLength={40} maxLength={50000} required rows={11} onChange={(event) => setContent(event.target.value)}/>
              </>}
              <div className="formbottom">
                <span>{sourceKind === "pdf" ? "PDF text extraction happens on the server." : content.length + "/50,000 characters"}</span>
                <button className="primary" disabled={!ready || !!loading || (sourceKind === "pdf" && !pdfFile)}>
                  {loading === "index" ? "Extracting + embedding…" : sourceKind === "pdf" ? "Index PDF →" : "Index document →"}
                </button>
              </div>
            </form>
          </> : <>
            <small>RETRIEVAL / STEP 02</small>
            <h2>Ask. Retrieve. Understand.</h2>
            <p>Ask questions using your indexed documents and inspect exactly which text or PDF page informed the response.</p>
            <div className="suggestions">
              {["What is RAG?", "How are documents indexed?", "Why do citations matter?"].map((prompt) => <button type="button" key={prompt} onClick={() => setQuestion(prompt)}>{prompt} ↗</button>)}
            </div>
            <form className="askbox" onSubmit={ask}>
              <label htmlFor="question">YOUR QUESTION</label>
              <textarea id="question" rows={3} maxLength={500} value={question} onChange={(event) => setQuestion(event.target.value)}/>
              <div className="formbottom"><span>{question.length}/500</span>
                <button className="primary" disabled={!ready || !!loading || !docs.length || question.trim().length < 3}>{loading === "ask" ? "Searching…" : "Ask knowledge base →"}</button>
              </div>
            </form>
            {result ? <div className="answer">
              <div className="answerheader">✦ GENERATED ANSWER <span>{result.sources.length} source passages</span></div>
              <article>{result.answer}</article>
              {!!result.sources.length && <div className="sources">
                <h3>Retrieved evidence</h3>
                {result.sources.map((source) => <details key={source.documentId + "-" + source.chunkIndex}>
                  <summary>
                    <span className="source-reference">[{source.citation}] {source.title}{source.pageNumber ? " · Page " + source.pageNumber : ""}{" · Chunk " + (source.chunkIndex + 1)}</span>{" · "}
                    <span className="similarity-label">Similarity: {Math.round(source.similarity * 100)}%</span>
                  </summary>
                  <p>{source.excerpt}</p>
                </details>)}
              </div>}
            </div> : <div className="resultempty"><div>✧</div><h3>Ready for your first question.</h3><p>Answers and source excerpts will appear here, including PDF page references.</p></div>}
          </>}
        </div>
      </section>
    </div>
    <footer>FRONTEND AI ENGINEERING · RAG LAB <span>Local-only educational prototype · Not production multi-user storage</span></footer>
  </main>;
}
