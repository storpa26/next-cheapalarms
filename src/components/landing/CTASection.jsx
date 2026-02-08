import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight, Phone, MessageCircle } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-secondary" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'linear-gradient(135deg, transparent 25%, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.03) 50%, transparent 50%, transparent 75%, rgba(255,255,255,0.03) 75%)',
          backgroundSize: '30px 30px',
        }}
      />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
              <span className="text-3xl" aria-hidden>🐷</span>
              <span className="text-sm text-primary-foreground/90">
                Ready to protect your home?
              </span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            viewport={{ once: true }}
            className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-primary-foreground mb-6 leading-tight"
          >
            Get Your Custom Security Quote in Minutes
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            viewport={{ once: true }}
            className="text-lg text-primary-foreground/80 mb-10 max-w-xl mx-auto"
          >
            Answer a few simple questions about your home. We&apos;ll recommend exactly what you need — nothing more, nothing less.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/paradox-magellan/calculator">
              <Button
                variant="hero"
                size="xl"
                className="gap-2 group bg-primary hover:bg-primary-hover text-primary-foreground"
              >
                Start the Quote Builder
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-primary-foreground/30 text-primary-foreground hover:bg-white/10 hover:text-primary-foreground bg-transparent"
            >
              <Phone className="w-4 h-4" />
              Talk to an Installer
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            viewport={{ once: true }}
            className="mt-8 text-sm text-primary-foreground/60 flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Free quote • No obligation • Australian support
          </motion.p>
        </div>
      </div>
    </section>
  );
}
