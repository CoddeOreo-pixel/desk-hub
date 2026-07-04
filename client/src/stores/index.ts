import { create } from 'zustand';
import type {
  SystemInfo,
  AppConfig,
  WebsiteConfig,
  PresetCommand,
  CommandConfig,
  LocalTrack,
  MusicIndexStatus,
} from '../../../shared/types/index';
import type { Lang } from '../locales';

const LANG_KEY = 'deskhub-lang';

function loadLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch {}
  return 'zh';
}

interface AppState {
  // 语言
  lang: Lang;
  setLang: (lang: Lang) => void;

  // 导航
  activePage: string;
  setActivePage: (page: string) => void;

  // 系统信息
  systemInfo: SystemInfo | null;
  setSystemInfo: (info: SystemInfo) => void;

  // 应用
  apps: AppConfig[];
  setApps: (apps: AppConfig[]) => void;

  // 网页
  websites: WebsiteConfig[];
  setWebsites: (websites: WebsiteConfig[]) => void;

  // 命令
  presetCommands: PresetCommand[];
  customCommands: CommandConfig[];
  setCommands: (presets: PresetCommand[], custom: CommandConfig[]) => void;
  commandOutput: string;
  appendCommandOutput: (output: string) => void;
  clearCommandOutput: () => void;

  // 音乐
  musicSearchResults: LocalTrack[];
  musicIndexStatus: MusicIndexStatus;
  setMusicSearchResults: (results: LocalTrack[]) => void;
  setMusicIndexStatus: (status: MusicIndexStatus) => void;

  // 连接状态
  wsConnected: boolean;
  setWsConnected: (connected: boolean) => void;

  // Toast
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 语言
  lang: loadLang(),
  setLang: (lang) => {
    try { localStorage.setItem(LANG_KEY, lang); } catch {}
    set({ lang });
  },

  // 导航
  activePage: 'apps',
  setActivePage: (page) => set({ activePage: page }),

  // 系统信息
  systemInfo: null,
  setSystemInfo: (info) => set({ systemInfo: info }),

  // 应用
  apps: [],
  setApps: (apps) => set({ apps }),

  // 网页
  websites: [],
  setWebsites: (websites) => set({ websites }),

  // 命令
  presetCommands: [],
  customCommands: [],
  setCommands: (presets, custom) => set({ presetCommands: presets, customCommands: custom }),
  commandOutput: '',
  appendCommandOutput: (output) => set((state) => ({ commandOutput: state.commandOutput + output })),
  clearCommandOutput: () => set({ commandOutput: '' }),

  // 音乐
  musicSearchResults: [],
  musicIndexStatus: { ready: false, count: 0, scanning: false },
  setMusicSearchResults: (results) => set({ musicSearchResults: results }),
  setMusicIndexStatus: (status) => set({ musicIndexStatus: status }),

  // 连接状态
  wsConnected: false,
  setWsConnected: (connected) => set({ wsConnected: connected }),

  // Toast
  toasts: [],
  addToast: (message, type = 'info') => {
    const id = Date.now().toString();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
