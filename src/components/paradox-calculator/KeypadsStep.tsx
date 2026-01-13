"use client";

import { useCalculator } from '../../contexts/CalculatorContext';
import { paradoxProducts } from '../../data/paradox-products';
import ProductCard from './ProductCard';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const KeypadsStep = () => {
  const { state, hasKeypad } = useCalculator();
  
  // Filter keypads based on system type
  // K38 is wireless only, others work with both
  const keypads = paradoxProducts.filter(p => {
    if (p.category !== 'keypad') return false;
    if (state.systemType === 'hardwired' && p.id === 'k38') return false;
    return true;
  });

  const hasAtLeastOne = hasKeypad();

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Choose Your Keypads
        </h2>
        <p className="text-muted-foreground">
          You'll need at least one keypad to control your system. Most people have one by the main entry.
        </p>
        <Link 
          href="/paradox-magellan/compare/keypads" 
          target="_blank"
          className="inline-flex items-center gap-1 text-secondary hover:underline text-sm mt-2"
        >
          Compare all keypads <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {!hasAtLeastOne && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center text-amber-800 text-sm max-w-xl mx-auto">
          ⚠️ You need at least one keypad to arm and disarm your system
        </div>
      )}

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
      >
        {keypads.map((keypad, index) => (
          <motion.div
            key={keypad.id}
            variants={{
              hidden: { opacity: 0, y: 20, scale: 0.9 },
              visible: { 
                opacity: 1, 
                y: 0, 
                scale: 1,
                transition: {
                  duration: 0.3,
                  ease: "easeOut",
                },
              },
            }}
          >
            <ProductCard 
              product={keypad}
              recommended={keypad.id === 'k32'}
              warning={keypad.id === 'k38' ? 'Note: K38 requires a 6V DC adapter or 2 AA batteries (battery life: 1-2 years)' : undefined}
            />
          </motion.div>
        ))}
      </motion.div>

      {state.systemType === 'hardwired' && (
        <p className="text-center text-sm text-muted-foreground">
          Note: K38 wireless keypad is not available for hardwired systems.
        </p>
      )}
    </div>
  );
};

export default KeypadsStep;
