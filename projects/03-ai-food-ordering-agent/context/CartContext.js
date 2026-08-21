"use client";

import { createContext, useContext, useReducer } from "react";

const CartContext = createContext(null);

const initialState = {
  items: [],
  restaurant: null,
  orderPlaced: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM": {
      const { restaurant, item, quantity, modifiers } = action.payload;

      const existingItemIndex = state.items.findIndex(
        (cartItem) =>
          cartItem.id === item.id &&
          JSON.stringify(cartItem.modifiers) === JSON.stringify(modifiers)
      );

      let updatedItems = [...state.items];

      if (existingItemIndex !== -1) {
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
      } else {
        updatedItems.push({
          ...item,
          quantity,
          modifiers,
          restaurantId: restaurant.id,
        });
      }

      return {
        ...state,
        restaurant,
        items: updatedItems,
        orderPlaced: false,
      };
    }

    case "REMOVE_ITEM": {
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload.itemId),
      };
    }

    case "CLEAR_CART": {
      return initialState;
    }

    case "PLACE_ORDER": {
      return {
        ...state,
        orderPlaced: true,
      };
    }

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const cartTotal = state.items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const deliveryFee = state.items.length > 0 ? 35 : 0;
  const platformFee = state.items.length > 0 ? 10 : 0;
  const grandTotal = cartTotal + deliveryFee + platformFee;

  const value = {
    cart: state,
    dispatch,
    cartTotal,
    deliveryFee,
    platformFee,
    grandTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}