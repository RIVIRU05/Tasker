import { View, Text, TextInput, StyleSheet, type TextInputProps } from "react-native";
import { colors, radius, spacing, type } from "../../theme";

interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
}

export function Input({ label, hint, style, ...props }: InputProps) {
  return (
    <View style={styles.wrap}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput placeholderTextColor={colors.mute} style={[styles.input, style]} {...props} />
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

export function Textarea(props: InputProps) {
  return <Input multiline numberOfLines={4} style={styles.textarea} {...props} />;
}

const styles = StyleSheet.create({
  wrap: { width: "100%" },
  label: { ...type.bodySmStrong, color: colors.ink, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.canvasSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.ink,
    ...type.bodyMd,
  },
  textarea: { minHeight: 100, textAlignVertical: "top" },
  hint: { ...type.caption, color: colors.mute, marginTop: spacing.xs },
});
