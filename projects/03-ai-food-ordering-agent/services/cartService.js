import { matchRestaurant } from "@/utils/matchRestaurant";
import { matchMenuItem } from "@/utils/matchMenuItem";

export function addItemsToCartFromCommand({
  parsedCommand,
  restaurants,
  dispatch,
}) {
  const restaurant = matchRestaurant(
    restaurants,
    parsedCommand.restaurantName
  );

  if (!restaurant) {
    return {
      success: false,
      message: `I could not find restaurant "${parsedCommand.restaurantName}".`,
    };
  }

  const addedItems = [];
  const failedItems = [];

  parsedCommand.items.forEach((commandItem) => {
    const matchedItem = matchMenuItem(restaurant.menu, commandItem.name);

    if (!matchedItem) {
      failedItems.push(commandItem.name);
      return;
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        restaurant,
        item: matchedItem,
        quantity: commandItem.quantity || 1,
        modifiers: commandItem.modifiers || [],
      },
    });

    addedItems.push({
      name: matchedItem.name,
      quantity: commandItem.quantity || 1,
    });
  });

  if (addedItems.length === 0) {
    return {
      success: false,
      message: `I could not find the requested item in ${restaurant.name}.`,
    };
  }

  return {
    success: true,
    message: `Added ${addedItems
      .map((item) => `${item.quantity} x ${item.name}`)
      .join(", ")} from ${restaurant.name} to cart.`,
    failedItems,
  };
}