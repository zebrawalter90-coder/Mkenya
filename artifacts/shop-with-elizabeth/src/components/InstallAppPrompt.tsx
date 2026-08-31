import { useEffect, useState } from 'react';
import { Download, Share2, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const ANDROID_APP_LINK = 'https://t.me/FreeProAppsGalaxy';

export function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [isIos, setIsIos] = useState(false);

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
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setVisible(false);
    setInstallEvent(null);
  };

  const fallbackText = isIos
    ? 'Tap Share, then “Add to Home Screen” to install Mkenya Shop.'
    : 'Open your browser menu and choose “Install app” or “Add to Home screen”.';

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-primary/20 bg-card p-4 shadow-2xl sm:bottom-6"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Smartphone className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-black text-foreground">Install Mkenya Shop</p>
            <button
              aria-label="Dismiss app install notification"
              onClick={() => setVisible(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">
            Keep Mkenya Shop on your phone for faster shopping and easy access to local sellers.
          </p>
          <a
            href={ANDROID_APP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex h-9 items-center rounded-lg bg-secondary px-3 text-sm font-bold text-secondary-foreground transition-colors hover:bg-secondary/90"
          >
            <Download className="mr-2 h-4 w-4" />
            Get Android app on Telegram
          </a>
          {installEvent ? (
            <Button
              onClick={install}
              className="mt-2 h-9 rounded-lg bg-primary text-primary-foreground"
            >
              <Download className="mr-2 h-4 w-4" />
              Install app
            </Button>
          ) : (
            <p className="mt-3 flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs leading-4 text-muted-foreground">
              <Share2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {fallbackText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}