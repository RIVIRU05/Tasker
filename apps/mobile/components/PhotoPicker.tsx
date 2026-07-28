import { useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Plus, X } from "lucide-react-native";
import { isMock, uploadPhoto } from "@taskhub/data";
import { colors, radius, spacing, type } from "../theme";

interface PhotoPickerProps {
  label: string;
  value: string[];
  onChange: (urls: string[]) => void;
  pathPrefix: string;
  multiple?: boolean;
}

async function uriToBlob(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}

export function PhotoPicker({ label, value, onChange, pathPrefix, multiple = false }: PhotoPickerProps) {
  const [uploading, setUploading] = useState(false);

  async function pick() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo access needed", "Enable photo library access in your device settings to attach photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.6,
      allowsMultipleSelection: multiple,
    });
    if (result.canceled || result.assets.length === 0) return;

    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const asset of result.assets) {
        if (isMock()) {
          uploaded.push(asset.uri);
        } else {
          const path = `${pathPrefix}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
          uploaded.push(await uploadPhoto(path, await uriToBlob(asset.uri)));
        }
      }
      onChange(multiple ? [...value, ...uploaded] : uploaded);
    } catch {
      Alert.alert("Upload failed", "Couldn't upload that photo — check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {value.map((uri, i) => (
          <View key={uri + i} style={styles.thumbWrap}>
            <Image source={{ uri }} style={styles.thumb} />
            <Pressable onPress={() => removeAt(i)} style={styles.removeBtn}>
              <X size={11} color={colors.onDark} />
            </Pressable>
          </View>
        ))}
        {(multiple || value.length === 0) && (
          <Pressable onPress={pick} disabled={uploading} style={styles.addBtn}>
            {uploading ? (
              <ActivityIndicator size="small" color={colors.mute} />
            ) : (
              <>
                <Plus size={18} color={colors.mute} />
                <Text style={styles.addText}>Add</Text>
              </>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { ...type.bodySmStrong, color: colors.ink, marginBottom: spacing.xs },
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  thumbWrap: { width: 72, height: 72, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.canvasSoft },
  thumb: { width: "100%", height: "100%" },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  addBtn: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.hairline,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  addText: { ...type.caption, color: colors.mute },
});
