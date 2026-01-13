"use client";

import { useEffect, useState } from 'react';
import { useCalculator } from '../../contexts/CalculatorContext';
import { getProductById } from '../../data/paradox-products';
import ProductCard from './ProductCard';
import RepeaterWarning from './RepeaterWarning';
import WarningModal from './WarningModal';

const SirensStep = () => {
  const { addToCart, getCartItem, hasSiren, state } = useCalculator();
  const [showWarning, setShowWarning] = useState(false);
  
  const siren = getProductById('sr230');
  const sirenInCart = getCartItem('sr230');

  // Auto-add siren on mount if not already in cart
  useEffect(() => {
    if (siren && !sirenInCart) {
      addToCart(siren, 1);
    }
  }, [siren, sirenInCart, addToCart]);

  // Check if repeater is likely needed (large property or many devices)
  const needsRepeater = state.propertyInfo.size === 'large' || 
                        state.propertyInfo.size === 'very-large' ||
                        state.cart.reduce((sum, item) => sum + item.quantity, 0) > 15;

  if (!siren) return null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Sirens
        </h2>
        <p className="text-muted-foreground">
          When the alarm triggers, you want everyone to know. Loud and clear.
        </p>
      </div>

      {/* Repeater warning - show if large property */}
      {needsRepeater && (
        <div className="max-w-2xl mx-auto">
          <RepeaterWarning />
        </div>
      )}

      <div className="max-w-md mx-auto">
        <ProductCard 
          product={siren}
          warning="At least one siren is required for your system"
        />
      </div>

      <div className="text-center text-sm text-muted-foreground mt-6">
        <p>Every security system needs at least one siren to deter intruders and alert neighbors.</p>
      </div>

      {/* Warning modal if user removes siren - EXACT SPEC TEXT */}
      <WarningModal
        open={showWarning}
        onClose={() => setShowWarning(false)}
        onConfirm={() => setShowWarning(false)}
        title="Skip Siren?"
        description="A silent alarm is just a notification. Without a siren, there is nothing to stop an intruder from continuing their search. A siren is your active defense."
        confirmLabel="Skip Anyway"
        cancelLabel="Keep Siren"
      />
    </div>
  );
};

export default SirensStep;
