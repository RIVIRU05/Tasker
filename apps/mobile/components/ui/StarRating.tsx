import { View, Text, StyleSheet } from "react-native";
import { Star } from "lucide-react-native";
import { colors, spacing, type } from "../../theme";

export function StarRating({
  value,
  size = 14,
  showValue = true,
  reviewCount,
}: {
  value: number;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
}) {
  return (
    <View style={styles.row}>
      <Star size={size} color={colors.accent} fill={colors.accent} />
      {showValue && <Text style={styles.value}>{value > 0 ? value.toFixed(1) : "New"}</Text>}
      {typeof reviewCount === "number" && <Text style={styles.count}>({reviewCount})</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xxs },
  value: { ...type.bodySmStrong, color: colors.ink },
  count: { ...type.bodySm, color: colors.mute },
});
