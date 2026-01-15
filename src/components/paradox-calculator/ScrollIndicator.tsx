"use client";

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ScrollIndicator = () => {
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      
      // Show indicator if content is scrollable and user hasn't scrolled much
      const hasScroll = documentHeight > windowHeight + 100; // Add buffer
      const isScrolled = scrollTop > 100;
      
      setShowIndicator(hasScroll && !isScrolled);
    };

    // Check on mount and after a short delay (to account for content loading)
    checkScroll();
    const timeout = setTimeout(checkScroll, 500);

    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  return (
    <>
      {/* Gradient fade overlay at bottom */}
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/90 to-transparent pointer-events-none z-10"
          />
        )}
      </AnimatePresence>

      {/* Scroll indicator badge */}
      <AnimatePresence>
        {showIndicator && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none"
          >
            <div className="bg-card border-2 border-secondary/50 rounded-full px-5 py-3 shadow-xl shadow-secondary/20 flex items-center gap-3 backdrop-blur-sm">
              <span className="text-sm font-medium text-foreground">Scroll for more</span>
              <motion.div
                animate={{ 
                  y: [0, 6, 0],
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <ChevronDown className="w-5 h-5 text-secondary" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ScrollIndicator;
