import { Pressable, Text, View, StyleSheet, ActivityIndicator, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, shadow, spacing, type } from "../../theme";

type Variant = "primary" | "secondary" | "subtle" | "large";

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({ label, onPress, variant = "primary", disabled, loading, icon, style }: ButtonProps) {
  const variantStyle = variantStyles[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variantStyle.container,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color as string} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.label, variantStyle.text]}>{label}</Text>
          {icon}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  label: { ...type.bodyMdStrong },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
});

const variantStyles: Record<Variant, { container: object; text: { color: string } }> = {
  primary: { container: { backgroundColor: colors.primary, ...shadow.level1 }, text: { color: colors.onDark } },
  large: {
    container: { backgroundColor: colors.primary, borderRadius: radius.xl, ...shadow.level1 },
    text: { color: colors.onDark },
  },
  secondary: {
    container: { backgroundColor: colors.canvas, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" },
    text: { color: colors.ink },
  },
  subtle: { container: { backgroundColor: colors.canvasSoft }, text: { color: colors.ink } },
};
