import styles from "./EmptyState.module.css";

export default function EmptyState() {
  return (
    <div className={styles.emptyBox}>
      <h3>Your cart is empty</h3>
      <p>Try saying: “Order two paneer burgers from Burger House.”</p>
    </div>
  );
}