import { SectionHeader } from './SectionHeader';
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
    <section id="faq" className="scroll-mt-24 py-20 lg:py-28 bg-white">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader eyebrow="FAQ" title="Questions? Answered." subtitle="Everything you need to know before your first pickup." />

        {/* FAQ Accordion */}
        {loading ? (
          <div className="space-y-3">
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
            <Accordion type="single" collapsible className="space-y-3">
              {faq.map((item) => (
                <motion.div key={item.id} variants={itemVariants}>
                  <AccordionItem
                    value={item.id}
                    className="rounded-2xl border border-border bg-white px-6 shadow-sm transition-all duration-300 hover:border-primary/30 data-[state=open]:border-primary/40 data-[state=open]:bg-primary/[0.03] data-[state=open]:shadow-md"
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
