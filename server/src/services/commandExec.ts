import { exec } from 'child_process';
import type { CommandConfig, PresetCommand } from '../../../shared/types/index';

// 预设命令映射
export const PRESET_COMMANDS: Record<string, PresetCommand> = {
  shutdown: { key: 'shutdown', name: '关机', cmd: 'shutdown /s /t 0', dangerous: true },
  restart: { key: 'restart', name: '重启', cmd: 'shutdown /r /t 0', dangerous: true },
  hibernate: { key: 'hibernate', name: '休眠', cmd: 'shutdown /h', dangerous: true },
  lock: { key: 'lock', name: '锁屏', cmd: 'rundll32.exe user32.dll,LockWorkStation', dangerous: false },
};

export function getPresetCommands(keys: string[]): PresetCommand[] {
  return keys
    .filter((key) => PRESET_COMMANDS[key])
    .map((key) => PRESET_COMMANDS[key]);
}

export function executeCommand(
  cmd: string,
  onOutput: (output: string) => void,
  onError: (error: string) => void,
  onExit: (code: number | null) => void
) {
  const proc = exec(cmd, { timeout: 30000 });

  proc.stdout?.on('data', (data: Buffer) => {
    onOutput(data.toString());
  });

  proc.stderr?.on('data', (data: Buffer) => {
    onError(data.toString());
  });

  proc.on('error', (err: Error) => {
    onError(err.message);
    onExit(1);
  });

  proc.on('close', (code) => {
    onExit(code);
  });

  return proc;
}
