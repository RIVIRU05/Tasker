import { View, Text, Image, StyleSheet } from "react-native";
import { colors, spacing, type } from "../theme";

export function AppHeaderLogo() {
  return (
    <View style={styles.row}>
      <Image source={require("../assets/logo-mark-64.png")} style={styles.mark} resizeMode="contain" />
      <Text style={styles.wordmark}>Tasker</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing.xs, paddingLeft: spacing.lg },
  mark: { width: 24, height: 24 },
  wordmark: { ...type.displaySm, fontSize: 20, color: colors.ink },
});
