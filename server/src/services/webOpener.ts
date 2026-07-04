import { exec } from 'child_process';

const BROWSER_PROCESSES = ['chrome.exe', 'msedge.exe', 'firefox.exe', 'brave.exe', 'opera.exe', 'vivaldi.exe'];

async function isBrowserRunning(): Promise<boolean> {
  return new Promise((resolve) => {
    exec('tasklist /FI "STATUS eq running" /FO CSV /NH', { timeout: 3000, windowsHide: true }, (err, stdout) => {
      if (err || !stdout) {
        resolve(false);
        return;
      }
      const lower = stdout.toLowerCase();
      resolve(BROWSER_PROCESSES.some((p) => lower.includes(p)));
    });
  });
}

async function launchDefaultBrowser(): Promise<void> {
  return new Promise((resolve) => {
    exec('start "" "https://about:blank"', { timeout: 5000, windowsHide: true }, () => {
      // 给浏览器一点启动时间
      setTimeout(resolve, 1500);
    });
  });
}

export async function openUrl(url: string): Promise<{ success: boolean; error?: string }> {
  // 防止命令注入：URL 必须以 http(s):// 开头，且不含可逃逸 cmd 的双引号
  if (!/^https?:\/\//i.test(url) || url.includes('"')) {
    return { success: false, error: 'Invalid URL: only http(s) URLs are allowed' };
  }
  return new Promise(async (resolve) => {
    try {
      // 检查浏览器是否在运行，没运行则先启动
      const browserRunning = await isBrowserRunning();
      if (!browserRunning) {
        await launchDefaultBrowser();
      }

      const child = exec(`cmd /c start "" "${url}"`, {
        timeout: 5000,
        windowsHide: true,
      });

      let stderr = '';
      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('error', (err) => {
        console.error('[webOpener] Failed to open URL:', url, err.message);
        resolve({ success: false, error: err.message });
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true });
        } else {
          console.error('[webOpener] Exit code:', code, 'stderr:', stderr);
          resolve({ success: false, error: stderr || `Exit code ${code}` });
        }
      });

      // 不等待浏览器关闭，1秒后即视为成功
      setTimeout(() => resolve({ success: true }), 1000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      resolve({ success: false, error: msg });
    }
  });
}
