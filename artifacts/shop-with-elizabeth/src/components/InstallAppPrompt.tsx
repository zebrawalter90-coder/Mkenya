import { useEffect, useState } from 'react';
import { Download, Share2, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

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

    setIsIos(/iphone|ipad|ipod/i.test(navigator.userAgent));

    // Deliberately do not persist dismissal: visitors should see the install
    // reminder again the next time they visit until the site is installed.
    const timer = window.setTimeout(() => setVisible(true), 1400);
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  if (!visible) return null;

  const install = async () => {
    if (!installEvent) {
      setShowInstructions(true);
      return;
    }

    try {
      await installEvent.prompt();
      await installEvent.userChoice;
      setVisible(false);
      setInstallEvent(null);
    } catch {
      setShowInstructions(true);
    }
  };

  const fallbackText = isIos
    ? 'Tap Share, then “Add to Home Screen” to install Mkenya Shop.'
    : 'Open your browser menu and choose “Install app” or “Add to Home screen”.';

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
          {installEvent ? (
            <Button
              onClick={install}
              className="mt-3 h-10 w-full rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform hover:bg-primary/90 active:scale-[0.98] sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Install app
            </Button>
          ) : (
            <>
              <Button
                type="button"
                onClick={install}
                variant="outline"
                className="mt-3 h-10 w-full rounded-lg border-primary/30 text-foreground transition-transform active:scale-[0.98] sm:w-auto"
              >
                <Download className="mr-2 h-4 w-4" />
                Show install steps
              </Button>
              {showInstructions && (
                <p className="mt-2 flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs leading-4 text-muted-foreground">
                  <Share2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {fallbackText}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}