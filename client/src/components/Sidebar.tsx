import {
  Monitor,
  AppWindow,
  Music,
  Globe,
  Terminal,
  Wifi,
  WifiOff,
  Languages,
} from 'lucide-react';
import { useAppStore } from '../stores';
import { useTranslation } from '../locales/useTranslation';

const navKeys = [
  { id: 'apps', labelKey: 'apps', icon: AppWindow, color: 'accent' },
  { id: 'monitor', labelKey: 'monitor', icon: Monitor, color: 'accent-orange' },
  { id: 'music', labelKey: 'music', icon: Music, color: 'accent' },
  { id: 'web', labelKey: 'web', icon: Globe, color: 'accent-orange' },
  { id: 'command', labelKey: 'command', icon: Terminal, color: 'accent' },
] as const;

export default function Sidebar() {
  const { activePage, setActivePage, wsConnected, lang, setLang } = useAppStore();
  const { msg } = useTranslation();

  const toggleLang = () => setLang(lang === 'zh' ? 'en' : 'zh');

  return (
    <aside className="flex flex-col w-[72px] lg:w-[220px] shrink-0 surface-1 grid-bg-dense h-screen">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0">
        <div className="w-9 h-9 rounded-[6px] flex items-center justify-center shrink-0 text-xl bg-accent/10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)', backgroundSize: '8px 8px' }}>
          🥳
        </div>
        <div className="hidden lg:block">
          <span className="font-display font-bold text-accent text-[15px] tracking-tight">DeskHub</span>
        </div>
      </div>

      <hr className="divider mx-3" />

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navKeys.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const colorVar = item.color === 'accent-orange' ? 'var(--accent-orange)' : 'var(--accent)';
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={isActive ? 'nav-item-active w-full' : 'nav-item w-full'}
              style={isActive ? { color: colorVar, borderColor: colorVar, background: item.color === 'accent-orange' ? 'var(--accent-orange-subtle)' : 'var(--accent-subtle)' } : undefined}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              <span className="hidden lg:block">{msg.nav[item.labelKey]}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom: Language toggle + Connection status */}
      <div className="px-2 pb-3 space-y-1">
        <button
          onClick={toggleLang}
          className="nav-item w-full"
          title={msg.app.langSwitch}
        >
          <Languages size={18} strokeWidth={1.8} />
          <span className="hidden lg:block text-xs font-mono">{lang === 'zh' ? 'EN' : '中文'}</span>
        </button>
        <div className="flex items-center gap-3 px-4 py-2.5">
          {wsConnected ? (
            <Wifi size={16} className="text-success shrink-0" />
          ) : (
            <WifiOff size={16} className="text-danger shrink-0" />
          )}
          <span className={`hidden lg:block text-xs font-mono ${wsConnected ? 'text-success' : 'text-danger'}`}>
            {wsConnected ? msg.conn.connected : msg.conn.disconnected}
          </span>
        </div>
      </div>
    </aside>
  );
}
