import styles from "./ErrorState.module.css";

export default function ErrorState({ message }) {
  return (
    <div className={styles.errorBox}>
      <strong>Something went wrong</strong>
      <p>{message}</p>
    </div>
  );
}