import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { useServices } from '@/hooks/useContent';
import { SectionHeader, revealChild, revealParent } from './SectionHeader';

const STYLE: Record<string, { emoji: string; tint: string; perks: string[] }> = {
  shirt: { emoji: '👕', tint: 'from-sky-400/20 to-primary/10', perks: ['Sorted by colour', 'Tumble dried', 'Neatly folded'] },
  iron: { emoji: '👔', tint: 'from-teal/20 to-emerald-400/10', perks: ['Everything in Wash & Fold', 'Steam pressed', 'Hung or folded'] },
  jacket: { emoji: '🧥', tint: 'from-violet-400/20 to-fuchsia-400/10', perks: ['Delicate fabrics', 'Suits & dresses', 'Stain treatment'] },
};

export function Services() {
  const { services, loading } = useServices();

  return (
    <section id="services" className="scroll-mt-24 bg-[#F5F8FB] py-20 lg:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="Services" title="Care for every fabric" subtitle="From everyday wear to your best suit." />

        {loading ? (
          <div className="grid gap-5 md:grid-cols-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-96 rounded-3xl" />)}</div>
        ) : (
          <motion.div variants={revealParent} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="grid gap-5 md:grid-cols-3">
            {services.map((s, i) => {
              const st = STYLE[s.icon] ?? STYLE.shirt;
              const featured = i === 1;
              return (
                <motion.article
                  key={s.id}
                  variants={revealChild}
                  whileHover={{ y: -8 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                  className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white p-7 shadow-sm transition-shadow hover:shadow-2xl hover:shadow-primary/10 ${featured ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border'}`}
                >
                  {featured && <span className="absolute right-5 top-5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-white">Popular</span>}
                  <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${st.tint}`}>{st.emoji}</div>
                  <h3 className="mt-6 font-poppins text-2xl font-semibold text-foreground">{s.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
                  <ul className="mb-6 mt-5 space-y-2">
                    {st.perks.map(p => (
                      <li key={p} className="flex items-center gap-2 text-sm text-foreground">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary"><Check className="h-3 w-3" strokeWidth={3} /></span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-end justify-between border-t border-border pt-5">
                    <div>
                      <span className="text-xs text-muted-foreground">From</span>
                      <p className="font-poppins text-3xl font-bold text-foreground">RM{s.priceFrom}<span className="text-base font-medium text-muted-foreground">/{s.unit}</span></p>
                      {s.minOrder && <p className="text-xs text-muted-foreground">{s.minOrder}</p>}
                    </div>
                    <Link to="/register" aria-label={`Book ${s.name}`} className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary group-hover:text-white">
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
