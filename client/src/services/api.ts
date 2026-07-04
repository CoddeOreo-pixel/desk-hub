import type {
  AppConfig,
  WebsiteConfig,
  CommandConfig,
  PresetCommand,
  SystemInfo,
  LocalTrack,
  MusicIndexStatus,
} from '../../../shared/types/index';

const API_BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

interface ApiResult {
  success: boolean;
  error?: string;
}

interface AppApiResult extends ApiResult {
  name: string;
}

interface StartResult {
  started: boolean;
  name: string;
}

interface ScanResult {
  success: boolean;
  count: number;
}

// 应用相关
export const appApi = {
  getList: () => request<AppConfig[]>('/apps'),
  launch: (appName: string) => request<AppApiResult>('/apps/launch', {
    method: 'POST',
    body: JSON.stringify({ appName }),
  }),
  add: (app: { name: string; path: string; icon?: string }) => request<ApiResult & { app: AppConfig }>('/config/apps', {
    method: 'POST',
    body: JSON.stringify(app),
  }),
  updateAll: (apps: AppConfig[]) => request<ApiResult & { apps: AppConfig[] }>('/config/apps', {
    method: 'PUT',
    body: JSON.stringify(apps),
  }),
  remove: (name: string) => request<ApiResult>(`/config/apps/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  }),
};

// 网页相关
export const webApi = {
  getBookmarks: () => request<WebsiteConfig[]>('/web/bookmarks'),
  open: (url: string) => request<{ success: boolean; error?: string }>('/web/open', {
    method: 'POST',
    body: JSON.stringify({ url }),
  }),
  add: (site: { name: string; url: string; icon?: string }) => request<ApiResult & { site: WebsiteConfig }>('/config/websites', {
    method: 'POST',
    body: JSON.stringify(site),
  }),
  updateAll: (websites: WebsiteConfig[]) => request<ApiResult & { websites: WebsiteConfig[] }>('/config/websites', {
    method: 'PUT',
    body: JSON.stringify(websites),
  }),
  remove: (name: string) => request<ApiResult>(`/config/websites/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  }),
};

// 命令相关
export const commandApi = {
  getList: () => request<{ presets: PresetCommand[]; custom: CommandConfig[] }>('/commands'),
  execute: (name: string, cmd?: string) => request<StartResult>('/commands/execute', {
    method: 'POST',
    body: JSON.stringify({ name, cmd }),
  }),
  updateCustom: (commands: CommandConfig[]) => request<ApiResult & { commands: CommandConfig[] }>('/config/commands/custom', {
    method: 'PUT',
    body: JSON.stringify(commands),
  }),
};

// 系统相关
export const systemApi = {
  getInfo: () => request<SystemInfo>('/system/info'),
  uploadApp: async (file: File): Promise<{ path: string }> => {
    const response = await fetch(`${API_BASE}/apps/upload`, {
      method: 'POST',
      headers: { 'Content-Disposition': `filename=${encodeURIComponent(file.name)}` },
      body: file,
    });
    if (!response.ok) throw new Error('Upload failed');
    return response.json();
  },
};

// 音乐相关
export const musicApi = {
  scan: () => request<ScanResult>('/music/scan', { method: 'POST' }),
  getIndexStatus: () => request<MusicIndexStatus>('/music/status'),
  search: (keyword: string, limit = 50) => request<LocalTrack[]>(`/music/search?keyword=${encodeURIComponent(keyword)}&limit=${limit}`),
  open: (path: string) => request<{ success: boolean; error?: string }>('/music/open', {
    method: 'POST',
    body: JSON.stringify({ path }),
  }),
};
