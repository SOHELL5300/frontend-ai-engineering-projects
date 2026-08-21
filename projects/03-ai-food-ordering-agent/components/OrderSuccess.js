"use client";

import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./OrderSuccess.module.css";

export default function OrderSuccess() {
  const { cart, grandTotal, dispatch } = useCart();

  if (!cart.orderPlaced) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.successCard}>
        <div className={styles.icon}>✅</div>

        <h2>Order placed successfully</h2>

        <p>
          Your order from <strong>{cart.restaurant?.name}</strong> has been
          placed. Total amount: <strong>{formatCurrency(grandTotal)}</strong>
        </p>

        <button onClick={() => dispatch({ type: "CLEAR_CART" })}>
          Start New Order
        </button>
      </div>
    </div>
  );
}