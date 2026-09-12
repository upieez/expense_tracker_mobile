import { View, Text, Pressable, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCategory } from "../constants/categories";
import { formatCurrency } from "../utils/format";
import { colors, spacing, typography, radii } from "../theme";

export default function ExpenseRow({
  expense,
  onPress,
  onDelete,
  currencySymbol = "$",
}) {
  const category = getCategory(expense.categoryId);

  function handleLongPress() {
    Alert.alert(
      "Delete expense?",
      `Remove this ${category.label} expense of ${formatCurrency(expense.amount, currencySymbol)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(expense),
        },
      ],
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={() => onPress(expense)}
      onLongPress={handleLongPress}
      accessibilityRole="button"
      accessibilityLabel={`${category.label} expense, ${formatCurrency(expense.amount, currencySymbol)}`}
    >
      <View style={[styles.iconBadge, { backgroundColor: category.color }]}>
        <Ionicons name={category.icon} size={18} color={colors.textInverse} />
      </View>
      <View style={styles.details}>
        <View style={styles.categoryRow}>
          <Text style={styles.category}>{category.label}</Text>
          {expense.photoUri ? (
            <Ionicons
              name="camera"
              size={12}
              color={colors.textSecondary}
              style={styles.photoDot}
            />
          ) : null}
        </View>
        {expense.note ? (
          <Text style={styles.note} numberOfLines={1}>
            {expense.note}
          </Text>
        ) : null}
      </View>
      <Text style={styles.amount}>
        {formatCurrency(expense.amount, currencySymbol)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  rowPressed: { backgroundColor: colors.primaryLight },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  details: { flex: 1 },
  categoryRow: { flexDirection: "row", alignItems: "center" },
  category: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  photoDot: { marginLeft: spacing.xs },
  note: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  amount: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
});
