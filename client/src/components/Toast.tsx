import { useAppStore } from '../stores';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-50 space-y-2">
      {toasts.map((toast) => {
        const Icon = toast.type === 'success' ? CheckCircle
          : toast.type === 'error' ? XCircle
          : Info;

        const colorMap = {
          success: 'text-success',
          error: 'text-danger',
          info: 'text-accent',
        };

        return (
          <div
            key={toast.id}
            className="surface-1 rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 min-w-[260px] animate-slide-in-right cursor-pointer"
            style={{ boxShadow: 'var(--shadow-lg)' }}
            onClick={() => removeToast(toast.id)}
          >
            <Icon size={16} className={colorMap[toast.type]} />
            <span className="text-sm text-content-primary flex-1">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
