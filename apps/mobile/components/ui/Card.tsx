import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, shadow, spacing } from "../../theme";

type Variant = "content" | "elevated" | "soft" | "onDark";

interface CardProps {
  children: React.ReactNode;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, variant = "content", style }: CardProps) {
  return <View style={[styles.base, variantStyles[variant], style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
});

const variantStyles: Record<Variant, object> = {
  content: { backgroundColor: colors.canvas, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  elevated: { backgroundColor: colors.canvas, ...shadow.level2 },
  soft: { backgroundColor: colors.canvasSoft },
  onDark: { backgroundColor: colors.primary },
};
