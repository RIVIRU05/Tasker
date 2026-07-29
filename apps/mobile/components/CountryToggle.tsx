import { View, Text, Pressable, StyleSheet } from "react-native";
import { useCountry } from "../lib/country";
import { colors, radius, spacing, type } from "../theme";

export function CountryToggle() {
  const { country, setCountry } = useCountry();

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => setCountry("LK")} style={[styles.option, country === "LK" && styles.optionActive]}>
        <Text style={[styles.text, country === "LK" && styles.textActive]}>🇱🇰 LK</Text>
      </Pressable>
      <Pressable onPress={() => setCountry("AU")} style={[styles.option, country === "AU" && styles.optionActive]}>
        <Text style={[styles.text, country === "AU" && styles.textActive]}>🇦🇺 AU</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", backgroundColor: colors.canvasSoft, borderRadius: radius.pill, padding: 2, marginRight: spacing.lg },
  option: { paddingVertical: spacing.xxs, paddingHorizontal: spacing.sm, borderRadius: radius.pill },
  optionActive: { backgroundColor: colors.primary },
  text: { ...type.caption, fontWeight: "600", color: colors.body },
  textActive: { color: colors.onDark },
});
