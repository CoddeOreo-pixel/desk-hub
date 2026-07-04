import { useAppStore } from '../stores';
import { getMessages, t } from '../locales';
import type { Translations } from './zh';

/**
 * Hook that returns the translation function and current messages.
 * Usage:
 *   const { msg } = useTranslation();
 *   msg.apps.title                    // "应用" or "Apps"
 *   t(msg.apps.launched, { name })    // "VS Code 已启动" or "VS Code launched"
 */
export function useTranslation() {
  const lang = useAppStore((s) => s.lang);
  const msg: Translations = getMessages(lang);
  return { msg, t, lang };
}
