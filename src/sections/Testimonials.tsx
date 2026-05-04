import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { useTestimonials } from '@/hooks/useContent';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
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

export function Testimonials() {
  const { testimonials, loading } = useTestimonials();

  return (
    <section className="py-20 lg:py-28 bg-[#F5F7F9]">
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
            What Customers Say
          </h2>
          <p className="mt-4 text-lg text-[#4A6375]">
            Early feedback from our pilot users
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        {loading ? (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-8 h-64 animate-pulse"
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
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                variants={cardVariants}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
                className="bg-white rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300 relative"
              >
                {/* Quote Icon */}
                <div className="absolute top-6 right-6">
                  <Quote className="w-8 h-8 text-[#E6F4FF]" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-[#1188E9] text-[#1188E9]"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-[#4A6375] leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 bg-[#1188E9]">
                    <AvatarFallback className="bg-[#1188E9] text-white font-semibold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-[#092635]">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-[#4A6375]">
                      {testimonial.location}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
