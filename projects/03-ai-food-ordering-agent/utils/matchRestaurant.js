export function matchRestaurant(restaurants, restaurantName) {
  if (!restaurantName) return null;

  const normalizedName = restaurantName.toLowerCase().trim();

  return (
    restaurants.find((restaurant) =>
      restaurant.name.toLowerCase().includes(normalizedName)
    ) ||
    restaurants.find((restaurant) =>
      normalizedName.includes(restaurant.name.toLowerCase())
    ) ||
    null
  );
}