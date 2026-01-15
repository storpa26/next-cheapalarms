"use client";

import { useEffect } from 'react';
import { useCalculator } from '../../contexts/CalculatorContext';
import { paradoxProducts, getProductById } from '../../data/paradox-products';
import ProductCard from './ProductCard';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const ControlDevicesStep = () => {
  const { state, addToCart, getCartItem, hasKeypad } = useCalculator();
  
  const panel = getProductById('mg5050');
  const k32 = getProductById('k32');
  const isInCart = getCartItem('mg5050');
  const k32InCart = getCartItem('k32');

  // Auto-add panel and K32 keypad on mount if not already in cart
  useEffect(() => {
    if (panel && !isInCart) {
      addToCart(panel, 1);
      // Also pre-select K32 keypad when panel is selected
      if (k32 && !k32InCart) {
        addToCart(k32, 1);
      }
    }
  }, [panel, isInCart, addToCart, k32, k32InCart]);

  // Filter keypads based on system type
  const keypads = paradoxProducts.filter(p => {
    if (p.category !== 'keypad') return false;
    if (state.systemType === 'hardwired' && p.id === 'k38') return false;
    return true;
  });

  const remotes = paradoxProducts.filter(p => p.category === 'remote');
  const hasAtLeastOneKeypad = hasKeypad();

  if (!panel) return null;

  return (
    <div className="space-y-12">
      {/* Control Panel Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Your Control Panel
          </h2>
          <p className="text-muted-foreground">
            Every system starts with the brain – the MG5050+ control panel.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <ProductCard 
            product={panel} 
            showQuantity={false}
            preSelected={true}
          />
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>The control panel is included in every system. It coordinates all your sensors and keypads.</p>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border max-w-2xl mx-auto" />

      {/* Keypads Section */}
      <div className="space-y-6">
        <div className="text-center">
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

        {!hasAtLeastOneKeypad && (
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

      {/* Divider */}
      <div className="h-px bg-border max-w-2xl mx-auto" />

      {/* Remotes Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Add Remotes (Optional)
          </h2>
          <p className="text-muted-foreground">
            Control your system from your pocket or keychain. Handy for quick arming on the way out.
          </p>
          <Link 
            href="/paradox-magellan/compare/remotes" 
            target="_blank"
            className="inline-flex items-center gap-1 text-secondary hover:underline text-sm mt-2"
          >
            Compare remotes <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {remotes.map((remote) => (
            <ProductCard 
              key={remote.id}
              product={remote}
              recommended={remote.id === 'rem25'}
            />
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Tip: The 2-way remote (REM25) confirms your commands worked – no more second-guessing.
        </p>
      </div>
    </div>
  );
};

export default ControlDevicesStep;
