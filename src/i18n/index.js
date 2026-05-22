import en from './en';
import vi from './vi';

export const SUPPORTED_LANGS = ['vi', 'en'];

export const MESSAGES = { vi, en };

export function normalizeLang(input) {
  if (!input) return 'vi';
  const raw = String(input).toLowerCase();
  if (raw.startsWith('vi')) return 'vi';
  if (raw.startsWith('en')) return 'en';
  return 'vi';
}

export function detectInitialLang() {
  try {
    if (typeof navigator !== 'undefined') {
      return normalizeLang(navigator.language);
    }
  } catch {
    // ignore
  }
  return 'vi';
}

export function getMessage(lang) {
  return MESSAGES[normalizeLang(lang)] || MESSAGES.vi;
}

export function format(template, vars) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k];
    return v === undefined || v === null ? '' : String(v);
  });
}

export function tFor(lang, key, vars) {
  const msg = getMessage(lang);
  const parts = String(key).split('.');
  let cur = msg;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object') {
      cur = undefined;
      break;
    }
    cur = cur[p];
  }
  if (typeof cur === 'string') return format(cur, vars);
  // fallback: show key to make missing translations obvious in UI
  return String(key);
}

