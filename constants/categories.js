// Fixed expense categories. Each has a stable id (stored with the expense),
// a display label, an Ionicons icon name and a colour used consistently in
// the list rows, the category picker and the stats chart.

export const CATEGORIES = [
  { id: 'food', label: 'Food & Drink', icon: 'restaurant', color: '#F59E0B' },
  { id: 'transport', label: 'Transport', icon: 'bus', color: '#3B82F6' },
  { id: 'groceries', label: 'Groceries', icon: 'cart', color: '#10B981' },
  { id: 'entertainment', label: 'Entertainment', icon: 'film', color: '#8B5CF6' },
  { id: 'shopping', label: 'Shopping', icon: 'bag-handle', color: '#EC4899' },
  { id: 'bills', label: 'Bills', icon: 'receipt', color: '#EF4444' },
  { id: 'health', label: 'Health', icon: 'fitness', color: '#14B8A6' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-circle', color: '#64748B' },
];

// Look up a category by its id, falling back to 'other' so a bad/legacy id
// can never crash a render.
export function getCategory(id) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
