export const CATEGORIES = [
  { id: "food", label: "Food & Drink", icon: "restaurant", color: "#F59E0B" },
  { id: "transport", label: "Transport", icon: "bus", color: "#3B82F6" },
  { id: "groceries", label: "Groceries", icon: "cart", color: "#10B981" },
  {
    id: "entertainment",
    label: "Entertainment",
    icon: "film",
    color: "#84CC16",
  },
  { id: "shopping", label: "Shopping", icon: "bag-handle", color: "#EC4899" },
  { id: "bills", label: "Bills", icon: "receipt", color: "#EF4444" },
  { id: "health", label: "Health", icon: "fitness", color: "#14B8A6" },
  {
    id: "other",
    label: "Other",
    icon: "ellipsis-horizontal-circle",
    color: "#64748B",
  },
];

export function getCategory(id) {
  return (
    CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
  );
}
