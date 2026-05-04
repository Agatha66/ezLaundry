import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Apple, Play } from 'lucide-react';

export function CTA() {
  return (
    <section id="cta" className="py-20 lg:py-28 bg-[#092635] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="20" cy="20" r="1" fill="#1188E9" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1188E9]/20 via-transparent to-[#1A7A7E]/20" />

      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-[48px] font-semibold text-white font-['Poppins'] leading-tight">
            Ready for Hassle-Free Laundry?
          </h2>
          <p className="mt-6 text-lg text-white/80 max-w-xl mx-auto">
            Join our pilot in Damansara Perdana. First pickup free for early
            adopters.
          </p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              className="bg-white text-[#1188E9] hover:bg-[#1188E9] hover:text-white rounded-full px-8 py-6 text-base font-medium transition-all duration-400"
            >
              Book Your First Pickup
            </Button>
            <Button
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 rounded-full px-8 py-6 text-base font-medium transition-all duration-400"
            >
              <Apple className="w-5 h-5 mr-2" />
              Download App
            </Button>
          </motion.div>

          {/* App Store Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex items-center justify-center gap-4 text-white/60 text-sm"
          >
            <span className="flex items-center gap-2">
              <Apple className="w-4 h-4" />
              iOS
            </span>
            <span className="w-1 h-1 bg-white/40 rounded-full" />
            <span className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Android
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
