import { View, Text, StyleSheet, Pressable, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import EmptyState from '../components/EmptyState';
import ExpenseRow from '../components/ExpenseRow';
import { formatCurrency, formatMonthYear, dayLabel } from '../utils/format';
import { useExpenses } from '../store/ExpensesContext';
import { useSettings } from '../store/SettingsContext';
import { totalForMonth, filterByMonth, groupIntoDaySections } from '../store/selectors';
import { colors, spacing, typography, radii } from '../theme';

export default function HomeScreen({ navigation }) {
  const { expenses, removeExpense } = useExpenses();
  const { currencySymbol } = useSettings();
  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const monthExpenses = filterByMonth(expenses, year, monthIndex);
  const monthTotal = totalForMonth(expenses, year, monthIndex);
  const sections = groupIntoDaySections(monthExpenses);

  function handleEdit(expense) {
    navigation.navigate('AddExpense', { expense });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.monthLabel}>{formatMonthYear(monthIndex, year)}</Text>
        <Text style={styles.total}>{formatCurrency(monthTotal, currencySymbol)}</Text>
        <Text style={styles.totalCaption}>
          {monthExpenses.length === 0
            ? 'spent this month'
            : `spent this month · ${monthExpenses.length} expense${monthExpenses.length === 1 ? '' : 's'}`}
        </Text>
      </View>

      {sections.length === 0 ? (
        <View style={styles.emptyArea}>
          <EmptyState title="No expenses yet" message="Tap the + button to log your first expense." />
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseRow expense={item} onPress={handleEdit} onDelete={removeExpense} currencySymbol={currencySymbol} />
          )}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{dayLabel(section.title)}</Text>
          )}

          ListFooterComponent={<Text style={styles.hint}>Long-press an expense to delete it</Text>}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
        />
      )}

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => navigation.navigate('AddExpense')}
        accessibilityLabel="Add expense"
        accessibilityRole="button"
      >
        <Ionicons name="add" size={30} color={colors.textInverse} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  monthLabel: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  total: {
    fontSize: typography.display,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  totalCaption: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyArea: { flex: 1, justifyContent: 'center' },
  listContent: { paddingBottom: 100 },
  hint: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  sectionHeader: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    backgroundColor: colors.background,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabPressed: { opacity: 0.85 },
});
