"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MeetingInput from "@/components/MeetingInput";
import NotesResult from "@/components/NotesResult";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";

export default function HomePage() {
  const [meetingText, setMeetingText] = useState("");
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerateNotes() {
    const trimmedText = meetingText.trim();

    // Basic frontend validation before calling the API.
    if (!trimmedText) {
      setError("Please paste meeting notes or a transcript before generating.");
      setGeneratedNotes(null);
      return;
    }

    setIsGenerating(true);
    setError("");
    setGeneratedNotes(null);

    try {
      const response = await fetch("/api/generate-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingText: trimmedText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setGeneratedNotes(data.notes);
    } catch (err) {
      setError(
        err.message ||
          "Failed to generate meeting notes. Please try again later."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleClear() {
    setMeetingText("");
    setGeneratedNotes(null);
    setError("");
  }

  return (
    <main className="appShell">
      <Header />

      <section className="heroSection">
        <div className="heroContent">
          <p className="eyebrow">Project 2 · Frontend AI Engineering</p>
          <h1>AI Meeting Notes & Action Items Generator</h1>
          <p className="heroDescription">
            Convert messy meeting notes or transcripts into structured summaries,
            decisions, action items, risks, and follow-up questions.
          </p>
        </div>
      </section>

      <section className="workspace">
        <MeetingInput
          value={meetingText}
          onChange={setMeetingText}
          onGenerate={handleGenerateNotes}
          onClear={handleClear}
          isGenerating={isGenerating}
        />

        <div className="resultPanel">
          {error && <ErrorMessage message={error} />}

          {!error && !generatedNotes && !isGenerating && <EmptyState />}

          {isGenerating && (
            <div className="loadingBox">
              <div className="spinner" />
              <p>Analyzing meeting notes with AI...</p>
            </div>
          )}

          {generatedNotes && !isGenerating && (
            <NotesResult notes={generatedNotes} />
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}