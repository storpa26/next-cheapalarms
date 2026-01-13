"use client";

import { useEffect } from 'react';
import { useCalculator } from '../../contexts/CalculatorContext';
import { getProductById } from '../../data/paradox-products';
import ProductCard from './ProductCard';

const ControlPanelStep = () => {
  const { addToCart, getCartItem } = useCalculator();
  
  const panel = getProductById('mg5050');
  const k32 = getProductById('k32');
  const isInCart = getCartItem('mg5050');
  const k32InCart = getCartItem('k32');

  // Auto-add panel and K32 keypad on mount if not already in cart
  // R2: Pre-select K32 keypad when panel is selected
  useEffect(() => {
    if (panel && !isInCart) {
      addToCart(panel, 1);
      // Also pre-select K32 keypad when panel is selected (R2 requirement)
      if (k32 && !k32InCart) {
        addToCart(k32, 1);
      }
    }
  }, [panel, isInCart, addToCart, k32, k32InCart]);

  if (!panel) return null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
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

      <div className="text-center text-sm text-muted-foreground mt-6">
        <p>The control panel is included in every system. It coordinates all your sensors and keypads.</p>
      </div>
    </div>
  );
};

export default ControlPanelStep;
