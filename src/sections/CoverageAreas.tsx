import { motion } from 'framer-motion';
import { Check, MapPin, Clock } from 'lucide-react';
import { useCoverageAreas } from '@/hooks/useContent';
import { Badge } from '@/components/ui/badge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as const },
  },
};

export function CoverageAreas() {
  const { areas, loading } = useCoverageAreas();

  const activeAreas = areas.filter((area) => area.status === 'active');
  const comingSoonAreas = areas.filter((area) => area.status === 'coming-soon');

  return (
    <section id="coverage" className="py-20 lg:py-28 bg-[#E6F4FF]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#092635] font-['Poppins'] mb-4">
              Currently Serving
            </h2>
            <p className="text-lg text-[#4A6375] mb-8">
              Starting in Damansara Perdana, expanding across PJ
            </p>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-white/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Active Areas */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-3 mb-8"
                >
                  <h3 className="text-sm font-semibold text-[#092635] uppercase tracking-wide mb-3">
                    Now Available
                  </h3>
                  {activeAreas.map((area) => (
                    <motion.div
                      key={area.id}
                      variants={itemVariants}
                      className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 shadow-sm"
                    >
                      <div className="w-8 h-8 bg-[#1188E9]/10 rounded-full flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-[#1188E9]" />
                      </div>
                      <span className="text-[#092635] font-medium">{area.name}</span>
                      <Check className="w-4 h-4 text-green-500 ml-auto" />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Coming Soon Areas */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  className="space-y-3"
                >
                  <h3 className="text-sm font-semibold text-[#4A6375] uppercase tracking-wide mb-3">
                    Coming Soon
                  </h3>
                  {comingSoonAreas.map((area) => (
                    <motion.div
                      key={area.id}
                      variants={itemVariants}
                      className="flex items-center gap-3 bg-white/60 rounded-lg px-4 py-3"
                    >
                      <div className="w-8 h-8 bg-[#4A6375]/10 rounded-full flex items-center justify-center">
                        <Clock className="w-4 h-4 text-[#4A6375]" />
                      </div>
                      <span className="text-[#4A6375]">{area.name}</span>
                      <Badge variant="secondary" className="ml-auto text-xs bg-[#D8E5EF] text-[#4A6375]">
                        Soon
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}

            {/* Pilot Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 p-4 bg-[#092635] rounded-xl"
            >
              <p className="text-white/90 text-sm">
                <span className="font-semibold text-[#1188E9]">Pilot Program:</span>{' '}
                We&apos;re running a 30-day pilot in Damansara Perdana. Be among the
                first to experience ezLaundry.
              </p>
            </motion.div>
          </motion.div>

          {/* Map Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
            className="relative"
          >
            <div className="relative w-full aspect-square max-w-[500px] mx-auto">
              <svg
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                {/* Background */}
                <rect width="400" height="400" rx="20" fill="white" />
                
                {/* Map Grid Lines */}
                <g stroke="#E6F4FF" strokeWidth="1">
                  {[...Array(9)].map((_, i) => (
                    <line key={`h${i}`} x1="0" y1={(i + 1) * 40} x2="400" y2={(i + 1) * 40} />
                  ))}
                  {[...Array(9)].map((_, i) => (
                    <line key={`v${i}`} x1={(i + 1) * 40} y1="0" x2={(i + 1) * 40} y2="400" />
                  ))}
                </g>

                {/* Roads */}
                <path
                  d="M0 200 Q100 180 200 200 T400 200"
                  stroke="#D8E5EF"
                  strokeWidth="8"
                  fill="none"
                />
                <path
                  d="M200 0 Q180 100 200 200 T200 400"
                  stroke="#D8E5EF"
                  strokeWidth="8"
                  fill="none"
                />

                {/* Active Area Pins */}
                <g>
                  {/* Damansara Perdana - Center */}
                  <circle cx="200" cy="200" r="30" fill="#1188E9" opacity="0.2" />
                  <circle cx="200" cy="200" r="15" fill="#1188E9" />
                  <circle cx="200" cy="200" r="8" fill="white" />
                  <text x="200" y="245" textAnchor="middle" fill="#092635" fontSize="12" fontWeight="600">
                    Damansara Perdana
                  </text>

                  {/* Mutiara Damansara */}
                  <circle cx="120" cy="150" r="12" fill="#1188E9" />
                  <circle cx="120" cy="150" r="6" fill="white" />
                  <text x="120" y="175" textAnchor="middle" fill="#4A6375" fontSize="10">
                    Mutiara Damansara
                  </text>

                  {/* TTDI */}
                  <circle cx="280" cy="160" r="12" fill="#1188E9" />
                  <circle cx="280" cy="160" r="6" fill="white" />
                  <text x="280" y="185" textAnchor="middle" fill="#4A6375" fontSize="10">
                    TTDI
                  </text>

                  {/* Bandar Utama */}
                  <circle cx="150" cy="280" r="12" fill="#1188E9" />
                  <circle cx="150" cy="280" r="6" fill="white" />
                  <text x="150" y="305" textAnchor="middle" fill="#4A6375" fontSize="10">
                    Bandar Utama
                  </text>

                  {/* Kelana Jaya */}
                  <circle cx="300" cy="260" r="12" fill="#1188E9" />
                  <circle cx="300" cy="260" r="6" fill="white" />
                  <text x="300" y="285" textAnchor="middle" fill="#4A6375" fontSize="10">
                    Kelana Jaya
                  </text>
                </g>

                {/* Connection Lines */}
                <g stroke="#1188E9" strokeWidth="2" strokeDasharray="4 4" opacity="0.5">
                  <line x1="200" y1="200" x2="120" y2="150" />
                  <line x1="200" y1="200" x2="280" y2="160" />
                  <line x1="200" y1="200" x2="150" y2="280" />
                  <line x1="200" y1="200" x2="300" y2="260" />
                </g>

                {/* Legend */}
                <g transform="translate(20, 360)">
                  <circle cx="10" cy="10" r="6" fill="#1188E9" />
                  <text x="25" y="14" fill="#4A6375" fontSize="11">
                    Active Area
                  </text>
                </g>
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
