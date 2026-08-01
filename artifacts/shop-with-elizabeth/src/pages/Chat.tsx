import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";
import { useGetChatMessages, useSendChatMessage, getGetChatMessagesQueryKey } from "@workspace/api-client-react";
import { useUser } from "@/hooks/useUser";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Chat() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useGetChatMessages({
    query: { refetchInterval: 2000, queryKey: getGetChatMessagesQueryKey() },
  });

  const sendMessage = useSendChatMessage({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetChatMessagesQueryKey() });
      },
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user.id) return;
    sendMessage.mutate({ data: { userId: user.id, username: user.name, text: text.trim() } });
    setText("");
  };

  return (
    <Layout>
      <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground">Community Chat</h1>
            <p className="text-xs text-muted-foreground">Chat with other shoppers</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[300px] max-h-[60vh] pr-1 scrollbar-thin">
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No messages yet. Say hello!</p>
              </div>
            )}
            {messages.map((msg) => {
              const isOwn = msg.userId === user.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    {!isOwn && (
                      <span className="text-xs font-semibold text-muted-foreground ml-1">
                        {msg.username}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isOwn
                          ? "bg-primary text-white rounded-br-sm"
                          : "bg-card border border-border text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className={`text-[10px] text-muted-foreground px-1 ${isOwn ? "text-right" : "text-left"}`}>
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="flex gap-2 sticky bottom-0 bg-background pt-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
            className="flex-1 h-12 rounded-2xl bg-muted/40 border-border text-sm"
            autoComplete="off"
            data-testid="input-chat"
            disabled={!user.id}
          />
          <Button
            type="submit"
            size="icon"
            className="h-12 w-12 rounded-2xl bg-primary hover:bg-primary/90 text-white shrink-0"
            disabled={!text.trim() || !user.id || sendMessage.isPending}
            data-testid="button-send-chat"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </Layout>
  );
}
