import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Banknote, Check, Loader2, Minus, Plus, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { ResponsiveModal } from '@/components/ResponsiveModal';
import { EASE_OUT } from '@/components/motion';
import { orderService } from '@/services/orderService';
import { useAuth } from '@/contexts/AuthContext';
import { EMPTY_ADDRESS, formatAddress, getDefaultAddress, getSavedAddresses, toPlainAddress } from '@/lib/addresses';
import { cn } from '@/lib/utils';
import type { Address, Order, SavedAddress } from '@/types';

interface CreateOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

const SERVICES = [
  { id: 'wash-fold', name: 'Wash & Fold', emoji: '👕', description: 'Washed, dried and neatly folded', pricePerKg: 8, minKg: 3 },
  { id: 'wash-iron', name: 'Wash & Iron', emoji: '👔', description: 'Everything pressed and crisp', pricePerKg: 12, minKg: 3 },
  { id: 'dry-clean', name: 'Dry Clean', emoji: '🧥', description: 'Gentle care for delicates', pricePerKg: 15, minKg: 2 },
] as const;

const SLOTS = [
  { value: 'morning', label: 'Morning', time: '8 AM – 12 PM', emoji: '🌅' },
  { value: 'afternoon', label: 'Afternoon', time: '12 – 4 PM', emoji: '☀️' },
  { value: 'evening', label: 'Evening', time: '4 – 8 PM', emoji: '🌙' },
] as const;

const PAYMENTS = [
  { value: 'cash', label: 'Cash', icon: Banknote },
  { value: 'ewallet', label: 'e-Wallet', icon: Smartphone },
] as const;

const STEP_TITLES = ['Choose a service', 'Load & schedule', 'Address & payment', 'Review'];
const DELIVERY_FEE = 5;

function nextDays(count: number) {
  const today = new Date();
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    return {
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      weekday: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : d.toLocaleDateString('en-MY', { weekday: 'short' }),
      day: d.getDate(),
    };
  });
}

function Stepper({ value, onChange, min, max, suffix }: { value: number; onChange: (v: number) => void; min: number; max: number; suffix: string }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" aria-label="Decrease" onClick={() => onChange(Math.max(min, value - 1))} className="grid h-10 w-10 place-items-center rounded-xl border border-border transition-transform hover:bg-muted active:scale-90">
        <Minus className="h-4 w-4" />
      </button>
      <motion.span key={value} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-20 text-center font-poppins text-xl font-semibold tabular-nums">
        {value} <span className="text-sm font-normal text-muted-foreground">{suffix}</span>
      </motion.span>
      <button type="button" aria-label="Increase" onClick={() => onChange(Math.min(max, value + 1))} className="grid h-10 w-10 place-items-center rounded-xl border border-border transition-transform hover:bg-muted active:scale-90">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function Choice({ selected, onClick, className, children }: { selected: boolean; onClick: () => void; className?: string; children: React.ReactNode }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className={cn(
        'relative rounded-2xl border-[1.5px] text-left transition-colors',
        selected ? 'border-primary bg-primary/[0.06]' : 'border-border hover:border-primary/40',
        className
      )}
    >
      {children}
    </motion.button>
  );
}

const confettiColors = ['#1188E9', '#16A34A', '#F59E0B', '#7C3AED', '#EF4444', '#1A7A7E'];

function Success({ order, onTrack, onClose }: { order: Order; onTrack: () => void; onClose: () => void }) {
  return (
    <div className="relative flex flex-col items-center overflow-hidden py-6 text-center">
      {Array.from({ length: 16 }, (_, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-12 h-3 w-2 rounded-sm"
          style={{ background: confettiColors[i % confettiColors.length] }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: Math.cos((i / 16) * Math.PI * 2) * (90 + (i % 3) * 30), y: Math.sin((i / 16) * Math.PI * 2) * 80 - 40, opacity: 0, rotate: 360 + i * 40 }}
          transition={{ duration: 1.1, ease: EASE_OUT }}
        />
      ))}
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        className="grid h-20 w-20 place-items-center rounded-full bg-emerald-500/15"
      >
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="#16A34A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
          <motion.path d="M20 6 9 17l-5-5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.4 }} />
        </svg>
      </motion.span>
      <h3 className="mt-4 font-poppins text-xl font-semibold">Order placed!</h3>
      <p className="mt-1 text-sm text-muted-foreground">#{order.id.slice(-4)} · We're finding a rider near you.</p>
      <div className="mt-6 flex w-full gap-2">
        <Button variant="outline" onClick={onClose} className="h-12 flex-1 rounded-xl">Done</Button>
        <Button onClick={onTrack} className="h-12 flex-[2] rounded-xl">Track my order</Button>
      </div>
    </div>
  );
}

