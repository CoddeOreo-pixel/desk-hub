import { useState } from 'react';
import { useAppStore } from '../stores';
import { webApi } from '../services/api';
import { useTranslation } from '../locales/useTranslation';
import { t } from '../locales';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import EditModal, { Field, EmojiPicker } from '../components/EditModal';
import { Globe, ExternalLink, Plus, Trash2, Pencil } from 'lucide-react';

export default function WebPage() {
  const { websites, setWebsites, addToast } = useAppStore();
  const { msg } = useTranslation();
  const [url, setUrl] = useState('');
  const [editModal, setEditModal] = useState<{ mode: 'add' | 'edit'; index: number } | null>(null);
  const [form, setForm] = useState({ name: '', url: '', icon: '🌐' });

  const handleOpen = async (targetUrl: string) => {
    try {
      const result = await webApi.open(targetUrl);
      addToast(result.success ? msg.web.opened : t(msg.web.openFail, { error: result.error || '' }), result.success ? 'success' : 'error');
    } catch {
      addToast(msg.web.openFailShort, 'error');
    }
  };

  const handleQuickOpen = () => {
    if (!url.trim()) return;
    const target = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
    handleOpen(target);
    setUrl('');
  };

  const openAddModal = () => {
    setForm({ name: '', url: '', icon: '🌐' });
    setEditModal({ mode: 'add', index: -1 });
  };

  const openEditModal = (index: number) => {
    const site = websites[index];
    setForm({ name: site.name, url: site.url, icon: site.icon || '🌐' });
    setEditModal({ mode: 'edit', index });
  };

  const handleSave = async () => {
    if (!form.name || !form.url) {
      addToast(msg.web.nameUrlRequired, 'error');
      return;
    }
    try {
      if (editModal?.mode === 'add') {
        await webApi.add(form);
      } else if (editModal?.mode === 'edit') {
        const newSites = [...websites];
        newSites[editModal.index] = form;
        await webApi.updateAll(newSites);
      }
      const updated = await webApi.getBookmarks();
      setWebsites(updated);
      setEditModal(null);
      addToast(editModal?.mode === 'add' ? msg.web.added : msg.web.updated, 'success');
    } catch {
      addToast(msg.web.saveFail, 'error');
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await webApi.remove(name);
      const updated = await webApi.getBookmarks();
      setWebsites(updated);
      addToast(t(msg.web.deleted, { name }), 'success');
    } catch {
      addToast(msg.web.deleteFail, 'error');
    }
  };

  const isEmoji = (icon?: string) => icon && icon.length <= 4 && /[^\x00-\x7F]/.test(icon);
  const isImageIcon = (icon?: string) => icon && icon.startsWith('data:image');

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={msg.web.title}
        subtitle={msg.web.subtitle}
        action={
          <button onClick={openAddModal} className="btn-accent">
            <Plus size={16} />
            {msg.web.addWeb}
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-8">
        {websites.map((site, i) => (
          <Card
            key={site.name}
            interactive
            onClick={() => handleOpen(site.url)}
            onContextMenu={(e) => { e.preventDefault(); openEditModal(i); }}
            className="group relative animate-fade-in"
            style={{ animationDelay: `${i * 40}ms` } as any}
          >
            <div className="flex flex-col items-center gap-3 py-3">
              <div className="w-12 h-12 rounded-2xl surface-3 flex items-center justify-center text-2xl">
                {isImageIcon(site.icon) ? <img src={site.icon} alt={site.name} className="w-8 h-8 rounded object-cover" /> : isEmoji(site.icon) ? site.icon : <Globe size={22} className="text-content-tertiary" />}
              </div>
              <span className="text-xs text-content-secondary text-center truncate w-full font-medium">{site.name}</span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); openEditModal(i); }}
              className="absolute top-2 left-2 w-6 h-6 rounded-[6px] bg-accent-orange/20 text-accent-orange flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-accent-orange/30"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(site.name); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-[6px] bg-danger/20 text-danger flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-danger/30"
            >
              <Trash2 size={12} />
            </button>
          </Card>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleQuickOpen()}
          placeholder={msg.web.quickOpenPlaceholder}
          className="input flex-1"
        />
        <button onClick={handleQuickOpen} className="btn-orange shrink-0">
          <ExternalLink size={16} />
          {msg.web.open}
        </button>
      </div>

      <EditModal
        open={editModal !== null}
        onClose={() => setEditModal(null)}
        title={editModal?.mode === 'add' ? msg.web.addTitle : msg.web.editTitle}
        onConfirm={handleSave}
      >
        <Field label={msg.web.icon}>
          <EmojiPicker value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} />
        </Field>
        <Field label={msg.web.name}>
          <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder={msg.web.namePlaceholder} />
        </Field>
        <Field label={msg.web.url}>
          <input className="input" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder={msg.web.urlPlaceholder} />
        </Field>
      </EditModal>
    </div>
  );
}
