import { useState } from "react";
import { StyleSheet, View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import EmptyState from "../components/EmptyState";
import CategoryBarChart from "../components/CategoryBarChart";
import { getCategory } from "../constants/categories";
import { useExpenses } from "../store/ExpensesContext";
import { useSettings } from "../store/SettingsContext";
import { filterByMonth, totalsByCategory } from "../store/selectors";
import { generateInsights } from "../store/insights";
import { formatCurrency, formatMonthYear } from "../utils/format";
import { colors, spacing, typography, radii } from "../theme";

export default function StatsScreen() {
  const { expenses } = useExpenses();
  const { currencySymbol } = useSettings();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());

  const isCurrentMonth =
    year === now.getFullYear() && monthIndex === now.getMonth();

  function goToPreviousMonth() {
    if (monthIndex === 0) {
      setYear((y) => y - 1);
      setMonthIndex(11);
    } else {
      setMonthIndex((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (isCurrentMonth) return;
    if (monthIndex === 11) {
      setYear((y) => y + 1);
      setMonthIndex(0);
    } else {
      setMonthIndex((m) => m + 1);
    }
  }

  const monthExpenses = filterByMonth(expenses, year, monthIndex);
  const totals = totalsByCategory(monthExpenses);
  const insights = generateInsights(expenses, year, monthIndex);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.monthSelector}>
        <Pressable
          onPress={goToPreviousMonth}
          accessibilityLabel="Previous month"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.monthLabel}>
          {formatMonthYear(monthIndex, year)}
        </Text>
        <Pressable
          onPress={goToNextMonth}
          disabled={isCurrentMonth}
          accessibilityLabel="Next month"
          accessibilityRole="button"
          accessibilityState={{ disabled: isCurrentMonth }}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={isCurrentMonth ? colors.border : colors.textPrimary}
          />
        </Pressable>
      </View>

      {totals.length === 0 ? (
        <View style={styles.emptyArea}>
          <EmptyState
            icon="bar-chart-outline"
            title="No stats yet"
            message="Log a few expenses and your spending breakdown will appear here."
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <CategoryBarChart totals={totals} />

          <View style={styles.legend}>
            {totals.map((t) => {
              const category = getCategory(t.categoryId);
              return (
                <View key={t.categoryId} style={styles.legendRow}>
                  <View
                    style={[
                      styles.legendDot,
                      { backgroundColor: category.color },
                    ]}
                  />
                  <Text style={styles.legendLabel}>{category.label}</Text>
                  <Text style={styles.legendAmount}>
                    {formatCurrency(t.total, currencySymbol)}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.insightsCard}>
            <Text style={styles.insightsHeading}>
              Spending insight{insights.length === 1 ? "" : "s"}
            </Text>
            {insights.map((line) => (
              <Text key={line} style={styles.insightLine}>
                {line}
              </Text>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  monthSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  monthLabel: {
    fontSize: typography.subtitle,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  emptyArea: { flex: 1, justifyContent: "center" },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  legend: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: radii.pill,
    marginRight: spacing.sm,
  },
  legendLabel: {
    flex: 1,
    fontSize: typography.body,
    color: colors.textPrimary,
  },
  legendAmount: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  insightsCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: radii.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  insightsHeading: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  insightLine: {
    fontSize: typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
});
