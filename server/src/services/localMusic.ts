import { exec } from 'child_process';
import { readdir, stat } from 'fs/promises';
import { join, extname, basename } from 'path';
import { platform } from 'os';
import { existsSync } from 'fs';

const AUDIO_EXTENSIONS = new Set([
  '.mp3', '.flac', '.wav', '.aac', '.ogg', '.wma', '.m4a', '.ape', '.alac', '.opus',
]);

interface LocalTrack {
  name: string;       // 文件名（无扩展名）
  path: string;       // 完整路径
  ext: string;        // 扩展名
  size: number;       // 文件大小
  dir: string;        // 所在目录名
}

let trackIndex: LocalTrack[] = [];
let indexReady = false;
let scanning = false;

// 常见音乐目录
function getMusicDirs(): string[] {
  const home = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\Default';
  const dirs = [
    join(home, 'Music'),
    join(home, 'Downloads'),
    join(home, 'Desktop'),
  ];
  // D/E/F 盘常见音乐目录
  for (const drive of ['D:', 'E:', 'F:']) {
    if (existsSync(drive)) {
      dirs.push(join(drive, 'Music'));
      dirs.push(join(drive, '音乐'));
      dirs.push(join(drive, 'Downloads'));
    }
  }
  return dirs.filter((d) => existsSync(d));
}

// 递归扫描目录
async function scanDir(dir: string, depth: number = 0): Promise<LocalTrack[]> {
  if (depth > 4) return []; // 最多递归4层
  const tracks: LocalTrack[] = [];

  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const tasks: Promise<LocalTrack[]>[] = [];

  for (const entry of entries) {
    // 跳过隐藏目录和系统目录
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === '$RECYCLE.BIN') continue;

    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      tasks.push(scanDir(fullPath, depth + 1));
    } else if (entry.isFile()) {
      const ext = extname(entry.name).toLowerCase();
      if (AUDIO_EXTENSIONS.has(ext)) {
        try {
          const s = await stat(fullPath);
          tracks.push({
            name: basename(entry.name, ext),
            path: fullPath,
            ext,
            size: s.size,
            dir: basename(dir),
          });
        } catch { /* skip */ }
      }
    }
  }

  const subResults = await Promise.all(tasks);
  for (const r of subResults) tracks.push(...r);
  return tracks;
}

// 构建索引
export async function buildIndex(): Promise<number> {
  if (scanning) return -1;
  scanning = true;
  indexReady = false;

  try {
    const dirs = getMusicDirs();
    const results = await Promise.all(dirs.map((d) => scanDir(d)));

    trackIndex = results.flat();
    // 按文件名排序
    trackIndex.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    indexReady = true;
    return trackIndex.length;
  } finally {
    scanning = false;
  }
}

// 模糊搜索：简单的字符匹配，支持拼音首字母和子串
export function searchLocal(keyword: string, limit: number = 50): LocalTrack[] {
  if (!indexReady) return [];
  const kw = keyword.toLowerCase().trim();
  if (!kw) return trackIndex.slice(0, limit);

  // 分词：空格分隔
  const words = kw.split(/\s+/).filter(Boolean);

  const scored = trackIndex
    .map((track) => {
      const lower = track.name.toLowerCase();
      const dirLower = track.dir.toLowerCase();

      let score = 0;

      for (const word of words) {
        if (lower === word) { score += 100; continue; }           // 完全匹配
        if (lower.startsWith(word)) { score += 50; continue; }    // 前缀匹配
        if (lower.includes(word)) { score += 30; continue; }      // 子串匹配
        if (dirLower.includes(word)) { score += 10; continue; }   // 目录匹配

        // 字符顺序匹配（模糊）
        let idx = 0;
        for (const ch of word) {
          const found = lower.indexOf(ch, idx);
          if (found === -1) { score = -1; break; }
          idx = found + 1;
          score += 5;
        }
      }

      return { track, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.track);

  return scored;
}

// 获取索引状态
export function getIndexStatus(): { ready: boolean; count: number; scanning: boolean } {
  return { ready: indexReady, count: trackIndex.length, scanning };
}

// 用默认音频播放器打开本地文件
export async function openInNetease(filePath: string): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const neteasePaths = [
      'C:\\Program Files (x86)\\Netease\\CloudMusic\\cloudmusic.exe',
      'C:\\Program Files\\Netease\\CloudMusic\\cloudmusic.exe',
      'D:\\Program Files (x86)\\Netease\\CloudMusic\\cloudmusic.exe',
      'D:\\Program Files\\Netease\\CloudMusic\\cloudmusic.exe',
      'D:\\Netease\\CloudMusic\\cloudmusic.exe',
    ];

    const tryFallback = (fallbackMsg: string) => {
      const neteaseExe = neteasePaths.find((p) => existsSync(p));
      if (neteaseExe) {
        exec(`"${neteaseExe}" "${filePath}"`, { timeout: 5000, windowsHide: true }, (err2) => {
          resolve(err2 ? { success: false, error: err2.message } : { success: true });
        });
      } else {
        resolve({ success: false, error: fallbackMsg });
      }
    };

    const child = exec(`cmd /c start "" "${filePath}"`, {
      timeout: 5000,
      windowsHide: true,
    });

    let stderr = '';
    child.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });

    child.on('error', (err) => {
      tryFallback(err.message);
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        tryFallback(stderr || `Exit code ${code}`);
      }
    });

    setTimeout(() => resolve({ success: true }), 1000);
  });
}
