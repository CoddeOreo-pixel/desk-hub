import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { getConfig, saveConfig } from '../config/index.js';
import { launchApp } from '../services/appLauncher.js';
import { getPresetCommands, executeCommand, PRESET_COMMANDS } from '../services/commandExec.js';
import { openUrl } from '../services/webOpener.js';
import { getSystemInfo } from '../services/systemMonitor.js';
import { searchSongs, playSong, getMusicStatus, stopPlayback, playPrev, playNext } from '../services/musicPlayer.js';
import { buildIndex, searchLocal, getIndexStatus, openInNetease } from '../services/localMusic.js';
import type { AppConfig, WebsiteConfig, CommandConfig } from '../../../shared/types/index';

const router = Router();

// 应用相关路由
router.get('/apps', (_req, res) => {
  const config = getConfig();
  res.json(config.apps);
});

router.post('/apps/launch', async (req, res) => {
  const { appName } = req.body as { appName: string };
  const config = getConfig();
  const app = config.apps.find((a) => a.name === appName);

  if (!app) {
    res.status(404).json({ error: `App "${appName}" not found` });
    return;
  }

  const result = await launchApp(app);
  res.json(result);
});

// 网页相关路由
router.get('/web/bookmarks', (_req, res) => {
  const config = getConfig();
  res.json(config.websites);
});

router.post('/web/open', async (req, res) => {
  const { url } = req.body as { url: string };
  if (!url) {
    res.status(400).json({ error: 'URL is required' });
    return;
  }
  const result = await openUrl(url);
  res.json(result);
});

// 命令相关路由
router.get('/commands', (_req, res) => {
  const config = getConfig();
  const presets = getPresetCommands(config.commands.presets);
  res.json({ presets, custom: config.commands.custom });
});

router.post('/commands/execute', (req, res) => {
  const { name, cmd } = req.body as { name: string; cmd?: string };

  // 查找预设命令
  const preset = PRESET_COMMANDS[name];
  const commandToRun = cmd || preset?.cmd;

  if (!commandToRun) {
    res.status(400).json({ error: 'No command specified' });
    return;
  }

  // 立即返回，命令输出通过 WebSocket 推送
  res.json({ started: true, name });

  executeCommand(
    commandToRun,
    (output) => {
      // 输出通过 WebSocket 广播
      broadcastToAll({ type: 'command:output', data: { name, output } });
    },
    (error) => {
      broadcastToAll({ type: 'command:output', data: { name, output: '', error } });
    },
    (code) => {
      broadcastToAll({ type: 'command:output', data: { name, output: `Process exited with code ${code}` } });
    }
  );
});

// 系统信息路由
router.get('/system/info', async (_req, res) => {
  const info = await getSystemInfo();
  res.json(info);
});

// 音乐相关路由
// 扫描本地音乐
router.post('/music/scan', async (_req, res) => {
  const count = await buildIndex();
  res.json({ success: true, count });
});

// 获取索引状态
router.get('/music/status', (_req, res) => {
  res.json(getIndexStatus());
});

// 本地音乐搜索
router.get('/music/search', (req, res) => {
  const keyword = req.query.keyword as string || '';
  const limit = parseInt(req.query.limit as string) || 50;
  const results = searchLocal(keyword, limit);
  res.json(results);
});

// 用网易云音乐打开本地文件
router.post('/music/open', async (req, res) => {
  const { path } = req.body as { path: string };
  if (!path) {
    res.status(400).json({ error: 'Path is required' });
    return;
  }
  const result = await openInNetease(path);
  res.json(result);
});

// ─── 配置管理路由 ───

// 更新应用列表
router.put('/config/apps', (req, res) => {
  const apps = req.body as AppConfig[];
  if (!Array.isArray(apps)) {
    res.status(400).json({ error: 'apps must be an array' });
    return;
  }
  const config = getConfig();
  config.apps = apps;
  saveConfig(config);
  broadcastToAll({ type: 'system:info' as any, data: { message: 'Apps config updated' } });
  res.json({ success: true, apps });
});

