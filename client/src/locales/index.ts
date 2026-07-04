import zh from './zh';
import en from './en';
import type { Translations } from './zh';

export type Lang = 'zh' | 'en';

const messages: Record<Lang, Translations> = { zh, en };

export function getMessages(lang: Lang): Translations {
  return messages[lang];
}

/**
 * Simple template interpolation.
 * Supports {key} placeholders, e.g. t('hello {name}', { name: 'World' })
 */
export function t(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  );
}
