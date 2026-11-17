import { motion } from 'framer-motion';
import { Camera, Clock, Home, MapPin, Smartphone, Star } from 'lucide-react';
import { SectionHeader, revealChild, revealParent } from './SectionHeader';

const TRACK = ['Rider assigned', 'Collected', 'Washing', 'Delivered'];

export function WhyChooseUs() {
  return (
    <section className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Why ezLaundry" title="Built for busy city life" subtitle="Everything you'd expect, and a few things you wouldn't." />

        <motion.div variants={revealParent} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
          {/* Big tile: live tracking */}
          <motion.div variants={revealChild} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#0B5FA8] to-navy p-7 text-white md:col-span-2 md:row-span-2">
            <span className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><MapPin className="h-6 w-6" /></span>
            <h3 className="relative mt-5 font-poppins text-2xl font-semibold sm:text-3xl">Track every step, live</h3>
            <p className="relative mt-2 max-w-md text-white/75">See exactly where your laundry is, from the moment the rider leaves to the moment it's back at your door.</p>
            <div className="relative mt-8 max-w-md space-y-3 rounded-2xl bg-white/10 p-5 backdrop-blur">
              {TRACK.map((t, i) => (
                <motion.div key={t} className="flex items-center gap-3" initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 + i * 0.2 }}>
                  <motion.span
                    className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold"
                    initial={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
                    whileInView={{ backgroundColor: i < 3 ? '#ffffff' : 'rgba(255,255,255,0.15)', color: '#1188E9' }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + i * 0.25 }}
                  >
                    {i < 3 ? '✓' : ''}
                  </motion.span>
                  <span className={i < 3 ? 'font-medium' : 'text-white/60'}>{t}</span>
                  {i === 2 && <span className="ml-auto rounded-full bg-emerald-400/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-200">Now</span>}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {[
            { icon: Clock, title: '48-hour turnaround', text: 'Express 24-hour option when you need it sooner.', tint: 'bg-amber-500/10 text-amber-600' },
            { icon: Camera, title: 'Photo proof', text: 'Item counts at pickup, photos at delivery.', tint: 'bg-emerald-500/10 text-emerald-600' },
          ].map(f => (
            <motion.div key={f.title} variants={revealChild} whileHover={{ y: -4 }} className="rounded-3xl border border-border bg-[#F8FAFC] p-6 transition-shadow hover:shadow-lg">
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${f.tint}`}><f.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-poppins text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={revealParent} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="mt-4 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Home, title: 'No need to be home', text: 'Silent pickup and return to your drop zone.', tint: 'bg-violet-500/10 text-violet-600' },
            { icon: Smartphone, title: 'Book in 60 seconds', text: 'On your phone or laptop. Track it on either.', tint: 'bg-primary/10 text-primary' },
            { icon: Star, title: 'Earn ezPoints', text: 'Points on every ringgit, and more for reviews.', tint: 'bg-pink-500/10 text-pink-600' },
          ].map(f => (
            <motion.div key={f.title} variants={revealChild} whileHover={{ y: -4 }} className="rounded-3xl border border-border bg-[#F8FAFC] p-6 transition-shadow hover:shadow-lg">
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${f.tint}`}><f.icon className="h-5 w-5" /></span>
              <h3 className="mt-4 font-poppins text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
