import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Gift, HelpCircle, Loader2, LogOut, Mail, Moon, Pencil, Phone, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { TopBar } from '@/components/shell/TopBar';
import { CountUp, EASE_OUT, Stagger, StaggerItem } from '@/components/motion';
import { ResponsiveModal } from '@/components/ResponsiveModal';
import { useConfirm } from '@/components/ConfirmDialog';
import { useTheme } from '@/components/ThemeProvider';
import { AddressManager } from '@/components/profile/AddressManager';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerOrders, useRiderOrders } from '@/hooks/useOrders';
import { computeLoyalty } from '@/lib/loyalty';
import { riderAverage } from '@/lib/reports';

const ROLE_BADGE: Record<string, string> = {
  customer: 'bg-primary/10 text-primary',
  rider: 'bg-teal/15 text-teal',
  admin: 'bg-violet-500/15 text-violet-600 dark:text-violet-300',
};

function LoyaltyCard({ uid }: { uid?: string }) {
  const { orders } = useCustomerOrders(uid);
  const l = computeLoyalty(orders);
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-fuchsia-600 p-5 text-white shadow-xl shadow-violet-500/25">
      <Gift className="absolute -right-3 -top-3 h-24 w-24 text-white/10" />
      <p className="text-sm text-white/80">ezPoints · {l.tier} member</p>
      <CountUp value={l.points} suffix=" pts" className="block font-poppins text-3xl font-bold" />
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/25">
        <motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: `${Math.round(l.progress * 100)}%` }} transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.2 }} />
      </div>
      <p className="mt-2 text-xs text-white/80">
        {l.nextTier ? `${l.toNext} pts to ${l.nextTier} · 1 pt per RM spent, +5 per review` : 'You reached the top tier. Thank you!'}
      </p>
    </div>
  );
}

function RiderStatsCard({ uid }: { uid?: string }) {
  const { completedOrders } = useRiderOrders(uid);
  const { avg, count } = riderAverage(completedOrders);
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-border bg-card p-4">
        <CountUp value={completedOrders.length} className="block font-poppins text-2xl font-semibold" />
        <p className="text-xs text-muted-foreground">Jobs completed</p>
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">
        <p className="flex items-center gap-1 font-poppins text-2xl font-semibold">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" /> {count ? avg.toFixed(1) : '–'}
        </p>
        <p className="text-xs text-muted-foreground">{count} review{count === 1 ? '' : 's'}</p>
      </div>
    </div>
  );
}

export function Profile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { userData, logout, updateProfile } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const confirm = useConfirm();
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (location.hash === '#addresses') {
      const t = setTimeout(() => document.getElementById('addresses')?.scrollIntoView({ behavior: 'smooth' }), 400);
      return () => clearTimeout(t);
    }
  }, [location.hash]);

  const role = userData?.role ?? 'customer';
  const openEdit = () => {
    setName(userData?.displayName ?? '');
    setPhone(userData?.phone ?? '');
    setEditOpen(true);
  };

  const saveProfile = async () => {
    if (!name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      await updateProfile({ displayName: name.trim(), phone: phone.trim() });
      toast.success('Profile updated');
      setEditOpen(false);
    } catch {
      toast.error('Could not update your profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    if (await confirm({ title: 'Log out?', description: 'You can sign back in any time.', confirmText: 'Log out' })) {
      await logout();
      navigate('/');
    }
  };

  const settings = [
    { icon: Moon, label: 'Dark mode', control: <Switch checked={resolvedTheme === 'dark'} onCheckedChange={v => setTheme(v ? 'dark' : 'light')} aria-label="Dark mode" /> },
    { icon: HelpCircle, label: 'Help & support', onClick: () => toast.info('Reach us at support@ezlaundry.my') },
  ];

  return (
    <>
      <TopBar title="Profile" />
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_1fr]">
        <Stagger className="space-y-5">
          <StaggerItem>
            <div className="flex items-center gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-teal font-poppins text-2xl font-semibold text-white">
                {userData?.displayName?.charAt(0).toUpperCase() ?? '?'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-poppins text-lg font-semibold text-foreground">{userData?.displayName}</p>
                <p className="flex items-center gap-1.5 truncate text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {userData?.email}</p>
                {userData?.phone && <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {userData.phone}</p>}
                <span className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_BADGE[role]}`}>{role}</span>
              </div>
              <Button size="icon" variant="ghost" onClick={openEdit} aria-label="Edit profile" className="shrink-0 rounded-xl">
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </StaggerItem>
          {role === 'customer' && <StaggerItem><LoyaltyCard uid={userData?.uid} /></StaggerItem>}
          {role === 'rider' && <StaggerItem><RiderStatsCard uid={userData?.uid} /></StaggerItem>}
          <StaggerItem>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              {settings.map(s => (
                <div
                  key={s.label}
                  onClick={s.onClick}
                  className={`flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-0 ${s.onClick ? 'cursor-pointer transition-colors hover:bg-muted/60' : ''}`}
                >
                  <s.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="flex-1 text-sm font-medium text-foreground">{s.label}</span>
                  {s.control ?? <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
              ))}
              <button onClick={handleLogout} className="flex w-full items-center gap-3 px-4 py-3.5 text-left text-destructive transition-colors hover:bg-destructive/5">
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Log out</span>
              </button>
            </div>
          </StaggerItem>
        </Stagger>

        {role === 'customer' && (
          <Stagger>
            <StaggerItem><AddressManager /></StaggerItem>
          </Stagger>
        )}
      </div>

      <ResponsiveModal
        open={editOpen}
        onOpenChange={setEditOpen}
        title="Edit profile"
        footer={
          <Button onClick={saveProfile} disabled={saving} className="h-12 w-full rounded-xl">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save changes'}
          </Button>
        }
      >
        <div className="space-y-4 pb-2">
          <div><Label htmlFor="pf-name">Full name</Label><Input id="pf-name" className="mt-1" value={name} onChange={e => setName(e.target.value)} /></div>
          <div><Label htmlFor="pf-phone">Phone</Label><Input id="pf-phone" className="mt-1" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+60 12-345 6789" /></div>
        </div>
      </ResponsiveModal>
    </>
  );
}