// 添加单个应用
router.post('/config/apps', (req, res) => {
  const app = req.body as AppConfig;
  if (!app.name || !app.path) {
    res.status(400).json({ error: 'name and path are required' });
    return;
  }
  const config = getConfig();
  config.apps.push(app);
  saveConfig(config);
  broadcastToAll({ type: 'system:info' as any, data: { message: 'App added' } });
  res.json({ success: true, app });
});

// 删除单个应用
router.delete('/config/apps/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const config = getConfig();
  config.apps = config.apps.filter((a) => a.name !== name);
  saveConfig(config);
  broadcastToAll({ type: 'system:info' as any, data: { message: 'App removed' } });
  res.json({ success: true });
});

// 更新网页列表
router.put('/config/websites', (req, res) => {
  const websites = req.body as WebsiteConfig[];
  if (!Array.isArray(websites)) {
    res.status(400).json({ error: 'websites must be an array' });
    return;
  }
  const config = getConfig();
  config.websites = websites;
  saveConfig(config);
  broadcastToAll({ type: 'system:info' as any, data: { message: 'Websites config updated' } });
  res.json({ success: true, websites });
});

// 添加单个网页
router.post('/config/websites', (req, res) => {
  const site = req.body as WebsiteConfig;
  if (!site.name || !site.url) {
    res.status(400).json({ error: 'name and url are required' });
    return;
  }
  const config = getConfig();
  config.websites.push(site);
  saveConfig(config);
  broadcastToAll({ type: 'system:info' as any, data: { message: 'Website added' } });
  res.json({ success: true, site });
});

// 删除单个网页
router.delete('/config/websites/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const config = getConfig();
  config.websites = config.websites.filter((w) => w.name !== name);
  saveConfig(config);
  broadcastToAll({ type: 'system:info' as any, data: { message: 'Website removed' } });
  res.json({ success: true });
});

// 更新自定义命令
router.put('/config/commands/custom', (req, res) => {
  const commands = req.body as CommandConfig[];
  if (!Array.isArray(commands)) {
    res.status(400).json({ error: 'commands must be an array' });
    return;
  }
  const config = getConfig();
  config.commands.custom = commands;
  saveConfig(config);
  broadcastToAll({ type: 'system:info' as any, data: { message: 'Commands config updated' } });
  res.json({ success: true, commands });
});

// 上传快捷方式/程序文件，保存到 data/shortcuts/ 并返回路径
router.post('/apps/upload', async (req, res) => {
  const chunks: Buffer[] = [];
  req.on('data', (chunk: Buffer) => chunks.push(chunk));
  req.on('end', () => {
    const buffer = Buffer.concat(chunks);

    // 从 header 中获取文件名
    const contentDisposition = req.headers['content-disposition'] as string || '';
    let filename = 'app.exe';
    const match = contentDisposition.match(/filename="?(.+?)"?$/);
    if (match) filename = decodeURIComponent(match[1]);

    // 防止路径遍历：只取文件名，剥离任何路径前缀
    filename = path.basename(filename);

    // 保存到 data/shortcuts/
    const shortcutsDir = path.join(process.cwd(), '..', 'data', 'shortcuts');
    if (!fs.existsSync(shortcutsDir)) fs.mkdirSync(shortcutsDir, { recursive: true });

    const filePath = path.join(shortcutsDir, filename);
    fs.writeFileSync(filePath, buffer);

    res.json({ path: filePath });
  });
  req.on('error', () => res.json({ path: '' }));
});

export default router;

// WebSocket 广播函数，由 ws 模块设置
let broadcastFn: ((msg: any) => void) | null = null;

export function setBroadcastFn(fn: (msg: any) => void): void {
  broadcastFn = fn;
}

function broadcastToAll(msg: any): void {
  if (broadcastFn) {
    broadcastFn(msg);
  }
}
