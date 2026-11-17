import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { REVEAL_EASE } from './reveal';

export function CTA() {
  return (
    <section id="cta" className="scroll-mt-24 bg-white px-4 py-20 sm:px-6 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: REVEAL_EASE }}
        className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#0B5FA8] to-teal px-6 py-14 text-center text-white shadow-2xl shadow-primary/30 sm:px-12 sm:py-20"
      >
        <motion.span className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 8, repeat: Infinity }} />
        <motion.span className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-white/10" animate={{ scale: [1.1, 1, 1.1] }} transition={{ duration: 9, repeat: Infinity }} />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur">
            <Gift className="h-3.5 w-3.5" /> First pickup free for early adopters
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl font-poppins text-3xl font-semibold leading-tight sm:text-5xl">Ready to never do laundry again?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Join the pilot in Damansara Perdana and get your weekends back.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="group h-12 rounded-2xl bg-white px-7 text-base text-primary shadow-lg hover:bg-white/90">
              <Link to="/register">Create free account <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-2xl border-white/30 bg-white/10 px-7 text-base text-white backdrop-blur hover:bg-white/20 hover:text-white">
              <Link to="/login">I already have an account</Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
