import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveModal } from '@/components/ResponsiveModal';
import { useConfirm } from '@/components/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { EMPTY_ADDRESS, formatAddress, getSavedAddresses, toPlainAddress } from '@/lib/addresses';
import { cn } from '@/lib/utils';
import type { SavedAddress } from '@/types';

const LABELS = ['Home', 'Office', 'Other'];
const EMOJI: Record<string, string> = { Home: '🏠', Office: '🏢' };

/** List, add, edit, delete and pick the default saved address. */
export function AddressManager() {
  const { userData, updateProfile } = useAuth();
  const confirm = useConfirm();
  const list = getSavedAddresses(userData);
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [saving, setSaving] = useState(false);

  const persist = async (next: SavedAddress[], message: string) => {
    const def = next.find(a => a.isDefault) ?? next[0];
    const normalised = next.map(a => ({ ...a, isDefault: a.id === def?.id }));
    await updateProfile({ addresses: normalised, ...(def ? { address: toPlainAddress(def) } : {}) });
    toast.success(message);
  };

  const startNew = () =>
    setEditing({ ...EMPTY_ADDRESS, area: 'Damansara Perdana', city: 'Petaling Jaya', id: '', label: list.length ? 'Office' : 'Home', isDefault: list.length === 0 });

  const save = async () => {
    if (!editing) return;
    if (!editing.street || !editing.building || !editing.postcode) {
      toast.error('Street, building and postcode are required');
      return;
    }
    setSaving(true);
    try {
      const isNew = !editing.id || !list.some(a => a.id === editing.id);
      const entry = { ...editing, id: editing.id && editing.id !== 'legacy' ? editing.id : crypto.randomUUID() };
      const base = list.filter(a => a.id !== editing.id);
      const next = entry.isDefault ? [...base.map(a => ({ ...a, isDefault: false })), entry] : [...base, entry];
      await persist(next, isNew ? 'Address added' : 'Address updated');
      setEditing(null);
    } catch {
      toast.error('Could not save the address');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a: SavedAddress) => {
    const ok = await confirm({ title: `Delete "${a.label}"?`, description: formatAddress(a), confirmText: 'Delete', destructive: true });
    if (!ok) return;
    try {
      await persist(list.filter(x => x.id !== a.id), 'Address deleted');
    } catch {
      toast.error('Could not delete the address');
    }
  };

  const makeDefault = async (a: SavedAddress) => {
    if (a.isDefault) return;
    try {
      await persist(list.map(x => ({ ...x, isDefault: x.id === a.id })), `${a.label} is now your default`);
    } catch {
      toast.error('Could not update the default address');
    }
  };

  return (
    <section id="addresses" className="scroll-mt-24">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Saved addresses</h2>
        <Button size="sm" variant="ghost" onClick={startNew} className="text-primary hover:bg-primary/10">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {list.length === 0 ? (
        <button onClick={startNew} className="flex w-full flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card p-8 text-sm text-muted-foreground transition-colors hover:border-primary/50">
          <MapPin className="h-6 w-6" /> Add your first address for faster checkout
        </button>
      ) : (
        <motion.ul layout className="space-y-2.5">
          <AnimatePresence initial={false}>
            {list.map(a => (
              <motion.li
                key={a.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border-[1.5px] bg-card p-4 transition-colors',
                  a.isDefault ? 'border-primary bg-primary/[0.04]' : 'border-border'
                )}
              >
                <button onClick={() => makeDefault(a)} aria-label={`Make ${a.label} default`} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                  <span className="text-2xl">{EMOJI[a.label] ?? '📍'}</span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      {a.label}
                      {a.isDefault && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Default</span>}
                    </span>
                    <span className="block text-xs text-muted-foreground">{formatAddress(a)}</span>
                  </span>
                </button>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => setEditing(a)} aria-label={`Edit ${a.label}`} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(a)} aria-label={`Delete ${a.label}`} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <ResponsiveModal
        open={!!editing}
        onOpenChange={o => { if (!o) setEditing(null); }}
        title={editing?.id && list.some(a => a.id === editing.id) ? 'Edit address' : 'New address'}
        footer={
          <Button onClick={save} disabled={saving} className="h-12 w-full rounded-xl">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save address'}
          </Button>
        }
      >
        {editing && (
          <div className="space-y-4 pb-2">
            <div className="flex gap-2">
              {LABELS.map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setEditing({ ...editing, label: l })}
                  className={cn('flex-1 rounded-xl border-[1.5px] py-2 text-sm font-medium transition-colors', editing.label === l ? 'border-primary bg-primary/10 text-primary' : 'border-border')}
                >
                  {EMOJI[l] ?? '📍'} {l}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Street *</Label><Input className="mt-1" value={editing.street} onChange={e => setEditing({ ...editing, street: e.target.value })} /></div>
              <div><Label>Unit</Label><Input className="mt-1" value={editing.unit ?? ''} onChange={e => setEditing({ ...editing, unit: e.target.value })} /></div>
              <div><Label>Building *</Label><Input className="mt-1" value={editing.building} onChange={e => setEditing({ ...editing, building: e.target.value })} /></div>
              <div><Label>Area</Label><Input className="mt-1" value={editing.area} onChange={e => setEditing({ ...editing, area: e.target.value })} /></div>
              <div><Label>Postcode *</Label><Input className="mt-1" inputMode="numeric" value={editing.postcode} onChange={e => setEditing({ ...editing, postcode: e.target.value })} /></div>
              <div className="col-span-2"><Label>City</Label><Input className="mt-1" value={editing.city} onChange={e => setEditing({ ...editing, city: e.target.value })} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <button
                type="button"
                role="checkbox"
                aria-checked={editing.isDefault}
                onClick={() => setEditing({ ...editing, isDefault: !editing.isDefault })}
                className={cn('grid h-5 w-5 place-items-center rounded-md border-2', editing.isDefault ? 'border-primary bg-primary text-white' : 'border-border')}
              >
                {editing.isDefault && <Check className="h-3 w-3" strokeWidth={3} />}
              </button>
              Set as default address
            </label>
          </div>
        )}
      </ResponsiveModal>
    </section>
  );
}
