import { motion } from 'framer-motion';
import { Clock, Shield, Home, Smartphone } from 'lucide-react';

const features = [
  {
    id: 'turnaround',
    icon: Clock,
    title: '48-Hour Turnaround',
    description: 'Standard delivery in 48 hours. Express 24-hour service available for urgent needs.',
  },
  {
    id: 'custody',
    icon: Shield,
    title: 'Chain of Custody',
    description: 'Photo proofs at pickup and delivery. Track your laundry every step of the way.',
  },
  {
    id: 'silent',
    icon: Home,
    title: 'Silent Pickup & Return',
    description: 'No need to be home. We pick up and deliver to your designated drop zone.',
  },
  {
    id: 'easy',
    icon: Smartphone,
    title: 'Easy Booking',
    description: 'Book via app or web in under 60 seconds. Schedule recurring pickups.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
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

export function WhyChooseUs() {
  return (
    <section className="py-20 lg:py-28 bg-white">
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
            Why Choose ezLaundry?
          </h2>
          <p className="mt-4 text-lg text-[#4A6375]">
            Built for busy urban life
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              variants={cardVariants}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="bg-white border border-[#D8E5EF] rounded-2xl p-6 lg:p-8 hover:shadow-lg hover:border-[#1188E9]/30 transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="w-14 h-14 bg-[#E6F4FF] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#1188E9] transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-[#1188E9] group-hover:text-white transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-[#092635] mb-3 font-['Poppins']">
                {feature.title}
              </h3>
              <p className="text-[#4A6375] text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
