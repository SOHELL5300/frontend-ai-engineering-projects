"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import styles from "./VoiceInput.module.css";

const VoiceInput = forwardRef(function VoiceInput(
  { onTranscript, onStart, onEnd },
  ref
) {
  const [isListening, setIsListening] = useState(false);
  const [notSupported, setNotSupported] = useState(false);
  const recognitionRef = useRef(null);

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setNotSupported(true);
      setTimeout(() => setNotSupported(false), 3000);
      return;
    }

    if (isListening) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      onStart?.();
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      onEnd?.();
    };

    recognition.onend = () => {
      setIsListening(false);
      onEnd?.();
    };

    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
  }

  // Expose stopListening so parent (CommandBox) can cancel from its own Cancel button
  useImperativeHandle(ref, () => ({
    stopListening,
  }));

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.voiceButton} ${isListening ? styles.active : ""}`}
        onClick={isListening ? stopListening : startListening}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
      >
        <span className={styles.iconWrap}>
          {isListening ? (
            <span className={styles.waveform}>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </span>
          ) : (
            <svg
              className={styles.micIcon}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M19 11a7 7 0 0 1-14 0M12 18v3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
        <span className={styles.label}>
          {isListening ? "Listening..." : "Voice Assistant"}
        </span>
      </button>

      {notSupported && (
        <div className={styles.tooltip}>
          Voice input isn't supported in this browser. Try Chrome.
        </div>
      )}
    </div>
  );
});

export default VoiceInput;