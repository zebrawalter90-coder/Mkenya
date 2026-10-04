import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Users, ShieldCheck } from "lucide-react";
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

  const { data: messages = [], isLoading, isError } = useGetChatMessages({
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
    bottomRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user.id) return;
    sendMessage.mutate({ data: { userId: user.id, username: user.name, text: text.trim() } });
    setText("");
  };

  return (
    <Layout>
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-7 sm:px-6 sm:py-10">
        <div className="market-grid relative mb-6 overflow-hidden rounded-[1.6rem] bg-secondary p-6 text-secondary-foreground shadow-editorial sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-16 h-56 w-56 rounded-full border-[26px] border-secondary-foreground/5" />
          <div className="relative flex flex-wrap items-end justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="mb-2 font-mono-ui text-[10px] font-bold uppercase tracking-[0.2em] text-accent">The maker's corner</p>
                <h1 className="font-display text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">Community chat</h1>
                <p className="mt-2 text-sm text-secondary-foreground/75">Talk shop with the people finding and making good things.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-secondary-foreground/15 bg-secondary-foreground/5 px-3 py-2 text-xs font-semibold">
              <Users className="h-4 w-4 text-accent" /> Shared space
            </div>
          </div>
        </div>

        <section className="paper-panel flex min-h-[460px] flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-border/75">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 sm:px-7">
            <div>
              <p className="font-display text-xl font-bold">Today at the shop</p>
              <p className="mt-1 text-xs text-muted-foreground">Questions, recommendations, and new finds.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
              <span className="h-2 w-2 rounded-full bg-secondary" /> Live
            </div>
          </div>
          <div className="market-grid flex-1 overflow-y-auto space-y-4 px-4 py-5 sm:px-7 sm:py-7 min-h-[300px] max-h-[60vh] scrollbar-thin">
          {isLoading ? (
            <div className="space-y-4" aria-label="Loading community messages">
              {[0, 1, 2].map((item) => <div key={item} className={`h-14 animate-pulse rounded-2xl bg-muted/70 ${item === 1 ? "ml-auto w-2/3" : "w-3/4"}`} />)}
            </div>
          ) : isError ? (
            <div className="grid h-full min-h-64 place-items-center text-center">
              <div><MessageCircle className="mx-auto mb-3 h-10 w-10 text-primary/60" /><p className="font-display text-2xl font-bold">Chat is taking a breather.</p><p className="mt-2 text-sm text-muted-foreground">Messages will show here as soon as we reconnect.</p></div>
            </div>
          ) : (
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <div className="grid min-h-64 place-items-center text-center text-muted-foreground">
                <div className="max-w-xs">
                  <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent/35 text-secondary"><MessageCircle className="h-6 w-6" /></div>
                  <p className="font-display text-2xl font-bold text-foreground">Pull up a seat.</p>
                  <p className="mt-2 text-sm">Be the first to share a recommendation or welcome a new maker.</p>
                </div>
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
                  <div className={`flex max-w-[82%] flex-col gap-1 sm:max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                    {!isOwn && (
                      <span className="ml-1 text-xs font-semibold text-muted-foreground">
                        {msg.username}
                      </span>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                        isOwn
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md border border-border/70 bg-card text-foreground"
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
          )}
          <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSend} className="border-t border-border/70 bg-card/85 p-4 sm:p-5">
            {!user.id && <p className="mb-2 text-xs text-muted-foreground">A shopper profile is needed to join the conversation.</p>}
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-background p-1.5 pl-4 shadow-sm focus-within:border-primary/70">
              <ShieldCheck className="h-4 w-4 shrink-0 text-secondary" />
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Share a thought with the community…"
                className="h-11 flex-1 border-0 bg-transparent px-1 text-sm shadow-none focus-visible:ring-0"
                autoComplete="off"
                data-testid="input-chat"
                disabled={!user.id}
                aria-label="Write a community message"
              />
              <Button
                type="submit"
                className="h-11 shrink-0 gap-2 rounded-xl bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90"
                disabled={!text.trim() || !user.id || sendMessage.isPending}
                data-testid="button-send-chat"
                aria-label="Send message"
              >
                <span className="hidden sm:inline">{sendMessage.isPending ? "Sending" : "Send"}</span><Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </section>
      </div>
    </Layout>
  );
}
