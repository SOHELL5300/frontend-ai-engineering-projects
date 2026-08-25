"use client";

import { useState, useEffect } from "react";
import styles from "./LoadingState.module.css";

const LOADING_MESSAGES = [
  { text: "Listening to what you said...", duration: 3000 },
  { text: "Understanding your order...", duration: 3000 },
  { text: "Checking the menu...", duration: 4000 },
  { text: "Putting your order together...", duration: 4000 },
  { text: "Almost there...", duration: 5000 },
  { text: "Still working on it, hang tight...", duration: 100000 },
];

export default function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (messageIndex >= LOADING_MESSAGES.length - 1) return;

    const timer = setTimeout(() => {
      setMessageIndex((prev) => prev + 1);
    }, LOADING_MESSAGES[messageIndex].duration);

    return () => clearTimeout(timer);
  }, [messageIndex]);

  return (
    <div className={styles.loadingBox}>
      <span className={styles.spinner}></span>
      <p key={messageIndex} className={styles.message}>
        {LOADING_MESSAGES[messageIndex].text}
      </p>
    </div>
  );
}