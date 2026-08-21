import styles from "./LoadingState.module.css";

export default function LoadingState() {
  return (
    <div className={styles.loadingBox}>
      <span className={styles.spinner}></span>
      <p>AI is understanding your command...</p>
    </div>
  );
}