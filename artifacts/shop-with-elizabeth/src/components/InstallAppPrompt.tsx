import { useEffect, useState } from 'react';
import { Download, Share2, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_UNTIL_KEY = 'mkenya-install-dismissed-until';
const DISMISSAL_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function isInstallDismissed() {
  try {
    const dismissedUntil = Number(window.localStorage.getItem(DISMISSED_UNTIL_KEY));
    if (dismissedUntil > Date.now()) return true;
    if (dismissedUntil) window.localStorage.removeItem(DISMISSED_UNTIL_KEY);
  } catch {
    return false;
  }
  return false;
}

function dismissInstallPrompt() {
  try {
    window.localStorage.setItem(
      DISMISSED_UNTIL_KEY,
      String(Date.now() + DISMISSAL_COOLDOWN_MS),
    );
  } catch {
    // Storage may be disabled; the prompt remains dismissible for this page view.
  }
}

function clearInstallDismissal() {
  try {
    window.localStorage.removeItem(DISMISSED_UNTIL_KEY);
  } catch {
    // Ignore storage restrictions; installation itself does not depend on storage.
  }
}

function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [installMessage, setInstallMessage] = useState('');
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop');
  const [showFallback, setShowFallback] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const alreadyInstalled = isAppInstalled();
    setInstalled(alreadyInstalled);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register(`${import.meta.env.BASE_URL}sw.js`)
        .catch((error) => {
          if (import.meta.env.DEV) console.warn('Mkenya Shop offline support could not be enabled.', error);
        });
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS =
      /iphone|ipad|ipod/.test(userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const detectedPlatform = isIOS ? 'ios' : /android/.test(userAgent) ? 'android' : 'desktop';
    setPlatform(detectedPlatform);

    const beforeInstallHandler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setShowFallback(false);
      setInstallMessage('');
      if (!isInstallDismissed()) setVisible(true);
    };
    const installedHandler = () => {
      clearInstallDismissal();
      setInstalled(true);
      setVisible(false);
      setInstallEvent(null);
    };
    const openPromptHandler = () => {
      clearInstallDismissal();
      if (isAppInstalled()) {
        setInstalled(true);
        setInstallMessage('');
        setShowFallback(false);
      } else {
        setShowFallback(false);
        setInstallMessage('');
      }
      setVisible(true);
    };

    if (!alreadyInstalled) {
      window.addEventListener('beforeinstallprompt', beforeInstallHandler);
    }
    window.addEventListener('appinstalled', installedHandler);
    window.addEventListener('mkenya:show-install-prompt', openPromptHandler);

    const timer =
      !alreadyInstalled && isIOS && !isInstallDismissed()
        ? window.setTimeout(() => setVisible(true), 5000)
        : undefined;

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
      window.removeEventListener('appinstalled', installedHandler);
      window.removeEventListener('mkenya:show-install-prompt', openPromptHandler);
    };
  }, []);

  if (!visible) return null;

  const install = async () => {
    setInstallMessage('');

    if (installEvent) {
      const deferredPrompt = installEvent;
      setInstallEvent(null);

      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          clearInstallDismissal();
          setVisible(false);
          return;
        }
        dismissInstallPrompt();
        setVisible(false);
      } catch {
        setShowFallback(true);
        setInstallMessage('Your browser could not open the install prompt. Try its menu for installation options.');
      }
      return;
    }

    if (platform === 'ios' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'Mkenya Shop',
          text: 'Install Mkenya Shop on your device',
          url: window.location.href,
        });
        setInstallMessage('Choose Add to Home Screen from the share sheet.');
      } catch {
        setShowFallback(true);
      }
      return;
    }

    setShowFallback(true);
  };

  const fallbackText =
    platform === 'ios'
      ? 'In Safari, tap Share, then choose Add to Home Screen.'
      : platform === 'android'
        ? 'Open your browser menu and choose Install app or Add to Home screen.'
        : 'Open your browser menu and choose Install app or Add to Home screen.';

  const installLabel = installEvent
    ? 'Install on this device'
    : platform === 'ios'
      ? 'Add to Home Screen'
      : 'Show install steps';

  return (
    <aside
      role="status"
      aria-live="polite"
      aria-labelledby="install-mkenya-shop-title"
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+9rem)] left-4 z-[80] w-[calc(100%-2rem)] max-w-64 animate-in slide-in-from-bottom-4 fade-in duration-500 rounded-2xl border border-primary/20 bg-card/95 p-4 shadow-2xl backdrop-blur-sm sm:bottom-6 sm:left-6"
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
              onClick={() => {
                dismissInstallPrompt();
                setVisible(false);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {installed ? (
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Mkenya Shop is already installed on this device.
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">
                Keep Mkenya Shop on this device for quick access to local sellers.
              </p>
              <Button
                onClick={install}
                className="mt-3 h-10 w-full rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform hover:bg-primary/90 active:scale-[0.98]"
              >
                <Download className="mr-2 h-4 w-4" />
                {installLabel}
              </Button>
            </>
          )}
          {(showFallback || installMessage) && (
            <p
              role="alert"
              className="mt-2 flex items-start gap-2 rounded-lg bg-muted px-3 py-2 text-xs leading-4 text-muted-foreground"
            >
              <Share2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {installMessage || fallbackText}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}