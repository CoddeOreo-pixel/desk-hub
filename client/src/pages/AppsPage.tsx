import { useState, useRef } from 'react';
import { useAppStore } from '../stores';
import { appApi, systemApi } from '../services/api';
import { useTranslation } from '../locales/useTranslation';
import { t } from '../locales';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import EditModal, { Field, EmojiPicker } from '../components/EditModal';
import { AppWindow, Plus, Trash2, FolderOpen, Pencil } from 'lucide-react';

export default function AppsPage() {
  const { apps, setApps, addToast } = useAppStore();
  const { msg } = useTranslation();
  const [editModal, setEditModal] = useState<{ mode: 'add' | 'edit'; index: number } | null>(null);
  const [form, setForm] = useState({ name: '', path: '', icon: '💻' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBrowse = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await systemApi.uploadApp(file);
      if (result.path) {
        setForm((f) => ({ ...f, path: result.path }));
        if (!form.name) {
          const name = file.name.replace(/\.(exe|lnk|bat|cmd)$/i, '');
          setForm((f) => ({ ...f, name }));
        }
      }
    } catch {
      addToast(msg.apps.uploadFail, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleLaunch = async (appName: string) => {
    try {
      const result = await appApi.launch(appName);
      addToast(result.success ? t(msg.apps.launched, { name: appName }) : t(msg.apps.launchFail, { error: result.error || '' }), result.success ? 'success' : 'error');
    } catch {
      addToast(msg.apps.launchFailShort, 'error');
    }
  };

  const openAddModal = () => {
    setForm({ name: '', path: '', icon: '💻' });
    setEditModal({ mode: 'add', index: -1 });
  };

  const openEditModal = (index: number) => {
    const app = apps[index];
    setForm({ name: app.name, path: app.path, icon: app.icon || '💻' });
    setEditModal({ mode: 'edit', index });
  };

  const handleSave = async () => {
    if (!form.name || !form.path) {
      addToast(msg.apps.namePathRequired, 'error');
      return;
    }
    try {
      if (editModal?.mode === 'add') {
        await appApi.add(form);
      } else if (editModal?.mode === 'edit') {
        const newApps = [...apps];
        newApps[editModal.index] = form;
        await appApi.updateAll(newApps);
      }
      const updated = await appApi.getList();
      setApps(updated);
      setEditModal(null);
      addToast(editModal?.mode === 'add' ? msg.apps.added : msg.apps.updated, 'success');
    } catch {
      addToast(msg.apps.saveFail, 'error');
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await appApi.remove(name);
      const updated = await appApi.getList();
      setApps(updated);
      addToast(t(msg.apps.deleted, { name }), 'success');
    } catch {
      addToast(msg.apps.deleteFail, 'error');
    }
  };

  const isEmoji = (icon?: string) => icon && icon.length <= 4 && /[^\x00-\x7F]/.test(icon);
  const isImageIcon = (icon?: string) => icon && icon.startsWith('data:image');

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={msg.apps.title}
        subtitle={msg.apps.subtitle}
        action={
          <button onClick={openAddModal} className="btn-accent">
            <Plus size={16} />
            {msg.apps.addApp}
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {apps.map((app, i) => (
          <Card
            key={app.name}
            interactive
            onClick={() => handleLaunch(app.name)}
            onContextMenu={(e) => { e.preventDefault(); openEditModal(i); }}
            className="group relative animate-fade-in"
            style={{ animationDelay: `${i * 40}ms` } as any}
          >
            <div className="flex flex-col items-center gap-3 py-3">
              <div className="w-12 h-12 rounded-2xl surface-3 flex items-center justify-center text-2xl">
                {isImageIcon(app.icon) ? <img src={app.icon} alt={app.name} className="w-8 h-8 rounded object-cover" /> : isEmoji(app.icon) ? app.icon : <AppWindow size={22} className="text-content-tertiary" />}
              </div>
              <span className="text-xs text-content-secondary text-center truncate w-full font-medium">
                {app.name}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); openEditModal(i); }}
              className="absolute top-2 left-2 w-6 h-6 rounded-[6px] bg-accent/20 text-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-accent/30"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(app.name); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-[6px] bg-danger/20 text-danger flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-danger/30"
            >
              <Trash2 size={12} />
            </button>
          </Card>
        ))}
      </div>

      {apps.length === 0 && (
        <div className="text-center py-24 text-content-tertiary text-sm">
          {msg.apps.empty}
        </div>
      )}

      <EditModal
        open={editModal !== null}
        onClose={() => setEditModal(null)}
        title={editModal?.mode === 'add' ? msg.apps.addTitle : msg.apps.editTitle}
        onConfirm={handleSave}
      >
        <Field label={msg.apps.icon}>
          <EmojiPicker value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} />
        </Field>
        <Field label={msg.apps.appName}>
          <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={msg.apps.namePlaceholder} />
        </Field>
        <Field label={msg.apps.appPath}>
          <div className="flex gap-2">
            <input className="input flex-1" value={form.path} onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))} placeholder={msg.apps.pathPlaceholder} />
            <input ref={fileInputRef} type="file" accept=".exe,.lnk,.bat,.cmd" onChange={handleBrowse} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-ghost shrink-0 !px-3" title={msg.apps.browseFile}>
              <FolderOpen size={16} />
            </button>
          </div>
        </Field>
      </EditModal>
    </div>
  );
}
