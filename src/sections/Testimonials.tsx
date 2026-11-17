import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { useTestimonials } from '@/hooks/useContent';
import { SectionHeader } from './SectionHeader';
import { revealChild, revealParent } from './reveal';

const GRADIENTS = ['from-amber-300 to-pink-400', 'from-sky-400 to-indigo-500', 'from-emerald-400 to-teal-500'];

export function Testimonials() {
  const { testimonials, loading } = useTestimonials();

  return (
    <section className="relative overflow-hidden bg-navy py-20 lg:py-28">
      <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-teal/30 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader dark eyebrow="Loved by customers" title="Don't take our word for it" subtitle="Early feedback from our pilot users." />

        {loading ? (
          <div className="grid gap-5 md:grid-cols-3">{[1, 2, 3].map(i => <div key={i} className="h-64 animate-pulse rounded-3xl bg-white/5" />)}</div>
        ) : (
          <motion.div variants={revealParent} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid gap-5 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <motion.figure
                key={t.id}
                variants={revealChild}
                whileHover={{ y: -6 }}
                className={`relative rounded-3xl border border-white/10 bg-white/[0.06] p-7 backdrop-blur ${i === 1 ? 'md:translate-y-6' : ''}`}
              >
                <Quote className="absolute right-6 top-6 h-8 w-8 text-white/10" />
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }, (_, k) => <Star key={k} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <blockquote className="mt-4 leading-relaxed text-white/85">“{t.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className={`grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br font-semibold text-white ${GRADIENTS[i % GRADIENTS.length]}`}>
                    {t.name.split(' ').map(n => n[0]).join('')}
                  </span>
                  <div>
                    <p className="font-semibold text-white">{t.name}</p>
                    <p className="text-sm text-white/60">{t.location}</p>
                  </div>
                </figcaption>
              </motion.figure>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
