import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Truck, Clock, BadgeCheck } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const },
  },
};

const floatAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: [0.4, 0, 0.2, 1] as const,
  },
};

export function Hero() {
  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen pt-20 overflow-hidden bg-gradient-to-br from-white via-white to-[#E6F4FF]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-[52px] font-semibold text-[#092635] leading-tight font-['Poppins']"
            >
              Laundry Made Simple.{" "}
              <span className="text-[#1188E9]">Pickup, Clean, Deliver.</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-6 text-lg text-[#4A6375] leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Door-to-door laundry service for busy urban Malaysians. We pick up
              your laundry and return it fresh within 48 hours.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                onClick={() => scrollToSection('#cta')}
                className="bg-[#1188E9] hover:bg-[#092635] text-white rounded-full px-8 py-6 text-base font-medium transition-all duration-400 hover:-translate-y-0.5"
              >
                Book Your First Pickup
              </Button>
              <Button
                onClick={() => scrollToSection('#how-it-works')}
                variant="outline"
                className="border-2 border-[#1188E9] text-[#1188E9] hover:bg-[#1188E9] hover:text-white rounded-full px-8 py-6 text-base font-medium transition-all duration-400"
              >
                See How It Works
              </Button>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-wrap gap-6 justify-center lg:justify-start"
            >
              <div className="flex items-center gap-2 text-[#4A6375]">
                <Truck className="w-5 h-5 text-[#1188E9]" />
                <span className="text-sm font-medium">Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-[#4A6375]">
                <Clock className="w-5 h-5 text-[#1188E9]" />
                <span className="text-sm font-medium">48hr Turnaround</span>
              </div>
              <div className="flex items-center gap-2 text-[#4A6375]">
                <BadgeCheck className="w-5 h-5 text-[#1188E9]" />
                <span className="text-sm font-medium">No Hidden Fees</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0, 0, 0.2, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <motion.div
              animate={floatAnimation}
              className="relative"
            >
              {/* Main Illustration */}
              <div className="relative w-full max-w-[500px]">
                <svg
                  viewBox="0 0 500 400"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-auto"
                >
                  {/* Background Circle */}
                  <circle cx="250" cy="200" r="180" fill="#E6F4FF" />
                  
                  {/* Scooter */}
                  <g transform="translate(100, 150)">
                    {/* Scooter Body */}
                    <ellipse cx="150" cy="180" rx="80" ry="20" fill="#1188E9" />
                    <rect x="80" y="140" width="140" height="40" rx="10" fill="#0C2C40" />
                    
                    {/* Wheels */}
                    <circle cx="100" cy="200" r="25" fill="#092635" />
                    <circle cx="100" cy="200" r="15" fill="#D8E5EF" />
                    <circle cx="200" cy="200" r="25" fill="#092635" />
                    <circle cx="200" cy="200" r="15" fill="#D8E5EF" />
                    
                    {/* Handlebars */}
                    <path d="M140 140 L140 80 L180 60" stroke="#092635" strokeWidth="8" strokeLinecap="round" />
                    <line x1="160" y1="60" x2="200" y2="60" stroke="#092635" strokeWidth="8" strokeLinecap="round" />
                    
                    {/* Seat */}
                    <rect x="90" y="130" width="60" height="15" rx="5" fill="#1A7A7E" />
                    
                    {/* Laundry Bags */}
                    <rect x="110" y="80" width="50" height="60" rx="8" fill="#FFFFFF" stroke="#1188E9" strokeWidth="3" />
                    <rect x="115" y="75" width="40" height="10" rx="3" fill="#1188E9" />
                    <circle cx="135" cy="110" r="12" fill="#E6F4FF" />
                    <path d="M128 110 L132 115 L142 105" stroke="#1188E9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    
                    {/* Second Bag */}
                    <rect x="170" y="90" width="45" height="55" rx="8" fill="#FFFFFF" stroke="#1A7A7E" strokeWidth="3" />
                    <rect x="174" y="85" width="37" height="10" rx="3" fill="#1A7A7E" />
                    <circle cx="192" cy="118" r="10" fill="#E6F4FF" />
                    <path d="M186 118 L190 123 L198 113" stroke="#1A7A7E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                  
                  {/* Decorative Elements */}
                  <circle cx="80" cy="100" r="15" fill="#1188E9" opacity="0.3" />
                  <circle cx="420" cy="150" r="20" fill="#1A7A7E" opacity="0.2" />
                  <circle cx="400" cy="280" r="12" fill="#1188E9" opacity="0.25" />
                  
                  {/* Speed Lines */}
                  <line x1="50" y1="200" x2="20" y2="200" stroke="#1188E9" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
                  <line x1="45" y1="220" x2="15" y2="220" stroke="#1188E9" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                  <line x1="55" y1="180" x2="25" y2="180" stroke="#1188E9" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
                </svg>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 80V40C240 80 480 0 720 0C960 0 1200 80 1440 40V80H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
