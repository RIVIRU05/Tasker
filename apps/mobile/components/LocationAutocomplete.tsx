import { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { MapPin } from "lucide-react-native";
import type { CountryCode, LocationSuggestion } from "@taskhub/shared";
import { searchLocations } from "../lib/geocode";
import { colors, radius, shadow, spacing, type } from "../theme";

interface LocationAutocompleteProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (suggestion: LocationSuggestion) => void;
  country?: CountryCode;
}

export function LocationAutocomplete({ label, placeholder, value, onChangeText, onSelect, country }: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const skipNextSearch = useRef(false);

  useEffect(() => {
    if (skipNextSearch.current) {
      skipNextSearch.current = false;
      return;
    }
    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    const handle = setTimeout(() => {
      searchLocations(value, country)
        .then((results) => {
          setSuggestions(results);
          setOpen(true);
        })
        .finally(() => setLoading(false));
    }, 400);
    return () => clearTimeout(handle);
  }, [value, country]);

  function handleSelect(s: LocationSuggestion) {
    skipNextSearch.current = true;
    setSuggestions([]);
    setOpen(false);
    onSelect(s);
  }

  return (
    <View style={{ zIndex: 20 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={(t) => {
          onChangeText(t);
          setOpen(false);
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.mute}
        style={styles.input}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
      />
      {open && (loading || suggestions.length > 0) && (
        <View style={styles.dropdown}>
          {loading && <Text style={styles.loadingText}>Searching…</Text>}
          {!loading &&
            suggestions.map((s, i) => (
              <Pressable
                key={`${s.lat}-${s.lng}-${i}`}
                onPress={() => handleSelect(s)}
                style={styles.row}
              >
                <MapPin size={14} color={colors.mute} />
                <Text style={styles.rowText}>{s.label}</Text>
              </Pressable>
            ))}
        </View>
      )}
      {loading && <ActivityIndicator size="small" color={colors.mute} style={{ position: "absolute", right: spacing.md, top: 34 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.bodySmStrong, color: colors.ink, marginBottom: spacing.xs },
  input: {
    backgroundColor: colors.canvasSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.ink,
    ...type.bodyMd,
  },
  dropdown: {
    position: "absolute",
    top: 68,
    left: 0,
    right: 0,
    backgroundColor: colors.canvas,
    borderRadius: radius.md,
    ...shadow.level2,
    overflow: "hidden",
    zIndex: 30,
  },
  loadingText: { ...type.bodySm, color: colors.mute, padding: spacing.md },
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xs, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.hairline },
  rowText: { ...type.bodySm, color: colors.ink, flex: 1 },
});
