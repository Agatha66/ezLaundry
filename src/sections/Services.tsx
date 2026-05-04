import { motion } from 'framer-motion';
import { Shirt, Sparkles, Archive } from 'lucide-react';
import { useServices } from '@/hooks/useContent';

const iconMap: Record<string, React.ElementType> = {
  shirt: Shirt,
  iron: Sparkles,
  jacket: Archive,
};

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

export function Services() {
  const { services, loading } = useServices();

  return (
    <section id="services" className="py-20 lg:py-28 bg-[#F5F7F9]">
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
            Our Services
          </h2>
          <p className="mt-4 text-lg text-[#4A6375]">
            Choose the service that fits your needs
          </p>
        </motion.div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 h-80 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid md:grid-cols-3 gap-6 lg:gap-8"
          >
            {services.map((service) => {
              const IconComponent = iconMap[service.icon] || Shirt;
              return (
                <motion.div
                  key={service.id}
                  variants={cardVariants}
                  whileHover={{ y: -6, transition: { duration: 0.3 } }}
                  className="bg-white rounded-2xl p-8 hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Icon */}
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1188E9] to-[#1A7A7E] rounded-2xl flex items-center justify-center mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-semibold text-[#092635] mb-3 font-['Poppins']">
                    {service.name}
                  </h3>
                  <p className="text-[#4A6375] mb-6 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Price */}
                  <div className="pt-6 border-t border-[#D8E5EF]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[#4A6375] text-sm">From</span>
                      <span className="text-3xl font-bold text-[#1188E9]">
                        RM{service.priceFrom}
                      </span>
                      <span className="text-[#4A6375]">/{service.unit}</span>
                    </div>
                    {service.minOrder && (
                      <p className="text-sm text-[#4A6375] mt-2">
                        {service.minOrder}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
