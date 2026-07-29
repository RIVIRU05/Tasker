import { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { Send } from "lucide-react-native";
import { getClient } from "@taskhub/data";
import type { Message, User } from "@taskhub/shared";
import { colors, radius, spacing, type } from "../theme";

export function ChatBox({ taskId, currentUser, otherUser }: { taskId: string; currentUser: User; otherUser: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    getClient().getMessages(taskId).then(setMessages);
  }, [taskId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSend() {
    if (!text.trim()) return;
    setSending(true);
    await getClient().sendMessage({ taskId, fromUserId: currentUser.id, text: text.trim() });
    setText("");
    await load();
    setSending(false);
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.header}>Messages with {otherUser.name}</Text>
      <View style={styles.messages}>
        {messages.length === 0 && <Text style={styles.empty}>No messages yet, say hello.</Text>}
        {messages.map((msg) => {
          const isMe = msg.fromUserId === currentUser.id;
          return (
            <View key={msg.id} style={[styles.bubbleRow, { justifyContent: isMe ? "flex-end" : "flex-start" }]}>
              <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                <Text style={[styles.bubbleText, isMe && { color: colors.onDark }]}>{msg.text}</Text>
              </View>
            </View>
          );
        })}
      </View>
      <View style={styles.inputRow}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Type a message…"
          placeholderTextColor={colors.mute}
          style={styles.input}
        />
        <Pressable onPress={handleSend} disabled={sending || !text.trim()} style={styles.sendBtn}>
          <Send size={16} color={colors.onDark} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: colors.canvas, borderRadius: radius.lg, borderWidth: 1, borderColor: "rgba(0,0,0,0.06)", overflow: "hidden" },
  header: { ...type.bodyMdStrong, color: colors.ink, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" },
  messages: { padding: spacing.lg, gap: spacing.sm, minHeight: 120 },
  empty: { ...type.bodySm, color: colors.mute, textAlign: "center", marginTop: spacing.lg },
  bubbleRow: { flexDirection: "row" },
  bubble: { maxWidth: "75%", borderRadius: radius.lg, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  bubbleMe: { backgroundColor: colors.primary },
  bubbleThem: { backgroundColor: colors.canvasSoft },
  bubbleText: { ...type.bodySm, color: colors.ink },
  inputRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, padding: spacing.lg, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
  input: { flex: 1, backgroundColor: colors.canvasSoft, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, color: colors.ink },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
});
