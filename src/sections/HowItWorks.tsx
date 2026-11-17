import { motion } from 'framer-motion';
import { Calendar, Package, Sparkles, Truck } from 'lucide-react';
import { SectionHeader } from './SectionHeader';
import { REVEAL_EASE, revealChild, revealParent } from './reveal';

const steps = [
  { icon: Calendar, title: 'Book a pickup', description: 'Pick a service, a day and a time slot. It takes under a minute.', tint: 'from-sky-400 to-primary' },
  { icon: Package, title: 'We collect', description: 'A rider picks up from your door and verifies your item count.', tint: 'from-primary to-indigo-500' },
  { icon: Sparkles, title: 'Professional clean', description: 'Washed, dried and folded or pressed by vetted partners.', tint: 'from-teal to-emerald-500' },
  { icon: Truck, title: 'Fresh delivery', description: 'Back at your door within 48 hours, with photo proof.', tint: 'from-amber-400 to-orange-500' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="How it works" title="Fresh laundry in four easy steps" subtitle="No laundromat trips. No waiting around." />

        <div className="relative">
          {/* Connector line that draws itself on scroll (desktop) */}
          <svg className="absolute left-[12%] right-[12%] top-10 hidden h-1 w-[76%] lg:block" viewBox="0 0 100 2" preserveAspectRatio="none" aria-hidden>
            <line x1="0" y1="1" x2="100" y2="1" stroke="hsl(var(--border))" strokeWidth="2" strokeDasharray="2 2" vectorEffect="non-scaling-stroke" />
            <motion.line
              x1="0" y1="1" x2="100" y2="1"
              stroke="hsl(var(--primary))" strokeWidth="2" vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, margin: '-120px' }}
              transition={{ duration: 1.4, ease: REVEAL_EASE, delay: 0.3 }}
            />
          </svg>

          <motion.ol
            variants={revealParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6"
          >
            {steps.map((s, i) => (
              <motion.li key={s.title} variants={revealChild} className="group relative text-center">
                <motion.div
                  whileHover={{ y: -6, rotate: -3 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  className={`relative mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br ${s.tint} text-white shadow-lg`}
                >
                  <s.icon className="h-8 w-8" />
                  <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border-4 border-white bg-navy text-xs font-bold text-white">{i + 1}</span>
                </motion.div>
                <h3 className="mt-5 font-poppins text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-[240px] text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              </motion.li>
            ))}
          </motion.ol>
        </div>
      </div>
    </section>
  );
}
