"use client";

import { useEffect, useRef, useState } from "react";
import { getClient } from "@taskhub/data";
import type { Message, User } from "@taskhub/shared";
import { Avatar } from "./ui/Avatar";
import { Send } from "lucide-react";

interface ChatPanelProps {
  taskId: string;
  currentUser: User;
  otherUser: User;
}

export function ChatPanel({ taskId, currentUser, otherUser }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const msgs = await getClient().getMessages(taskId);
    setMessages(msgs);
  }

  useEffect(() => {
    load();
  }, [taskId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await getClient().sendMessage({ taskId, fromUserId: currentUser.id, text: text.trim() });
    setText("");
    await load();
    setSending(false);
  }

  return (
    <div className="rounded-xl border border-black/[0.06] bg-canvas flex flex-col h-[420px]">
      <div className="px-lg py-lg border-b border-black/[0.06] flex items-center gap-md">
        <Avatar src={otherUser.photo} name={otherUser.name} size={32} />
        <span className="text-body-md-strong text-ink">{otherUser.name}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-lg py-lg flex flex-col gap-md">
        {messages.length === 0 && (
          <p className="text-body-sm text-mute text-center mt-2xl">No messages yet, say hello.</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.fromUserId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-xl px-lg py-md text-body-sm ${
                  isMe ? "bg-primary-600 text-on-dark" : "bg-canvas-soft text-ink"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex items-center gap-sm p-lg border-t border-black/[0.06]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 bg-canvas-soft rounded-pill px-lg py-md text-body-md outline-none focus:ring-2 focus:ring-ink/20"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="w-10 h-10 shrink-0 rounded-full bg-primary-600 text-on-dark flex items-center justify-center disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
