import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "../../theme";

export function Avatar({ src, name, size = 40 }: { src?: string; name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (!src) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={{ color: colors.onDark, fontSize: size * 0.38, fontWeight: "500" }}>{initials}</Text>
      </View>
    );
  }

  return <Image source={{ uri: src }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
