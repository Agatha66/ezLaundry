import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

import { REVEAL_EASE } from './reveal';

/** Eyebrow chip + title + subtitle, revealed on scroll. */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  dark = false,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: 'center' | 'left';
  dark?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: REVEAL_EASE }}
      className={cn(align === 'center' ? 'mx-auto text-center' : 'text-left', 'mb-12 max-w-2xl lg:mb-16', className)}
    >
      <span
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider',
          dark ? 'bg-white/10 text-sky-300' : 'bg-primary/10 text-primary'
        )}
      >
        <span className={cn('h-1.5 w-1.5 rounded-full', dark ? 'bg-sky-300' : 'bg-primary')} />
        {eyebrow}
      </span>
      <h2 className={cn('mt-4 font-poppins text-3xl font-semibold leading-tight sm:text-4xl lg:text-[44px]', dark ? 'text-white' : 'text-foreground')}>
        {title}
      </h2>
      {subtitle && <p className={cn('mt-4 text-lg', dark ? 'text-white/70' : 'text-muted-foreground')}>{subtitle}</p>}
    </motion.div>
  );
}
