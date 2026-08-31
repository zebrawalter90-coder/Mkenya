import { useEffect, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone;

    if (isStandalone) return;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`)
        .catch(() => undefined);
    }

    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (!visible) return null;

  const install = async () => {
    if (!installEvent) return;

    try {
      await installEvent.prompt();
      await installEvent.userChoice;
      setVisible(false);
      setInstallEvent(null);
    } catch {}
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-labelledby="install-mkenya-shop-title"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+1.25rem)] left-1/2 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-500 rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-2xl backdrop-blur-sm sm:bottom-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p id="install-mkenya-shop-title" className="font-black text-foreground">
              Install Mkenya Shop
            </p>
            <button
              type="button"
              aria-label="Dismiss app install notification"
              onClick={() => setVisible(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Keep Mkenya Shop on your phone for faster shopping and easy access to local sellers.
          </p>
          <Button
            onClick={install}
            className="mt-3 h-10 w-full rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform hover:bg-primary/90 active:scale-[0.98] sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            Install app
          </Button>
        </div>
      </div>
    </div>
  );
}