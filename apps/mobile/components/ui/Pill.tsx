import { View, Text, StyleSheet } from "react-native";
import { colors, radius, spacing, type } from "../../theme";

type Tone = "neutral" | "primary" | "accent" | "success" | "danger";

export function Pill({ label, tone = "neutral" }: { label: string; tone?: Tone }) {
  const t = toneStyles[tone];
  return (
    <View style={[styles.base, { backgroundColor: t.bg }]}>
      <Text style={[styles.label, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignSelf: "flex-start",
  },
  label: { ...type.bodySmStrong },
});

const toneStyles: Record<Tone, { bg: string; fg: string }> = {
  neutral: { bg: colors.canvasSoft, fg: colors.ink },
  primary: { bg: colors.primary, fg: colors.onDark },
  accent: { bg: colors.accentSoft, fg: "#894329" },
  success: { bg: "#e3f3e8", fg: colors.success },
  danger: { bg: "#fbe6e6", fg: colors.danger },
};
