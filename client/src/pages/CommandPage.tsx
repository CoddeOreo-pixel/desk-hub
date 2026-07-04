import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppStore } from '../stores';
import { commandApi } from '../services/api';
import { useTranslation } from '../locales/useTranslation';
import { t } from '../locales';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import { Power, RotateCcw, Moon, Lock, Terminal, Play, AlertTriangle } from 'lucide-react';

const presetConfig: Record<string, { icon: any; color: string }> = {
  shutdown: { icon: Power, color: 'text-danger bg-danger/10 hover:bg-danger/20 border border-danger/30' },
  restart: { icon: RotateCcw, color: 'text-accent-orange bg-accent-orange/10 hover:bg-accent-orange/20 border border-accent-orange/30' },
  hibernate: { icon: Moon, color: 'text-accent bg-accent/10 hover:bg-accent/20 border border-accent/30' },
  lock: { icon: Lock, color: 'text-accent-orange bg-accent-orange/10 hover:bg-accent-orange/20 border border-accent-orange/30' },
};

export default function CommandPage() {
  const { presetCommands, customCommands, commandOutput, addToast } = useAppStore();
  const { msg } = useTranslation();
  const [customCmd, setCustomCmd] = useState('');
  const [confirm, setConfirm] = useState<{ name: string; cmd: string } | null>(null);

  const handleExecute = async (name: string, cmd?: string, dangerous = false) => {
    if (dangerous) { setConfirm({ name, cmd: cmd || '' }); return; }
    try {
      await commandApi.execute(name, cmd);
      addToast(t(msg.command.executed, { name }), 'success');
    } catch (err) {
      addToast(t(msg.command.executeFail, { error: String(err) }), 'error');
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    try {
      await commandApi.execute(confirm.name, confirm.cmd || undefined);
      addToast(t(msg.command.executed, { name: confirm.name }), 'success');
    } catch (err) {
      addToast(t(msg.command.executeFail, { error: String(err) }), 'error');
    }
    setConfirm(null);
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title={msg.command.title} subtitle={msg.command.subtitle} />

      {/* Presets */}
      <div className="text-xs text-content-tertiary font-medium mb-3">{msg.command.quickActions}</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
        {presetCommands.map((cmd) => {
          const cfg = presetConfig[cmd.key] || { icon: Terminal, color: 'text-content-secondary surface-2' };
          const Icon = cfg.icon;
          return (
            <button
              key={cmd.key}
              onClick={() => handleExecute(cmd.name, cmd.cmd, cmd.dangerous)}
              className={`${cfg.color} rounded-2xl p-4 flex flex-col items-center gap-2 transition-all duration-200 active:scale-95`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{msg.command.presetNames[cmd.key] || cmd.name}</span>
            </button>
          );
        })}
      </div>

      {/* Custom commands */}
      {customCommands.length > 0 && (
        <>
          <div className="text-xs text-content-tertiary font-medium mb-3">{msg.command.customCommands}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
            {customCommands.map((cmd) => (
              <Card key={cmd.name} interactive onClick={() => handleExecute(cmd.name, cmd.cmd, cmd.dangerous)}>
                <div className="flex items-center gap-3">
                  <Terminal size={16} className="text-content-tertiary" />
                  <span className="text-sm text-content-primary font-medium">{cmd.name}</span>
                  {cmd.dangerous && <AlertTriangle size={13} className="text-danger ml-auto" />}
                </div>
                <div className="mt-2 text-[11px] text-content-tertiary font-mono truncate">{cmd.cmd}</div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Input */}
      <div className="text-xs text-content-tertiary font-medium mb-3">{msg.command.inputCommand}</div>
      <div className="flex gap-2">
        <input
          type="text"
          value={customCmd}
          onChange={(e) => setCustomCmd(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (handleExecute(customCmd, customCmd), setCustomCmd(''))}
          placeholder={msg.command.inputPlaceholder}
          className="input flex-1 font-mono"
        />
        <button onClick={() => { handleExecute(customCmd, customCmd); setCustomCmd(''); }} className="btn-orange shrink-0">
          <Play size={16} />
          {msg.command.execute}
        </button>
      </div>

      {/* Output */}
      {commandOutput && (
        <div className="card mt-4">
          <div className="text-xs text-content-tertiary font-medium mb-2">{msg.command.output}</div>
          <pre className="text-xs text-content-secondary font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">{commandOutput}</pre>
        </div>
      )}

      {/* Confirm dialog */}
      {confirm && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-overlay-in" onClick={() => setConfirm(null)}>
          <div className="surface-1 rounded-2xl p-6 max-w-sm w-full mx-4 animate-modal-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={22} className="text-danger" />
              <h3 className="font-display font-bold text-content-primary">{msg.command.confirmTitle}</h3>
            </div>
            <p className="text-sm text-content-secondary mb-1">
              {t(msg.command.confirmMsg, { name: confirm.name })}
            </p>
            <p className="text-xs text-content-tertiary font-mono mb-6">{confirm.cmd}</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirm(null)} className="btn-ghost flex-1">{msg.command.cancel}</button>
              <button onClick={handleConfirm} className="btn-danger flex-1">{msg.command.confirmExecute}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
