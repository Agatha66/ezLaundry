import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScrollPosition } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Services', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Coverage', href: '#coverage' },
  { label: 'FAQ', href: '#faq' },
];

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-teal font-poppins text-sm font-bold text-white shadow-md shadow-primary/30">
        ez
      </span>
      <span className={cn('font-poppins text-lg font-bold', light ? 'text-white' : 'text-foreground')}>ezLaundry</span>
    </span>
  );
}

export function Navbar() {
  const { isScrolled } = useScrollPosition();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  // Highlight the section currently in view
  useEffect(() => {
    const els = navLinks.map(l => document.querySelector(l.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      entries => entries.forEach(e => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const go = (href: string) => {
    setOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6"
    >
      <nav
        className={cn(
          'mx-auto flex h-16 max-w-6xl items-center justify-between rounded-2xl px-3 transition-all duration-300 sm:px-4',
          isScrolled || open ? 'border border-border bg-white/80 shadow-lg shadow-black/5 backdrop-blur-xl' : 'border border-transparent'
        )}
      >
        <Link to="/" aria-label="ezLaundry home" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 rounded-xl p-1 md:flex">
          {navLinks.map(link => (
            <button
              key={link.href}
              onClick={() => go(link.href)}
              className={cn(
                'relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                active === link.href ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {active === link.href && (
                <motion.span layoutId="nav-active" className="absolute inset-0 rounded-lg bg-primary/10" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
              )}
              <span className="relative">{link.label}</span>
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" className="rounded-xl text-muted-foreground hover:text-foreground">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild className="group rounded-xl px-5 shadow-md shadow-primary/25">
            <Link to="/register">
              Get started <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>

        <button
          onClick={() => setOpen(o => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-xl text-foreground transition-colors hover:bg-muted md:hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span key={open ? 'x' : 'menu'} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </motion.span>
          </AnimatePresence>
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 max-w-6xl rounded-2xl border border-border bg-white/95 p-3 shadow-xl backdrop-blur-xl md:hidden"
          >
            {navLinks.map((link, i) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                onClick={() => go(link.href)}
                className="block w-full rounded-xl px-4 py-3 text-left font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </motion.button>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border pt-3">
              <Button asChild variant="outline" className="h-11 rounded-xl"><Link to="/login">Sign in</Link></Button>
              <Button asChild className="h-11 rounded-xl"><Link to="/register">Get started</Link></Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
