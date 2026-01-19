"use client";

import { useCalculator } from '../../contexts/CalculatorContext';
import { Button } from '../../components/ui/button';
import { ShoppingCart, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { MAX_ZONES } from '../../types/paradox-calculator';
import { motion, AnimatePresence } from 'framer-motion';

interface QuoteSummaryProps {
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  validationError?: string;
}

const QuoteSummary = ({ 
  onNext, 
  onBack, 
  nextLabel = 'Continue',
  nextDisabled = false,
  showBack = true,
  validationError,
}: QuoteSummaryProps) => {
  const { state, getCartTotal } = useCalculator();
  const totalItems = getCartTotal();
  const zonesUsed = state.zonesUsed;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border shadow-2xl z-40"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Summary stats */}
          <div className="flex items-center gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <ShoppingCart className="w-5 h-5 text-muted-foreground" />
              </motion.div>
              <span className="text-foreground font-medium">{totalItems} items</span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <div 
                className={`
                  h-2 w-24 bg-info-bg/50 border border-info/20 rounded-full overflow-hidden relative
                `}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(zonesUsed / MAX_ZONES) * 100}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={`
                    h-full
                    ${zonesUsed >= MAX_ZONES ? 'bg-destructive' : 'bg-secondary'}
                  `}
                />
                {zonesUsed >= MAX_ZONES && (
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute inset-0 bg-white/20"
                  />
                )}
              </div>
              <motion.span
                key={zonesUsed}
                initial={{ scale: 1.2, color: "hsl(var(--color-secondary))" }}
                animate={{ scale: 1 }}
                className={`text-sm ${zonesUsed >= MAX_ZONES ? 'text-destructive font-medium' : 'text-muted-foreground'}`}
              >
                {zonesUsed}/{MAX_ZONES} zones
              </motion.span>
            </motion.div>
          </div>

          {/* Validation error */}
          <AnimatePresence>
            {validationError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-2 text-destructive text-sm"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <AlertCircle className="w-4 h-4" />
                </motion.div>
                {validationError}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center gap-3">
            <AnimatePresence>
              {showBack && onBack && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      onClick={onBack}
                      variant="outline"
                      size="default"
                      className="gap-1 border-2 hover:border-primary/50 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            {onNext && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={onNext}
                  disabled={nextDisabled}
                  className="bg-primary hover:bg-primary/90 gap-1 shadow-lg hover:shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
                >
                  {nextLabel}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuoteSummary;
