export function matchMenuItem(menu, itemName) {
  if (!itemName) return null;

  const normalizedItem = itemName.toLowerCase().trim();

  return (
    menu.find((item) => item.name.toLowerCase().includes(normalizedItem)) ||
    menu.find((item) => normalizedItem.includes(item.name.toLowerCase())) ||
    menu.find((item) => {
      const words = item.name.toLowerCase().split(" ");

      return words.some((word) => normalizedItem.includes(word));
    }) ||
    null
  );
}