export function CreateOrderDialog({ isOpen, onClose, onOrderCreated }: CreateOrderDialogProps) {
  const { userData, updateProfile } = useAuth();
  const navigate = useNavigate();
  const days = useMemo(() => nextDays(7), []);
  const saved = getSavedAddresses(userData);

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [serviceId, setServiceId] = useState<(typeof SERVICES)[number]['id']>('wash-fold');
  const [weight, setWeight] = useState(3);
  const [items, setItems] = useState(10);
  const [day, setDay] = useState(days[1].key);
  const [slot, setSlot] = useState<(typeof SLOTS)[number]['value']>('morning');
  const [addressId, setAddressId] = useState<string>(() => getDefaultAddress(userData)?.id ?? 'new');
  const [newAddress, setNewAddress] = useState<Address>({ ...EMPTY_ADDRESS, area: 'Damansara Perdana', city: 'Petaling Jaya' });
  const [saveNew, setSaveNew] = useState(true);
  const [payment, setPayment] = useState<'cash' | 'ewallet'>('ewallet');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<Order | null>(null);

  const defaultAddressId = getDefaultAddress(userData)?.id ?? 'new';
  // Preselect the default saved address each time the sheet opens (profile may load after mount).
  useEffect(() => {
    if (isOpen) setAddressId(defaultAddressId);
  }, [isOpen, defaultAddressId]);

  const service = SERVICES.find(s => s.id === serviceId)!;
  const price = service.pricePerKg * weight;
  const selectedSaved = saved.find(a => a.id === addressId);
  const address: Address = selectedSaved ? toPlainAddress(selectedSaved) : newAddress;
  const addressValid = !!(address.street && address.building && address.postcode);

  const reset = () => {
    setStep(0); setDir(1); setServiceId('wash-fold'); setWeight(3); setItems(10); setDay(days[1].key); setSlot('morning');
    setAddressId(getDefaultAddress(userData)?.id ?? 'new'); setNotes(''); setError(''); setCreated(null);
  };
  const close = () => { onClose(); setTimeout(reset, 300); };
  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); setError(''); };

  const canContinue = step === 0 || (step === 1 && weight >= service.minKg && !!day) || (step === 2 && addressValid) || step === 3;

  const submit = async () => {
    if (!userData) return setError('Please log in to create an order');
    if (!addressValid) { go(2); return setError('Please complete your address'); }
    setLoading(true);
    setError('');
    try {
      const order = await orderService.createOrder({
        customerId: userData.uid,
        customerName: userData.displayName || 'Customer',
        customerPhone: userData.phone || '',
        customerAddress: address,
        serviceType: service.id,
        estimatedPrice: price,
        estimatedWeight: weight,
        declaredItemCount: items,
        deliveryFee: DELIVERY_FEE,
        totalAmount: price + DELIVERY_FEE,
        specialInstructions: notes.trim(),
        pickupDate: new Date(`${day}T09:00:00`),
        preferredTimeSlot: slot,
        paymentStatus: 'pending',
        paymentMethod: payment,
      });
      if (!selectedSaved && saveNew) {
        const entry: SavedAddress = { ...newAddress, id: crypto.randomUUID(), label: saved.length ? 'Other' : 'Home', isDefault: saved.length === 0 };
        updateProfile({ addresses: [...saved, entry], ...(saved.length === 0 ? { address: newAddress } : {}) }).catch(e => console.error('Could not save address', e));
      }
      setCreated(order);
      onOrderCreated(order);
    } catch (err) {
      console.error('Order creation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const footer = created ? undefined : (
    <div className="space-y-3">
      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => (step === 0 ? close() : go(step - 1))} className="h-12 flex-1 rounded-xl">
          {step === 0 ? 'Cancel' : 'Back'}
        </Button>
        <Button onClick={() => (step === 3 ? submit() : go(step + 1))} disabled={!canContinue || loading} className="h-12 flex-[2] rounded-xl text-base shadow-md shadow-primary/30">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : step === 3 ? `Place order · RM${price + DELIVERY_FEE}` : 'Continue'}
        </Button>
      </div>
    </div>
  );

  return (
    <ResponsiveModal
      open={isOpen}
      onOpenChange={o => { if (!o) close(); }}
      title={created ? 'All set 🎉' : 'New order'}
      description={created ? undefined : `Step ${step + 1} of 4 · ${STEP_TITLES[step]}`}
      footer={footer}
    >
      {created ? (
        <Success order={created} onClose={close} onTrack={() => { close(); navigate(`/order/${created.id}`); }} />
      ) : (
        <>
          <div className="mb-5 flex gap-1.5">
            {STEP_TITLES.map((t, i) => (
              <span key={t} className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-border">
                <motion.span
                  className="absolute inset-0 origin-left rounded-full bg-primary"
                  initial={false}
                  animate={{ scaleX: i <= step ? 1 : 0 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                />
              </span>
            ))}
          </div>

          <div className="overflow-hidden pb-2">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={step}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ x: d * 40, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (d: number) => ({ x: d * -40, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: EASE_OUT }}
              >
                {step === 0 && (
                  <div className="space-y-3">
                    {SERVICES.map(s => (
                      <Choice key={s.id} selected={s.id === serviceId} onClick={() => { setServiceId(s.id); setWeight(w => Math.max(w, s.minKg)); }} className="flex w-full items-center gap-3 p-4">
                        <span className="text-3xl">{s.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold text-foreground">{s.name}</span>
                          <span className="block text-sm text-muted-foreground">{s.description}</span>
                        </span>
                        <span className="text-right">
                          <span className="block font-semibold text-primary">RM{s.pricePerKg}</span>
                          <span className="text-xs text-muted-foreground">per kg</span>
                        </span>
                      </Choice>
                    ))}
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label className="text-muted-foreground">Estimated weight</Label>
                        <div className="mt-2"><Stepper value={weight} onChange={setWeight} min={service.minKg} max={30} suffix="kg" /></div>
                        <p className="mt-1 text-xs text-muted-foreground">Min {service.minKg} kg · ≈ RM{price}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Number of items</Label>
                        <div className="mt-2"><Stepper value={items} onChange={setItems} min={1} max={200} suffix="pcs" /></div>
                        <p className="mt-1 text-xs text-muted-foreground">Rider verifies at pickup</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Pickup day</Label>
                      <div className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1">
                        {days.map(d => (
                          <Choice key={d.key} selected={d.key === day} onClick={() => setDay(d.key)} className="w-16 shrink-0 py-2.5 text-center">
                            <span className={cn('block text-xs', d.key === day ? 'text-primary' : 'text-muted-foreground')}>{d.weekday}</span>
                            <span className="block font-poppins text-lg font-semibold">{d.day}</span>
                          </Choice>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Time slot</Label>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {SLOTS.map(s => (
                          <Choice key={s.value} selected={s.value === slot} onClick={() => setSlot(s.value)} className="px-2 py-3 text-center">
                            <span className="block text-lg">{s.emoji}</span>
                            <span className="block text-sm font-medium">{s.label}</span>
                            <span className="block text-[11px] text-muted-foreground">{s.time}</span>
                          </Choice>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Pickup & delivery address</Label>
                      {saved.map(a => (
                        <Choice key={a.id} selected={a.id === addressId} onClick={() => setAddressId(a.id)} className="flex w-full items-start gap-3 p-3.5">
                          <span className="text-xl">{a.label === 'Office' ? '🏢' : a.label === 'Home' ? '🏠' : '📍'}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold">{a.label}</span>
                            <span className="block text-xs text-muted-foreground">{formatAddress(a)}</span>
                          </span>
                          <span className={cn('mt-0.5 grid h-5 w-5 place-items-center rounded-full border-2', a.id === addressId ? 'border-primary bg-primary text-white' : 'border-border')}>
                            {a.id === addressId && <Check className="h-3 w-3" strokeWidth={3} />}
                          </span>
                        </Choice>
                      ))}
                      <Choice selected={addressId === 'new'} onClick={() => setAddressId('new')} className="flex w-full items-center gap-3 p-3.5">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 text-primary"><Plus className="h-4 w-4" /></span>
                        <span className="text-sm font-semibold">Use a new address</span>
                      </Choice>
                    </div>

                    <AnimatePresence initial={false}>
                      {addressId === 'new' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="col-span-2"><Label>Street *</Label><Input className="mt-1" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} placeholder="Jalan PJU 8/3" /></div>
                            <div><Label>Unit</Label><Input className="mt-1" value={newAddress.unit} onChange={e => setNewAddress({ ...newAddress, unit: e.target.value })} placeholder="A-12-3" /></div>
                            <div><Label>Building *</Label><Input className="mt-1" value={newAddress.building} onChange={e => setNewAddress({ ...newAddress, building: e.target.value })} placeholder="Residensi Vista" /></div>
                            <div><Label>Area</Label><Input className="mt-1" value={newAddress.area} onChange={e => setNewAddress({ ...newAddress, area: e.target.value })} /></div>
                            <div><Label>Postcode *</Label><Input className="mt-1" inputMode="numeric" value={newAddress.postcode} onChange={e => setNewAddress({ ...newAddress, postcode: e.target.value })} placeholder="47820" /></div>
                            <div className="col-span-2"><Label>City</Label><Input className="mt-1" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} /></div>
                            <label className="col-span-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <Checkbox checked={saveNew} onCheckedChange={v => setSaveNew(v === true)} /> Save to my addresses
                            </label>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <Label className="text-muted-foreground">Payment (on delivery)</Label>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {PAYMENTS.map(p => (
                          <Choice key={p.value} selected={p.value === payment} onClick={() => setPayment(p.value)} className="flex items-center gap-2 p-3">
                            <p.icon className={cn('h-5 w-5', p.value === payment ? 'text-primary' : 'text-muted-foreground')} />
                            <span className="text-sm font-medium">{p.label}</span>
                          </Choice>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2.5 rounded-2xl bg-muted/60 p-4 text-sm">
                      {[
                        ['Service', `${service.emoji} ${service.name}`],
                        ['Load', `${weight} kg · ${items} items`],
                        ['Pickup', `${days.find(d => d.key === day)?.weekday} ${days.find(d => d.key === day)?.day} · ${SLOTS.find(s => s.value === slot)?.label}`],
                        ['Address', selectedSaved?.label ?? address.building],
                        ['Payment', PAYMENTS.find(p => p.value === payment)?.label],
                      ].map(([k, v]) => (
                        <div key={k} className="flex justify-between gap-4">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="truncate text-right font-medium text-foreground">{v}</span>
                        </div>
                      ))}
                      <div className="border-t border-dashed border-border pt-2.5">
                        <div className="flex justify-between"><span className="text-muted-foreground">Laundry (est.)</span><span>RM{price}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Pickup & delivery</span><span>RM{DELIVERY_FEE}</span></div>
                        <div className="mt-1 flex justify-between text-base font-semibold"><span>Total</span><span className="text-primary">RM{price + DELIVERY_FEE}</span></div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Special instructions</Label>
                      <Textarea className="mt-2 min-h-20 rounded-xl" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Separate whites, no fabric softener" maxLength={300} />
                    </div>
                    <p className="text-xs text-muted-foreground">Final price is confirmed after weighing at the laundry.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </>
      )}
    </ResponsiveModal>
  );
}
