import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const faqs = [
  {
    question: 'Do I need a professional to install this?',
    answer:
      "While you can install some components yourself, we recommend professional installation for the best results. Our quote includes installation options, and licensed installers ensure everything works perfectly.",
  },
  {
    question: 'What if I have pets?',
    answer:
      "No problem! We have pet-immune motion sensors that ignore movement from animals up to 40kg. Just select the pet-friendly option when building your quote.",
  },
  {
    question: 'Will it work during a power outage?',
    answer:
      "Yes! The system includes a backup battery that keeps everything running for hours during power outages. You'll stay protected even when the lights go out.",
  },
  {
    question: 'Can I control it from my phone?',
    answer:
      'Absolutely. With the optional IP or GSM module, you can arm, disarm, and monitor your system from anywhere using your smartphone.',
  },
  {
    question: 'How loud is the siren?',
    answer:
      "Our indoor sirens reach 105dB – that's as loud as a chainsaw and enough to deter most intruders immediately. Outdoor sirens include a flashing strobe for extra visibility.",
  },
  {
    question: 'What happens if a sensor battery dies?',
    answer:
      'The system monitors all sensor batteries and alerts you well before they run out. Most batteries last 3-5 years, and replacing them is simple.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-background" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
          className="text-center mb-12 md:mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-secondary/20 text-secondary text-sm font-medium mb-4">
            Common Questions
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Got Questions? We&apos;ve Got Answers
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Simple, honest answers to help you decide.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-3"
        >
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between text-left font-display font-semibold text-foreground py-5 px-6 hover:bg-muted/30 transition-colors"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                {faq.question}
                <ChevronDown
                  className={cn('w-5 h-5 flex-shrink-0 transition-transform', openIndex === index && 'rotate-180')}
                />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    role="region"
                    aria-labelledby={`faq-question-${index}`}
                    initial={{ opacity: 0, maxHeight: 0 }}
                    animate={{ opacity: 1, maxHeight: 300 }}
                    exit={{ opacity: 0, maxHeight: 0 }}
                    transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="text-muted-foreground pb-5 px-6 leading-relaxed border-t border-border">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
