import si from 'systeminformation';
import { uptime as systemUptime } from 'os';
import type { SystemInfo } from '../../../shared/types/index';

export async function getSystemInfo(): Promise<SystemInfo> {
  const [cpu, os, mem, gpuData, disks, netIfaces] = await Promise.all([
    si.cpu(),
    si.osInfo(),
    si.mem(),
    si.graphics().catch(() => null),
    si.fsSize(),
    si.networkInterfaces().catch(() => []),
  ]);

  // GPU 名称
  let gpu: string | undefined;
  if (gpuData?.controllers?.length) {
    const realGpu = gpuData.controllers.find(c =>
      !c.model?.toLowerCase().includes('virtual') &&
      !c.model?.toLowerCase().includes('gameviewer') &&
      !c.model?.toLowerCase().includes('mirror')
    );
    const target = realGpu || gpuData.controllers[gpuData.controllers.length - 1];
    gpu = `${target.vendor || ''} ${target.model || ''}`.trim();
  }

  // 磁盘信息
  const diskInfo = disks.map((d) => ({
    name: d.fs,
    total: Math.round(d.size / 1024 / 1024),
    fsType: d.type || 'Unknown',
  }));

  // 网络接口（过滤虚拟和回环）
  const netInfo = netIfaces
    .filter((n) => n.ip4 && !n.internal && !n.iface.toLowerCase().includes('loopback'))
    .map((n) => ({
      iface: n.iface,
      ip4: n.ip4,
    }));

  return {
    os: `${os.distro} ${os.release}`,
    hostname: os.hostname,
    cpuModel: `${cpu.manufacturer} ${cpu.brand}`,
    totalMemory: Math.round(mem.total / 1024 / 1024),
    uptime: Math.floor(systemUptime()),
    gpu,
    disks: diskInfo,
    networks: netInfo,
  };
}
