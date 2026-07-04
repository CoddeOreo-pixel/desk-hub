// WebSocket 消息类型
export type WsMessageType =
  | 'music:status'
  | 'music:search-result'
  | 'command:output'
  | 'app:launch-result'
  | 'web:open-result'
  | 'error';

export interface WsMessage<T = unknown> {
  type: WsMessageType;
  data: T;
}

// 系统信息相关类型
export interface SystemInfo {
  os: string;
  hostname: string;
  cpuModel: string;
  totalMemory: number;
  uptime: number;
  gpu?: string;
  disks?: { name: string; total: number; fsType: string }[];
  networks?: { iface: string; ip4: string }[];
}

// 应用相关类型
export interface AppConfig {
  name: string;
  path: string;
  icon?: string;
}

export interface AppLaunchResult {
  name: string;
  success: boolean;
  error?: string;
}

// 网页相关类型
export interface WebsiteConfig {
  name: string;
  url: string;
  icon?: string;
}

// 命令相关类型
export interface CommandConfig {
  name: string;
  cmd: string;
  dangerous?: boolean;
}

export interface PresetCommand {
  key: string;
  name: string;
  cmd: string;
  dangerous: boolean;
}

export interface CommandExecutePayload {
  name: string;
  cmd?: string;
}

export interface CommandOutput {
  name: string;
  output: string;
  error?: string;
}

// 音乐相关类型
export interface LocalTrack {
  name: string;
  path: string;
  ext: string;
  size: number;
  dir: string;
}

export interface MusicIndexStatus {
  ready: boolean;
  count: number;
  scanning: boolean;
}

export interface MusicSearchResult {
  id: number;
  name: string;
  artist: string;
  album: string;
  duration: number;
}

export interface MusicPlayPayload {
  songId: number;
}

export interface MusicControlPayload {
  action: 'play' | 'pause' | 'prev' | 'next' | 'volume';
  volume?: number;
}

export interface MusicStatus {
  playing: boolean;
  currentSong: MusicSearchResult | null;
  progress: number;
  duration: number;
  volume: number;
}

// 配置文件类型
export interface DeskHubConfig {
  server: {
    port: number;
  };
  apps: AppConfig[];
  websites: WebsiteConfig[];
  commands: {
    presets: string[];
    custom: CommandConfig[];
  };
  music: {
    defaultLimit: number;
  };
}
