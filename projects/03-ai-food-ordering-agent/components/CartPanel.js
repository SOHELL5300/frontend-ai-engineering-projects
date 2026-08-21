"use client";

import { useCart } from "@/context/CartContext";
import EmptyState from "@/components/EmptyState";
import { formatCurrency } from "@/utils/formatCurrency";
import styles from "./CartPanel.module.css";

export default function CartPanel() {
  const {
    cart,
    dispatch,
    cartTotal,
    deliveryFee,
    platformFee,
    grandTotal,
  } = useCart();

  if (cart.items.length === 0) {
    return (
      <aside className={styles.cartPanel}>
        <h2>Your Cart</h2>
        <EmptyState />
      </aside>
    );
  }

  return (
    <aside className={styles.cartPanel}>
      <div className={styles.cartHeader}>
        <div>
          <h2>Your Cart</h2>
          <p>{cart.restaurant?.name}</p>
        </div>

        <button
          className={styles.clearButton}
          onClick={() => dispatch({ type: "CLEAR_CART" })}
        >
          Clear
        </button>
      </div>

      <div className={styles.cartItems}>
        {cart.items.map((item) => (
          <div key={`${item.id}-${item.modifiers.join("-")}`} className={styles.cartItem}>
            <div>
              <h3>
                {item.quantity} x {item.name}
              </h3>

              {item.modifiers.length > 0 && (
                <p>Modifiers: {item.modifiers.join(", ")}</p>
              )}

              <button
                onClick={() =>
                  dispatch({
                    type: "REMOVE_ITEM",
                    payload: { itemId: item.id },
                  })
                }
              >
                Remove
              </button>
            </div>

            <strong>{formatCurrency(item.price * item.quantity)}</strong>
          </div>
        ))}
      </div>

      <div className={styles.bill}>
        <div>
          <span>Item total</span>
          <strong>{formatCurrency(cartTotal)}</strong>
        </div>

        <div>
          <span>Delivery fee</span>
          <strong>{formatCurrency(deliveryFee)}</strong>
        </div>

        <div>
          <span>Platform fee</span>
          <strong>{formatCurrency(platformFee)}</strong>
        </div>

        <div className={styles.grandTotal}>
          <span>Total</span>
          <strong>{formatCurrency(grandTotal)}</strong>
        </div>
      </div>

      <button
        className={styles.placeButton}
        onClick={() => dispatch({ type: "PLACE_ORDER" })}
      >
        Confirm Order
      </button>
    </aside>
  );
}