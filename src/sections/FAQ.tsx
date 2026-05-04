import { motion } from 'framer-motion';
import { useFAQ } from '@/hooks/useContent';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

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
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0, 0, 0.2, 1] as const },
  },
};

export function FAQ() {
  const { faq, loading } = useFAQ();

  return (
    <section id="faq" className="py-20 lg:py-28 bg-white">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold text-[#092635] font-['Poppins']">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-[#4A6375]">
            Got questions? We&apos;ve got answers.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-[#F5F7F9] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <Accordion type="single" collapsible className="space-y-4">
              {faq.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <AccordionItem
                    value={item.id}
                    className="bg-[#F5F7F9] rounded-xl border-none px-6 data-[state=open]:bg-[#E6F4FF] transition-colors duration-300"
                  >
                    <AccordionTrigger className="text-left text-[#092635] font-semibold hover:no-underline py-5">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-[#4A6375] pb-5 leading-relaxed">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        )}
      </div>
    </section>
  );
}
