"use client";

import { useState } from "react";
import VoiceInput from "@/components/VoiceInput";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { restaurants } from "@/data/restaurants";
import { useCart } from "@/context/CartContext";
import { executeCommandAction } from "@/services/commandActionService";
import styles from "./CommandBox.module.css";

export default function CommandBox() {
  const [command, setCommand] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { cart, dispatch } = useCart();

  async function handleCommandSubmit(event) {
    event.preventDefault();

    if (!command.trim()) {
      setError("Please enter or speak a command first.");
      return;
    }

    setIsLoading(true);
    setError("");
    setStatusMessage("");

    try {
      const response = await fetch("/api/parse-command", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse command.");
      }

      const actionResult = executeCommandAction({
        parsedCommand: data.parsedCommand,
        restaurants,
        dispatch,
        cart,
      });

      if (!actionResult.success) {
        setError(actionResult.message);
      } else {
        setStatusMessage(actionResult.message);
        setCommand("");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleTranscript(transcript) {
    setCommand(transcript);
  }

  return (
    <section className={styles.commandSection}>
      <div className={styles.header}>
        <span className={styles.badge}>AI Command Agent</span>
        <h1>Order food using text or voice</h1>
        <p>
          Type or speak naturally. The AI will understand your command and
          convert it into cart actions.
        </p>
      </div>

      <form className={styles.commandForm} onSubmit={handleCommandSubmit}>
        <input
          value={command}
          onChange={(event) => setCommand(event.target.value)}
          placeholder='Try: "Order two paneer burgers from Burger House"'
          className={styles.commandInput}
        />

        <div className={styles.actions}>
          <VoiceInput onTranscript={handleTranscript} />
          <button className={styles.submitButton} type="submit">
            Run Command
          </button>
        </div>
      </form>

      <div className={styles.examples}>
        <button onClick={() => setCommand("Order two paneer burgers from Burger House with extra cheese")}>
          Order burgers
        </button>
        <button onClick={() => setCommand("Add one masala dosa from South Kitchen")}>
          Add dosa
        </button>
        <button onClick={() => setCommand("Show my cart")}>
          Show cart
        </button>
        <button onClick={() => setCommand("Place the order")}>
          Place order
        </button>
      </div>

      {isLoading && <LoadingState />}

      {error && <ErrorState message={error} />}

      {statusMessage && (
        <div className={styles.successBox}>
          <strong>Done</strong>
          <p>{statusMessage}</p>
        </div>
      )}
    </section>
  );
}