import { Pressable, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, typography, radii } from "../theme";

export default function CategoryChip({ category, selected, onPress }) {
  return (
    <Pressable
      onPress={() => onPress(category.id)}
      accessibilityRole="button"
      accessibilityLabel={category.label}
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        { borderColor: category.color },
        selected && { backgroundColor: category.color },
      ]}
    >
      <Ionicons
        name={category.icon}
        size={14}
        color={selected ? colors.textInverse : category.color}
        style={styles.icon}
      />
      <Text
        style={[
          styles.label,
          { color: selected ? colors.textInverse : category.color },
        ]}
      >
        {category.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  icon: { marginRight: 4 },
  label: { fontSize: typography.caption, fontWeight: typography.medium },
});
