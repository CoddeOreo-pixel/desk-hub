import { useAppStore } from '../stores';
import { useTranslation } from '../locales/useTranslation';
import { t } from '../locales';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { Cpu, MemoryStick, HardDrive, Monitor, Globe, Server } from 'lucide-react';

export default function MonitorPage() {
  const { systemInfo } = useAppStore();
  const { msg } = useTranslation();

  const fmtMB = (mb: number) => mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`;

  return (
    <div className="animate-fade-in">
      <PageHeader title={msg.monitor.title} subtitle={msg.monitor.subtitle} />

      {systemInfo ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <InfoCard
            icon={<Server size={20} />}
            iconBg="bg-accent/15 text-accent"
            title={msg.monitor.os}
            items={[
              { label: msg.monitor.system, value: systemInfo.os },
              { label: msg.monitor.hostname, value: systemInfo.hostname },
              { label: msg.monitor.uptime, value: formatUptime(systemInfo.uptime) },
            ]}
          />

          <InfoCard
            icon={<Cpu size={20} />}
            iconBg="bg-accent-orange/15 text-accent-orange"
            title={msg.monitor.cpu}
            items={[
              { label: msg.monitor.model, value: systemInfo.cpuModel },
            ]}
          />

          <InfoCard
            icon={<MemoryStick size={20} />}
            iconBg="bg-accent/15 text-accent"
            title={msg.monitor.memory}
            items={[
              { label: msg.monitor.totalCapacity, value: fmtMB(systemInfo.totalMemory) },
            ]}
          />

          {systemInfo.gpu && (
            <InfoCard
              icon={<Monitor size={20} />}
              iconBg="bg-accent-orange/15 text-accent-orange"
              title={msg.monitor.gpu}
              items={[
                { label: msg.monitor.model, value: systemInfo.gpu },
              ]}
            />
          )}

          {systemInfo.disks && systemInfo.disks.map((disk, i) => (
            <InfoCard
              key={i}
              icon={<HardDrive size={20} />}
              iconBg="bg-accent/15 text-accent"
              title={t(msg.monitor.disk, { name: disk.name })}
              items={[
                { label: msg.monitor.totalCapacity, value: fmtMB(disk.total) },
                { label: msg.monitor.fsType, value: disk.fsType || '-' },
              ]}
            />
          ))}

          {systemInfo.networks && systemInfo.networks.length > 0 && (
            <InfoCard
              icon={<Globe size={20} />}
              iconBg="bg-accent-orange/15 text-accent-orange"
              title={msg.monitor.network}
              items={systemInfo.networks.map((n) => ({
                label: n.iface,
                value: n.ip4 || '-',
              }))}
            />
          )}
        </div>
      ) : (
        <Card className="!p-8 text-center text-content-tertiary">
          {msg.monitor.loading}
        </Card>
      )}
    </div>
  );

  function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (days > 0) return `${t(msg.monitor.day, { n: days })} ${t(msg.monitor.hour, { n: hours })}`;
    if (hours > 0) return `${t(msg.monitor.hour, { n: hours })} ${t(msg.monitor.minute, { n: mins })}`;
    return t(msg.monitor.minute, { n: mins });
  }
}

function InfoCard({ icon, iconBg, title, items }: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  items: { label: string; value: string }[];
}) {
  return (
    <Card className="!p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        <h3 className="text-sm font-medium text-content-primary">{title}</h3>
      </div>
      <div className="space-y-2.5">
        {items.map((item) => (
          <div key={item.label} className="flex justify-between items-center text-xs">
            <span className="text-content-tertiary">{item.label}</span>
            <span className="text-content-primary font-mono text-right max-w-[60%] truncate" title={item.value}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
