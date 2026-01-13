"use client";

import { useEffect, useState } from 'react';
import { useCalculator } from '../../contexts/CalculatorContext';
import { getProductById } from '../../data/paradox-products';
import ProductCard from './ProductCard';
import WarningModal from './WarningModal';
import { Flame } from 'lucide-react';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card } from '../../components/ui/card';

const SmokeDetectorsStep = () => {
  const { state, setFloors, addToCart, getCartItem, updateQuantity, hasSmokeDetector } = useCalculator();
  const [showWarning, setShowWarning] = useState(false);
  
  const smoke = getProductById('sd360');
  const smokeInCart = getCartItem('sd360');
  const floors = state.propertyInfo.floors;

  // Auto-add smoke detectors based on floors
  useEffect(() => {
    if (smoke) {
      if (!smokeInCart) {
        addToCart(smoke, floors);
      }
    }
  }, [smoke, floors]);

  // Update quantity when floors change
  const handleFloorsChange = (value: string) => {
    const newFloors = parseInt(value);
    setFloors(newFloors);
    if (smoke) {
      updateQuantity(smoke.id, newFloors);
    }
  };

  if (!smoke) return null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Smoke Detectors
        </h2>
        <p className="text-muted-foreground">
          Life safety comes first. We recommend one smoke detector per floor.
        </p>
      </div>

      {/* Floor selector */}
      <Card className="bg-info-bg border-info/30 rounded-xl p-6 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
            <Flame className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">How many floors does your property have?</h3>
            <p className="text-sm text-muted-foreground">We'll recommend one smoke detector per floor</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Label htmlFor="floors" className="text-sm">Number of floors:</Label>
          <Select value={floors.toString()} onValueChange={handleFloorsChange}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Auto-calculated recommendation */}
      <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center text-sm max-w-xl mx-auto">
        <span className="text-secondary font-medium">Recommendation:</span>{' '}
        <span className="text-muted-foreground">{floors} smoke detector{floors > 1 ? 's' : ''} for your {floors}-floor property</span>
      </div>

      <div className="max-w-md mx-auto">
        <ProductCard 
          product={smoke}
          warning="Smoke detection saves lives – please don't skip this"
        />
      </div>

      {/* Warning modal if user removes all - EXACT SPEC TEXT */}
      <WarningModal
        open={showWarning}
        onClose={() => setShowWarning(false)}
        onConfirm={() => setShowWarning(false)}
        title="Skip Smoke Detector?"
        description="Burglary is a risk to your things; fire is a risk to your life. For the cost of a few dollars, ensure your home watches for smoke 24/7."
        confirmLabel="Skip Anyway"
        cancelLabel="Keep Smoke Detector"
      />
    </div>
  );
};

export default SmokeDetectorsStep;
