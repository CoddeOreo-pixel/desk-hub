import fs from 'fs';
import path from 'path';
import type { DeskHubConfig } from '../../../shared/types/index';

const CONFIG_PATH = path.resolve(process.cwd(), '..', 'config.json');

let config: DeskHubConfig | null = null;

export function loadConfig(): DeskHubConfig {
  if (config) return config;

  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    config = JSON.parse(raw) as DeskHubConfig;
    return config;
  } catch (err) {
    console.error('Failed to load config.json:', err);
    throw new Error('Configuration file not found or invalid');
  }
}

export function getConfig(): DeskHubConfig {
  return loadConfig();
}

export function reloadConfig(): DeskHubConfig {
  config = null;
  return loadConfig();
}

export function saveConfig(newConfig: DeskHubConfig): DeskHubConfig {
  const json = JSON.stringify(newConfig, null, 2);
  fs.writeFileSync(CONFIG_PATH, json, 'utf-8');
  config = newConfig;
  return config;
}

// 监听配置文件变化，自动热重载
// 同时处理 change 和 rename 事件：大多数编辑器采用"写临时文件+重命名"的原子写，
// 触发的是 rename 而非 change
export function watchConfig(onChange: (newConfig: DeskHubConfig) => void): void {
  let debounceTimer: NodeJS.Timeout | null = null;
  fs.watch(CONFIG_PATH, () => {
    // 防抖：编辑器可能触发多次事件
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      try {
        const newConfig = reloadConfig();
        console.log('[Config] Configuration reloaded');
        onChange(newConfig);
      } catch {
        console.error('[Config] Failed to reload configuration');
      }
    }, 300);
  });
}
