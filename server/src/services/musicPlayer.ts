import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import type { MusicSearchResult, MusicStatus } from '../../../shared/types/index';

const execAsync = promisify(exec);

// 网易云音乐 API 基础地址
// 需要用户自行部署网易云 API 服务（如 UnblockNeteaseMusic 或 NeteaseCloudMusicApi）
// 通过 NETEASE_API_URL 环境变量配置，默认 http://localhost:3001
// 注意：不要设为 DeskHub 自身的端口（3000），会冲突
const NETEASE_API_BASE = process.env.NETEASE_API_URL || 'http://localhost:3001';

let currentProcess: ReturnType<typeof spawn> | null = null;
let currentStatus: MusicStatus = {
  playing: false,
  currentSong: null,
  progress: 0,
  duration: 0,
  volume: 100,
};

let playHistory: MusicSearchResult[] = [];
let historyIndex = -1;

export async function searchSongs(keyword: string, limit: number = 20): Promise<MusicSearchResult[]> {
  try {
    const url = `${NETEASE_API_BASE}/search?keywords=${encodeURIComponent(keyword)}&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data?.result?.songs) {
      return data.result.songs.map((song: any) => ({
        id: song.id,
        name: song.name,
        artist: song.artists?.map((a: any) => a.name).join(', ') || '未知',
        album: song.album?.name || '未知',
        duration: song.duration || 0,
      }));
    }
    return [];
  } catch (error) {
    console.error('[Music] Search failed:', error);
    return [];
  }
}

export async function getSongUrl(songId: number): Promise<string | null> {
  try {
    const url = `${NETEASE_API_BASE}/song/url?id=${songId}`;
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data?.data?.[0]?.url) {
      return data.data[0].url;
    }
    return null;
  } catch (error) {
    console.error('[Music] Get song URL failed:', error);
    return null;
  }
}

export async function playSong(song: MusicSearchResult): Promise<boolean> {
  try {
    // 停止当前播放
    stopPlayback();

    const songUrl = await getSongUrl(song.id);
    if (!songUrl) {
      console.error('[Music] No playable URL found');
      return false;
    }

    // 使用 mpv 或系统默认播放器播放
    // 优先尝试 mpv（支持远程控制），回退到系统默认
    const fallbackToDefault = async () => {
      await execAsync(`start "" "${songUrl}"`, { timeout: 10000 });
      currentStatus = {
        playing: true,
        currentSong: song,
        progress: 0,
        duration: song.duration / 1000,
        volume: currentStatus.volume,
      };
      recordHistory(song);
    };

    currentProcess = spawn('mpv', ['--no-video', '--really-quiet', songUrl], {
      stdio: 'ignore',
    });

    // spawn 的 error 是异步事件，try/catch 捕获不到，必须用 error 监听
    let mpvFailed = false;
    currentProcess.on('error', () => { mpvFailed = true; });
    currentProcess.on('close', () => {
      currentStatus.playing = false;
      currentProcess = null;
    });

    // 给 spawn 一个短暂窗口检测是否启动失败
    await new Promise((r) => setTimeout(r, 200));

    if (mpvFailed) {
      console.warn('[Music] mpv not available, falling back to default player');
      // 移除残留的 close 监听，避免延迟触发覆盖 fallback 设置的状态
      currentProcess.removeAllListeners('close');
      currentProcess = null;
      await fallbackToDefault();
      return true;
    }

    currentStatus = {
      playing: true,
      currentSong: song,
      progress: 0,
      duration: song.duration / 1000,
      volume: currentStatus.volume,
    };
    recordHistory(song);
    return true;
  } catch (error) {
    console.error('[Music] Play failed:', error);
    return false;
  }
}

function recordHistory(song: MusicSearchResult): void {
  if (historyIndex < playHistory.length - 1) {
    playHistory = playHistory.slice(0, historyIndex + 1);
  }
  playHistory.push(song);
  historyIndex = playHistory.length - 1;
}

export function stopPlayback(): void {
  if (currentProcess) {
    currentProcess.kill();
    currentProcess = null;
  }
  currentStatus.playing = false;
}

export function getMusicStatus(): MusicStatus {
  return { ...currentStatus };
}

export function playPrev(): MusicSearchResult | null {
  if (historyIndex > 0) {
    historyIndex--;
    return playHistory[historyIndex];
  }
  return null;
}

export function playNext(): MusicSearchResult | null {
  if (historyIndex < playHistory.length - 1) {
    historyIndex++;
    return playHistory[historyIndex];
  }
  return null;
}
