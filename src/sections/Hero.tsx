import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BadgeCheck, Check, Clock, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { REVEAL_EASE } from './reveal';

const parent = { hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } };
const child = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: REVEAL_EASE } } };

const STEPS = ['Rider assigned', 'Laundry collected', 'Washing', 'Out for delivery'];

/** A phone showing the live tracker, the app's signature screen. */
function PhoneMock() {
  return (
    <div className="relative mx-auto w-[280px] sm:w-[300px]">
      <div className="rounded-[44px] border-[10px] border-navy bg-background p-3 shadow-2xl shadow-primary/30">
        <div className="mx-auto mb-3 h-5 w-24 rounded-full bg-navy" />
        <p className="px-1 text-[11px] text-muted-foreground">Good morning ☀️</p>
        <p className="px-1 font-poppins text-lg font-semibold text-foreground">Hi, Aina 👋</p>

        <div className="relative mt-3 overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0B5FA8] to-navy p-4 text-white">
          <span className="absolute -right-10 -top-12 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-semibold">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live · #J8A2
            </span>
            <motion.span className="text-xl" animate={{ y: [0, -3, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>🛵</motion.span>
          </div>
          <p className="relative mt-2 font-poppins text-base font-semibold">Rider on the way</p>
          <p className="relative text-[11px] text-white/75">Wash & Fold · 6 kg · 10–11 AM</p>
          <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-sky-300 to-white" initial={{ width: '8%' }} animate={{ width: ['8%', '38%', '38%'] }} transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, ease: REVEAL_EASE }} />
          </div>
        </div>

        <div className="mt-3 space-y-2.5 rounded-3xl border border-border bg-card p-4">
          {STEPS.map((s, i) => (
            <motion.div key={s} className="flex items-center gap-2.5" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + i * 0.15 }}>
              <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] ${i < 1 ? 'bg-primary text-white' : i === 1 ? 'border-2 border-primary bg-card' : 'border-2 border-border bg-muted'}`}>
                {i < 1 ? <Check className="h-3 w-3" strokeWidth={3} /> : i === 1 ? <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> : ''}
              </span>
              <span className={`text-xs ${i <= 1 ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{s}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="font-poppins text-lg font-semibold text-foreground">RM237</p>
            <p className="text-[10px] text-muted-foreground">Total spent</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3">
            <p className="font-poppins text-lg font-semibold text-foreground">247</p>
            <p className="text-[10px] text-muted-foreground">ezPoints</p>
          </div>
        </div>
      </div>

      {/* Floating chips */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 10 }}
        animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
        transition={{ opacity: { delay: 1.2 }, x: { delay: 1.2, duration: 0.6 }, y: { delay: 1.8, duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute -left-8 top-28 hidden items-center gap-2 rounded-2xl border border-border bg-white/90 px-3 py-2.5 shadow-xl backdrop-blur sm:flex lg:-left-20"
      >
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500/15 text-emerald-600"><Check className="h-4 w-4" strokeWidth={3} /></span>
        <div>
          <p className="text-xs font-semibold text-foreground">Delivered!</p>
          <p className="text-[10px] text-muted-foreground">Photo proof attached</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1.5 }, x: { delay: 1.5, duration: 0.6 }, y: { delay: 2.1, duration: 4.5, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute -right-6 bottom-36 hidden rounded-2xl border border-border bg-white/90 px-3 py-2.5 shadow-xl backdrop-blur sm:block lg:-right-16"
      >
        <div className="flex gap-0.5">{[0, 1, 2, 3, 4].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}</div>
        <p className="mt-1 text-[11px] font-semibold text-foreground">“Super fast, thank you!”</p>
      </motion.div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-40">
      {/* Background: soft blobs + grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#F3F8FD_0%,#FFFFFF_70%)]" />
      <motion.div
        className="pointer-events-none absolute -right-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full bg-primary/20 blur-3xl"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -left-40 top-40 -z-10 h-[420px] w-[420px] rounded-full bg-teal/15 blur-3xl"
        animate={{ scale: [1.05, 1, 1.05] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,hsl(var(--border))_1px,transparent_0)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:px-8">
        <motion.div variants={parent} initial="hidden" animate="visible" className="text-center lg:text-left">
          <motion.span variants={child} className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-3 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur">
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-white">NEW</span>
            Now serving Damansara Perdana & PJ
          </motion.span>

          <motion.h1 variants={child} className="mt-6 font-poppins text-[40px] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-[64px]">
            Laundry day,{' '}
            <span className="relative whitespace-nowrap">
              <span className="bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">done for you.</span>
              <motion.svg viewBox="0 0 300 12" className="absolute -bottom-2 left-0 h-3 w-full" preserveAspectRatio="none" aria-hidden>
                <motion.path d="M2 9 C 80 2, 220 2, 298 8" fill="none" stroke="hsl(var(--primary))" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.9, duration: 0.8, ease: REVEAL_EASE }} />
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p variants={child} className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
            Schedule a pickup in 60 seconds. We collect from your door, wash it with care and bring it back fresh within 48 hours, and you can track every step live.
          </motion.p>

          <motion.div variants={child} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
            <Button asChild size="lg" className="group h-12 rounded-2xl px-7 text-base shadow-lg shadow-primary/30">
              <Link to="/register">
                Book your first pickup <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-12 rounded-2xl border-border bg-white/70 px-7 text-base backdrop-blur hover:bg-white"
            >
              See how it works
            </Button>
          </motion.div>

          <motion.div variants={child} className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground lg:justify-start">
            {[
              { icon: Truck, label: 'Free pickup & delivery' },
              { icon: Clock, label: '48-hour turnaround' },
              { icon: BadgeCheck, label: 'Photo proof every step' },
            ].map(b => (
              <span key={b.label} className="flex items-center gap-2"><b.icon className="h-4 w-4 text-primary" /> {b.label}</span>
            ))}
          </motion.div>

          <motion.div variants={child} className="mt-8 flex items-center justify-center gap-3 lg:justify-start">
            <div className="flex -space-x-2">
              {['from-amber-300 to-pink-400', 'from-sky-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-violet-400 to-fuchsia-500'].map((g, i) => (
                <span key={g} className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white bg-gradient-to-br text-xs font-semibold text-white ${g}`}>{['S', 'A', 'M', 'D'][i]}</span>
              ))}
            </div>
            <div className="text-left text-sm">
              <div className="flex items-center gap-1 font-semibold text-foreground">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9 rating
              </div>
              <p className="text-xs text-muted-foreground">from our pilot customers</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: REVEAL_EASE }}>
          <PhoneMock />
        </motion.div>
      </div>
    </section>
  );
}
