"use client";

import { useState } from "react";
import styles from "./VoiceInput.module.css";

export default function VoiceInput({ onTranscript }) {
  const [isListening, setIsListening] = useState(false);

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }

  return (
    <button
      type="button"
      className={`${styles.voiceButton} ${isListening ? styles.active : ""}`}
      onClick={startListening}
    >
      {isListening ? "Listening..." : "Voice Assistant "}
    </button>
  );
}