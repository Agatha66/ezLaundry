/** Normalise Date | ISO string | epoch ms | Firestore Timestamp-like values to a Date (or null). */
export function toDate(v: unknown): Date | null {
  if (v == null || v === '') return null;
  let d: Date | null = null;
  if (v instanceof Date) d = v;
  else if (typeof v === 'string' || typeof v === 'number') d = new Date(v);
  else if (typeof v === 'object') {
    const o = v as { toDate?: () => Date; seconds?: number };
    if (typeof o.toDate === 'function') d = o.toDate();
    else if (typeof o.seconds === 'number') d = new Date(o.seconds * 1000);
  }
  return d && !Number.isNaN(d.getTime()) ? d : null;
}

/** Local YYYY-MM-DD key for a date. */
export function dayKey(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Coerce numbers stored as strings (or junk) to a finite number. */
export function toNumber(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

/** "2 min ago", "3 h ago", "Yesterday", or a short date. */
export function timeAgo(v: unknown, now: Date = new Date()): string {
  const d = toDate(v);
  if (!d) return '';
  const s = Math.round((now.getTime() - d.getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 172800) return 'Yesterday';
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
}
