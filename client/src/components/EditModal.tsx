import { useState, useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, ImagePlus } from 'lucide-react';
import { useTranslation } from '../locales/useTranslation';

interface EditModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onConfirm: () => void;
  confirmLabel?: string;
}

export default function EditModal({ open, onClose, title, children, onConfirm, confirmLabel }: EditModalProps) {
  const { msg } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [open]);

  if (!open && !visible) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-overlay-in"
        onClick={() => { setVisible(false); setTimeout(onClose, 200); }}
      />
      <div
        className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4 pb-0 md:pb-0"
        onClick={() => { setVisible(false); setTimeout(onClose, 200); }}
      >
        <div
          className="surface-1 rounded-2xl p-6 flex flex-col shadow-lg w-full max-w-md max-h-[95vh] md:max-h-[80vh] animate-modal-in rounded-b-none md:rounded-b-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5 shrink-0">
            <h3 className="font-display font-bold text-content-primary">{title}</h3>
            <button
              onClick={() => { setVisible(false); setTimeout(onClose, 200); }}
              className="btn-ghost !p-2 !rounded-lg md:!p-1.5 md:!rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
          <div className="space-y-4 mb-6 overflow-y-auto flex-1 min-h-0 pb-safe">
            {children}
          </div>
          <div className="flex gap-2 justify-end shrink-0">
            <button onClick={() => { setVisible(false); setTimeout(onClose, 200); }} className="btn-ghost">{msg.modal.cancel}</button>
            <button onClick={onConfirm} className="btn-accent">{confirmLabel || msg.modal.save}</button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

// 表单字段组件
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-content-tertiary font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// Emoji 选择器
const EMOJI_OPTIONS = [
  '💻', '🌐', '📁', '🎮', '⌨️', '🎵', '🎬', '🖼️', '💬', '📧',
  '🐙', '📺', '🔍', '▶️', '🐦', '📝', '🔧', '📊', '🎯', '⚡',
  '🚀', '🎨', '📱', '🖥️', '💡', '🔑', '📦', '🔔', '⚙️', '🛡️',
];

export function EmojiPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { msg } = useTranslation();
  const [custom, setCustom] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCustom(value || '');
  }, [value]);

  const isImageIcon = (v: string) => v && v.startsWith('data:image');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 512 * 1024) {
        alert(msg.modal.imageSizeLimit);
        return;
      }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      onChange(result);
      setCustom('');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <div>
      <div className="grid grid-cols-8 gap-1.5 mb-2 p-2 rounded-xl surface-2">
        {EMOJI_OPTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => { onChange(emoji); setCustom(emoji); }}
            className={`aspect-square rounded-lg flex items-center justify-center text-lg transition-all duration-150 ${value === emoji ? 'surface-3 ring-2 ring-accent scale-110' : 'hover:surface-3 hover:scale-105'}`}
          >
            {emoji}
          </button>
        ))}
        {/* 上传图片按钮 */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`aspect-square rounded-lg flex items-center justify-center transition-all duration-150 ${isImageIcon(value) ? 'surface-3 ring-2 ring-accent scale-110' : 'hover:surface-3 hover:scale-105'}`}
          title={msg.modal.uploadImage}
        >
          {isImageIcon(value) ? (
            <img src={value} alt="icon" className="w-6 h-6 rounded object-cover" />
          ) : (
            <ImagePlus size={16} className="text-content-tertiary" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>
      <input
        type="text"
        value={isImageIcon(value) ? '' : custom}
        onChange={(e) => { setCustom(e.target.value); onChange(e.target.value); }}
        placeholder={msg.modal.customIconPlaceholder}
        className="input"
      />
    </div>
  );
}
