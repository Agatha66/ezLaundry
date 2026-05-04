import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { usePricing } from '@/hooks/useContent';
import { Button } from '@/components/ui/button';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  },
};

export function Pricing() {
  const { pricing, passes, loading } = usePricing();

  const scrollToCTA = () => {
    const element = document.querySelector('#cta');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-white">
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
            Simple, Transparent Pricing
          </h2>
          <p className="mt-4 text-lg text-[#4A6375]">
            No hidden fees. Pay for what you use.
          </p>
        </motion.div>

        {/* Pricing Table */}
        {loading ? (
          <div className="bg-[#F5F7F9] rounded-2xl p-8 h-64 animate-pulse" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#F5F7F9] rounded-2xl overflow-hidden mb-16"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#092635]">
                    <th className="text-left text-white font-semibold py-4 px-6">
                      Service
                    </th>
                    <th className="text-left text-white font-semibold py-4 px-6">
                      Price
                    </th>
                    <th className="text-left text-white font-semibold py-4 px-6">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.map((item, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#D8E5EF] last:border-b-0 hover:bg-white transition-colors"
                    >
                      <td className="py-4 px-6 text-[#092635] font-medium">
                        {item.service}
                      </td>
                      <td className="py-4 px-6 text-[#1188E9] font-semibold">
                        {item.price}
                      </td>
                      <td className="py-4 px-6 text-[#4A6375] text-sm">
                        {item.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Convenience Passes */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {passes.map((pass, index) => (
            <motion.div
              key={pass.id}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className={`relative rounded-2xl p-8 ${
                index === 1
                  ? 'bg-gradient-to-br from-[#1188E9] to-[#1A7A7E] text-white'
                  : 'bg-white border border-[#D8E5EF]'
              }`}
            >
              {/* Popular Badge */}
              {index === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-[#092635] text-white text-xs font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3
                className={`text-xl font-semibold mb-2 font-['Poppins'] ${
                  index === 1 ? 'text-white' : 'text-[#092635]'
                }`}
              >
                {pass.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <span
                  className={`text-4xl font-bold ${
                    index === 1 ? 'text-white' : 'text-[#1188E9]'
                  }`}
                >
                  RM{pass.price}
                </span>
                <span
                  className={`text-sm ${
                    index === 1 ? 'text-white/80' : 'text-[#4A6375]'
                  }`}
                >
                  /month
                </span>
              </div>

              {/* Benefits */}
              <ul className="space-y-3 mb-8">
                {pass.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        index === 1 ? 'text-white' : 'text-[#1188E9]'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        index === 1 ? 'text-white/90' : 'text-[#4A6375]'
                      }`}
                    >
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                onClick={scrollToCTA}
                className={`w-full rounded-full py-5 transition-all duration-300 ${
                  index === 1
                    ? 'bg-white text-[#1188E9] hover:bg-[#092635] hover:text-white'
                    : 'bg-[#1188E9] text-white hover:bg-[#092635]'
                }`}
              >
                Get Started
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
