import { addItemsToCartFromCommand } from "@/services/cartService";

export function executeCommandAction({
  parsedCommand,
  restaurants,
  dispatch,
  cart,
}) {
  switch (parsedCommand.intent) {
    case "ADD_TO_CART":
      return addItemsToCartFromCommand({
        parsedCommand,
        restaurants,
        dispatch,
      });

    case "REMOVE_FROM_CART": {
      const itemName = parsedCommand.items?.[0]?.name?.toLowerCase();

      if (!itemName) {
        return {
          success: false,
          message: "Please mention which item you want to remove.",
        };
      }

      const itemToRemove = cart.items.find((item) =>
        item.name.toLowerCase().includes(itemName)
      );

      if (!itemToRemove) {
        return {
          success: false,
          message: `I could not find ${parsedCommand.items[0].name} in your cart.`,
        };
      }

      dispatch({
        type: "REMOVE_ITEM",
        payload: {
          itemId: itemToRemove.id,
        },
      });

      return {
        success: true,
        message: `Removed ${itemToRemove.name} from your cart.`,
      };
    }

    case "CLEAR_CART":
      dispatch({ type: "CLEAR_CART" });

      return {
        success: true,
        message: "Your cart has been cleared.",
      };

    case "PLACE_ORDER": {
      if (cart.items.length === 0) {
        return {
          success: false,
          message: "Your cart is empty. Please add items before placing order.",
        };
      }

      dispatch({ type: "PLACE_ORDER" });

      return {
        success: true,
        message: "Order placed successfully.",
      };
    }

    case "SHOW_CART":
      return {
        success: true,
        message:
          cart.items.length > 0
            ? "Here is your current cart."
            : "Your cart is currently empty.",
      };

    default:
      return {
        success: false,
        message:
          "I understood your message, but I could not map it to a supported action.",
      };
  }
}