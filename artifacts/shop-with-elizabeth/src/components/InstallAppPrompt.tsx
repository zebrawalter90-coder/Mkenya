import { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InstallPromptEvent extends Event { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>; }
export function InstallAppPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    const handler = (event: Event) => { event.preventDefault(); setInstallEvent(event as InstallPromptEvent); window.setTimeout(() => setVisible(true), 1800); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  if (!visible || !installEvent) return null;
  const install = async () => { await installEvent.prompt(); await installEvent.userChoice; setVisible(false); setInstallEvent(null); };
  return <div className="fixed bottom-5 left-1/2 z-[80] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-primary/20 bg-card p-4 shadow-2xl sm:bottom-6"><div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Smartphone className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="font-black text-foreground">Install Mkenya Shop</p><button aria-label="Dismiss install prompt" onClick={() => setVisible(false)} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button></div><p className="mt-1 text-sm leading-5 text-muted-foreground">Add the shop to your home screen for faster shopping and checkout.</p><Button onClick={install} className="mt-3 h-9 rounded-lg bg-primary text-primary-foreground"><Download className="mr-2 h-4 w-4" />Install app</Button></div></div></div>;
}
