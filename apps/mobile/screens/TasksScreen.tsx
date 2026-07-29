import { useState, useCallback } from "react";
import { View, Text, TextInput, FlatList, StyleSheet, Pressable, ScrollView, Modal } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Search, ChevronDown, Check } from "lucide-react-native";
import { getClient } from "@taskhub/data";
import type { Task, TaskCategory } from "@taskhub/shared";
import { CATEGORY_LABELS, COUNTRY_LABELS, SRI_LANKA_DISTRICTS } from "@taskhub/shared";
import { TaskListItem } from "../components/TaskListItem";
import { CategoryIcon } from "../components/CategoryIcon";
import { useCountry } from "../lib/country";
import { colors, radius, shadow, spacing, type } from "../theme";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as TaskCategory[];

export function TasksScreen({ navigation, route }: any) {
  const { country } = useCountry();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<TaskCategory | null>(route?.params?.category ?? null);
  const [district, setDistrict] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getClient()
      .getTasks({ status: "open", category: category ?? undefined, district: district ?? undefined, country, query: query || undefined })
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [category, district, country, query]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <FlatList
      style={styles.screen}
      data={tasks}
      keyExtractor={(t) => t.id}
      contentContainerStyle={styles.list}
      refreshing={loading}
      onRefresh={load}
      ListHeaderComponent={
        <View>
          <Text style={styles.heading}>Browse tasks</Text>
          <Text style={styles.subheading}>
            {loading ? "Loading…" : `${tasks.length} task${tasks.length === 1 ? "" : "s"} open in ${COUNTRY_LABELS[country]}`}
          </Text>

          <View style={styles.searchRow}>
            <Search size={16} color={colors.mute} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={load}
              placeholder="Search tasks…"
              placeholderTextColor={colors.mute}
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>

          {country === "LK" && (
            <Pressable onPress={() => setPickerOpen(true)} style={styles.districtRow}>
              <Text style={styles.districtText}>{district ?? "All districts"}</Text>
              <ChevronDown size={16} color={colors.body} />
            </Pressable>
          )}

          <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
            <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
              <View style={styles.modalSheet}>
                <ScrollView>
                  <Pressable
                    style={styles.modalRow}
                    onPress={() => {
                      setDistrict(null);
                      setPickerOpen(false);
                    }}
                  >
                    <Text style={styles.modalRowText}>All districts</Text>
                    {!district && <Check size={16} color={colors.primary} />}
                  </Pressable>
                  {SRI_LANKA_DISTRICTS.map((d) => (
                    <Pressable
                      key={d}
                      style={styles.modalRow}
                      onPress={() => {
                        setDistrict(d);
                        setPickerOpen(false);
                      }}
                    >
                      <Text style={styles.modalRowText}>{d}</Text>
                      {district === d && <Check size={16} color={colors.primary} />}
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </Pressable>
          </Modal>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipsRow}
            contentContainerStyle={{ gap: spacing.sm, paddingRight: spacing.lg }}
          >
            <Pressable onPress={() => setCategory(null)} style={[styles.chip, !category && styles.chipActive]}>
              <Text style={[styles.chipText, !category && styles.chipTextActive]}>All</Text>
            </Pressable>
            {CATEGORIES.map((cat) => (
              <Pressable key={cat} onPress={() => setCategory(cat)} style={[styles.chip, category === cat && styles.chipActive]}>
                <CategoryIcon category={cat} size={13} color={category === cat ? colors.onDark : colors.body} />
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{CATEGORY_LABELS[cat]}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      }
      renderItem={({ item }) => <TaskListItem task={item} onPress={() => navigation.navigate("TaskDetail", { taskId: item.id })} />}
      ListEmptyComponent={!loading ? <Text style={styles.empty}>No tasks match your search.</Text> : null}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  heading: { ...type.displayMd, color: colors.ink, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  subheading: { ...type.bodySm, color: colors.body, paddingHorizontal: spacing.lg, marginTop: spacing.xs },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.canvasSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  searchInput: { flex: 1, paddingVertical: spacing.md, color: colors.ink, ...type.bodyMd },
  districtRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.canvasSoft,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  districtText: { ...type.bodyMd, color: colors.ink },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: colors.canvas, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: "70%", paddingVertical: spacing.md },
  modalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
  modalRowText: { ...type.bodyMd, color: colors.ink },
  chipsRow: { marginTop: spacing.lg, paddingLeft: spacing.lg, marginBottom: spacing.lg },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.canvasSoft,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  chipActive: { backgroundColor: colors.accent, ...shadow.level1 },
  chipText: { ...type.bodySmStrong, color: colors.ink },
  chipTextActive: { color: colors.onDark },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl },
  empty: { ...type.bodyMd, color: colors.mute, textAlign: "center", marginTop: spacing.xxxl },
});
