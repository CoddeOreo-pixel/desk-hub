import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../stores';
import { useTranslation } from '../locales/useTranslation';
import {
  Monitor,
  AppWindow,
  Music,
  Globe,
  Terminal,
  X,
  Languages,
} from 'lucide-react';

const navKeys = [
  { id: 'apps', labelKey: 'apps', icon: AppWindow, color: 'accent' },
  { id: 'monitor', labelKey: 'monitor', icon: Monitor, color: 'accent-orange' },
  { id: 'music', labelKey: 'music', icon: Music, color: 'accent' },
  { id: 'web', labelKey: 'web', icon: Globe, color: 'accent-orange' },
  { id: 'command', labelKey: 'command', icon: Terminal, color: 'accent' },
] as const;

export default function Drawer() {
  const { activePage, setActivePage, lang, setLang } = useAppStore();
  const { msg } = useTranslation();
  const [open, setOpen] = useState(false);

  const toggleLang = () => setLang(lang === 'zh' ? 'en' : 'zh');

  useEffect(() => {
    (window as any).__deskDrawer = {
      open: () => setOpen(true),
      close: () => setOpen(false),
    };
    return () => { delete (window as any).__deskDrawer; };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  if (!open) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 animate-overlay-in"
        onClick={() => setOpen(false)}
      />
      <div className="fixed inset-0 z-50 flex">
        <div
          className="w-[280px] max-w-[80vw] h-full surface-1 grid-bg-dense flex flex-col animate-slide-in-right"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-[6px] flex items-center justify-center text-xl bg-accent/10"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '8px 8px' }}
              >
                🥳
              </div>
              <span className="font-display font-bold text-accent text-[15px]">DeskHub</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="btn-ghost !p-1.5 !rounded-lg"
            >
              <X size={18} />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navKeys.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              const colorVar = item.color === 'accent-orange' ? 'var(--accent-orange)' : 'var(--accent)';
              return (
                <button
                  key={item.id}
                  onClick={() => { setActivePage(item.id); setOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[6px] text-sm font-semibold font-mono transition-all duration-120 ${isActive ? 'border' : ''}`}
                  style={
                    isActive
                      ? {
                          color: colorVar,
                          background: item.color === 'accent-orange' ? 'var(--accent-orange-subtle)' : 'var(--accent-subtle)',
                          borderColor: colorVar,
                        }
                      : {
                          color: 'var(--content-tertiary)',
                          background: 'transparent',
                          borderColor: 'transparent',
                        }
                  }
                >
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  {msg.nav[item.labelKey]}
                </button>
              );
            })}
          </nav>

          {/* Footer: Language + version */}
          <div className="px-3 pb-4 shrink-0 border-t border-[var(--border)] pt-3 space-y-2">
            <button
              onClick={toggleLang}
              className="w-full flex items-center gap-4 px-4 py-2.5 rounded-[6px] text-sm font-mono text-content-tertiary hover:text-content-secondary transition-colors"
            >
              <Languages size={18} />
              <span>{lang === 'zh' ? 'English' : '中文'}</span>
            </button>
            <div className="text-xs text-content-tertiary font-mono px-4">
              DeskHub v1.0
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
