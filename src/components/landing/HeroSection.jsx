import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';
import { ArrowRight, Shield, Play, Sparkles } from 'lucide-react';

export default function HeroSection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/10 to-background" />
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-primary/15 to-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 to-primary/5 rounded-full blur-3xl" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="absolute bottom-10 right-10 text-[200px] select-none pointer-events-none opacity-[0.03]" aria-hidden>
        🐺
      </div>

      <motion.div
        style={{ y, opacity, scale }}
        className="max-w-7xl mx-auto px-4 relative z-10 pt-24"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="text-left order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <span className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/90 backdrop-blur-xl border border-primary/10 shadow-lg mb-8">
                <span className="text-xl" aria-hidden>🐷</span>
                <span className="text-sm font-semibold text-foreground">
                  CheapAlarms Recommends
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary" />
                </span>
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.05 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-bold text-foreground leading-tight mb-5"
            >
              <span className="block">Professional</span>
              <span className="block mt-1 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
                Home Security
              </span>
              <span className="block text-2xl sm:text-3xl md:text-4xl mt-2 text-muted-foreground font-medium">
                Made Simple
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.1 }}
              className="text-base sm:text-lg text-muted-foreground mb-8 max-w-md leading-relaxed"
            >
              The Paradox Magellan MG5050+ system. Choose only what your home needs — we&apos;ll help you build it step by step.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Link href="/paradox-magellan/calculator">
                <Button variant="hero" size="xl" className="gap-3 group shadow-xl">
                  <Sparkles className="w-5 h-5" />
                  Start Quote Builder
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button variant="glass" size="lg" className="gap-2 border-primary/20 hover:border-primary/40">
                <Play className="w-4 h-4 text-primary" />
                <span className="text-foreground">Watch How It Works</span>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, delay: 0.2 }}
              className="mt-12 flex flex-wrap items-center gap-6 sm:gap-8"
            >
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2">
                <Shield className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium text-foreground">5 Year Warranty</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2">
                <div className="flex -space-x-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-[8px] text-primary-foreground font-bold"
                    >
                      ★
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm font-medium text-foreground">🇦🇺 Australian Owned</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="relative order-1 lg:order-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/25 via-primary/15 to-transparent blur-3xl transform scale-110" />
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden bg-white/70 backdrop-blur-2xl p-8 shadow-2xl border-2 border-white/60">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent blur-2xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-secondary/20 to-transparent blur-2xl" />
                <div className="relative z-10 w-full aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src="/landing/hero-system.png"
                    alt="Complete Paradox Magellan Security System"
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.25 }}
                  className="absolute top-10 left-10 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border border-primary/10 z-20"
                >
                  <p className="text-sm font-bold text-primary">MG5050+</p>
                  <p className="text-xs text-muted-foreground">Control Panel</p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.35 }}
                  className="absolute bottom-16 right-10 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg border border-primary/10 z-20"
                >
                  <p className="text-sm font-bold text-primary">Wireless</p>
                  <p className="text-xs text-muted-foreground">Sensors & Keypads</p>
                </motion.div>
                <div className="absolute -bottom-4 -right-4 text-5xl z-30 drop-shadow-lg" aria-hidden>
                  🐷
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Explore Products</span>
          <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-1.5 h-3 rounded-full bg-gradient-to-b from-primary to-secondary"
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
