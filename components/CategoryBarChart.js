import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { getCategory } from '../constants/categories';
import { colors, spacing, typography } from '../theme';

const CHART_HEIGHT = 120;
const BAR_WIDTH = 28;

export default function CategoryBarChart({ totals }) {
  if (totals.length === 0) return null;
  const max = Math.max(...totals.map((t) => t.total));

  return (
    <View style={styles.row}>
      {totals.map((t) => {
        const category = getCategory(t.categoryId);
        const barHeight = max > 0 ? Math.max((t.total / max) * CHART_HEIGHT, 4) : 4;
        return (
          <View key={t.categoryId} style={styles.slot}>
            <Svg width={BAR_WIDTH} height={CHART_HEIGHT}>
              <Rect
                x={0}
                y={CHART_HEIGHT - barHeight}
                width={BAR_WIDTH}
                height={barHeight}
                rx={6}
                fill={category.color}
              />
            </Svg>
            <Text style={styles.percent}>{Math.round(t.share * 100)}%</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  slot: { alignItems: 'center', marginHorizontal: spacing.xs },
  percent: { fontSize: typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
});
