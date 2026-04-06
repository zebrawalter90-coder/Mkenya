import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/hooks/useUser";

export function UserSetup({ onDone }: { onDone?: () => void }) {
  const { user, setUsername } = useUser();
  const [nameInput, setNameInput] = useState("");
  const [open, setOpen] = useState(!user.name);

  if (user.name && !open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setUsername(nameInput.trim());
    setOpen(false);
    onDone?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="bg-card border border-border rounded-3xl p-8 max-w-sm w-full shadow-2xl"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-black text-foreground">Welcome!</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Tell us your name so others know who you are when you comment or list items.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                autoFocus
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your display name…"
                className="h-12 text-base rounded-xl bg-muted/40 border-border"
                maxLength={30}
              />
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-base"
                disabled={!nameInput.trim()}
              >
                Enter the Shop
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
