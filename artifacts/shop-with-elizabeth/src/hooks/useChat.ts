import { useState, useEffect, useCallback } from "react";

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

const CHAT_KEY = "elizabeth_chat";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const load = useCallback(() => {
    const stored = localStorage.getItem(CHAT_KEY);
    if (stored) {
      try {
        setMessages(JSON.parse(stored));
      } catch {}
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 2000);
    return () => clearInterval(interval);
  }, [load]);

  const sendMessage = (userId: string, username: string, text: string) => {
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      userId,
      username,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    const stored = localStorage.getItem(CHAT_KEY);
    let existing: ChatMessage[] = [];
    try {
      existing = stored ? JSON.parse(stored) : [];
    } catch {}
    const updated = [...existing, msg];
    localStorage.setItem(CHAT_KEY, JSON.stringify(updated));
    setMessages(updated);
  };

  return { messages, sendMessage };
}
