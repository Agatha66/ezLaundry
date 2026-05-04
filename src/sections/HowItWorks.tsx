import { motion } from 'framer-motion';
import { Calendar, Package, Sparkles, Truck } from 'lucide-react';

const steps = [
  {
    id: 1,
    icon: Calendar,
    title: 'Book a Pickup',
    description: 'Schedule via app or web. Choose your preferred pickup window.',
  },
  {
    id: 2,
    icon: Package,
    title: 'We Collect',
    description: 'Rider picks up from your door or designated drop zone. Photo proof captured.',
  },
  {
    id: 3,
    icon: Sparkles,
    title: 'Professional Clean',
    description: 'Your laundry is processed by vetted partners with quality checks.',
  },
  {
    id: 4,
    icon: Truck,
    title: 'Fresh Delivery',
    description: 'Clean laundry returned to your door within 48 hours.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const },
  },
};

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] as const }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#092635] font-['Poppins']">
            How ezLaundry Works
          </h2>
          <p className="mt-4 text-lg text-[#4A6375]">
            Four simple steps to fresh laundry
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="relative bg-white border border-[#D8E5EF] rounded-2xl p-6 lg:p-8 hover:shadow-lg transition-shadow duration-300"
            >
              {/* Step Number */}
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-[#1188E9] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {step.id}
              </div>

              {/* Icon */}
              <div className="w-14 h-14 bg-[#E6F4FF] rounded-xl flex items-center justify-center mb-5">
                <step.icon className="w-7 h-7 text-[#1188E9]" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-[#092635] mb-3 font-['Poppins']">
                {step.title}
              </h3>
              <p className="text-[#4A6375] text-sm leading-relaxed">
                {step.description}
              </p>

              {/* Connector Line (hidden on last item and mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[#D8E5EF]">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#1188E9] rounded-full" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
