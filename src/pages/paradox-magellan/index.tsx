"use client";

import Link from 'next/link';
import { Button } from '../../components/ui/button';
import { Shield, Wifi, Cable } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const ParadoxMagellan = () => {
  const [heroRef, heroInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [cardsRef, cardsInView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-50" />
        
        <motion.div
          ref={heroRef}
          initial={{ opacity: 0, y: 30 }}
          animate={heroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="container mx-auto max-w-4xl text-center relative z-10"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text"
          >
            Paradox Magellan 5050+ Security System
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl text-muted-foreground mb-8"
          >
            Professional-grade security with 32-zone capacity, pet-friendly sensors, and Canadian-made reliability.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg"
                className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-lg hover:shadow-xl shadow-primary/20 transition-all"
                asChild
              >
                <Link href="/paradox-magellan/calculator">
                  Get Your Quote Now
                </Link>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* System Type Selection */}
      <section className="py-16 px-4 bg-muted/50">
        <motion.div
          ref={cardsRef}
          initial={{ opacity: 0 }}
          animate={cardsInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="container mx-auto max-w-4xl"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={cardsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-3xl font-bold text-foreground text-center mb-8"
          >
            Choose Your System Type
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Wireless */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={cardsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative bg-card/80 backdrop-blur-sm rounded-xl p-8 border-2 border-border hover:border-secondary/50 transition-all overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-secondary/10 rounded-xl flex items-center justify-center mb-6"
                >
                  <Wifi className="w-8 h-8 text-secondary" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Wireless System</h3>
                <p className="text-muted-foreground mb-6">
                  Perfect for most homes and businesses. Easy installation, flexible sensor placement, and no wires to run.
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    className="w-full bg-secondary hover:bg-secondary/90 shadow-md hover:shadow-lg transition-all"
                    asChild
                  >
                    <Link href="/paradox-magellan/calculator">
                      Get Wireless Quote
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Hardwired */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={cardsInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.5 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative bg-card/80 backdrop-blur-sm rounded-xl p-8 border-2 border-border hover:border-wolf/50 transition-all overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-wolf/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-wolf/10 rounded-xl flex items-center justify-center mb-6"
                >
                  <Cable className="w-8 h-8 text-wolf" />
                </motion.div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Hardwired System</h3>
                <p className="text-muted-foreground mb-6">
                  For new builds or major renovations. Requires professional installation and site visit for accurate quoting.
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    className="w-full border-2 hover:border-wolf/50 hover:bg-wolf/5 transition-all"
                    variant="outline"
                    asChild
                  >
                    <Link href="/paradox-magellan/hardwired">
                      Contact for Hardwired Quote
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default ParadoxMagellan;
