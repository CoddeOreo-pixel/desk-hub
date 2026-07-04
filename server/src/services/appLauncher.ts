import { spawn } from 'child_process';
import type { AppConfig, AppLaunchResult } from '../../../shared/types/index';

export async function launchApp(app: AppConfig): Promise<AppLaunchResult> {
  return new Promise((resolve) => {
    // 通过 explorer.exe 启动，等同于用户双击打开，拥有完整用户权限上下文
    const child = spawn('explorer.exe', [app.path], {
      detached: true,
      stdio: 'ignore',
      windowsHide: true,
    });

    child.on('error', (err) => {
      resolve({ name: app.name, success: false, error: err.message });
    });

    child.unref();

    // explorer.exe 启动是即时的，给一个短延迟确认无错误
    setTimeout(() => {
      resolve({ name: app.name, success: true });
    }, 300);
  });
}
