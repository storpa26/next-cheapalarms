"use client";

import { useCalculator } from '../../contexts/CalculatorContext';
import { paradoxProducts } from '../../data/paradox-products';
import ProductCard from './ProductCard';
import { TreeDeciduous } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';

const OutdoorMotionStep = () => {
  const { state, setOutdoorCoverage } = useCalculator();
  const { outdoorCoverage, propertyInfo } = state;

  // Skip entirely for apartments
  if (propertyInfo.type === 'apartment') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Outdoor Motion Detection
          </h2>
          <Card className="bg-info-bg border-info/30 rounded-xl p-8 max-w-md mx-auto mt-8">
            <TreeDeciduous className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Outdoor sensors aren't typically needed for apartments. 
              We've skipped this step for you.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const outdoorDetectors = paradoxProducts.filter(p => p.category === 'motion-outdoor');

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Outdoor Motion Detection
        </h2>
        <p className="text-muted-foreground">
          Catch intruders outside before they reach your doors and windows.
        </p>
      </div>

      {/* Outdoor question */}
      <Card className="bg-info-bg border-info/30 rounded-xl p-6 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
            <TreeDeciduous className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Want outdoor protection?</h3>
            <p className="text-sm text-muted-foreground">Monitor your yard, driveway, or perimeter</p>
          </div>
        </div>
        
        <RadioGroup 
          value={outdoorCoverage.wantsOutdoor ? 'yes' : 'no'} 
          onValueChange={(v) => setOutdoorCoverage({ wantsOutdoor: v === 'yes' })}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="yes" id="outdoor-yes" />
              <Label htmlFor="outdoor-yes" className="cursor-pointer">Yes, protect my outdoor areas</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="no" id="outdoor-no" />
              <Label htmlFor="outdoor-no" className="cursor-pointer">No, indoor protection is enough</Label>
            </div>
          </div>
        </RadioGroup>
      </Card>

      {/* Show outdoor detectors if wanted */}
      {outdoorCoverage.wantsOutdoor && (
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
          {outdoorDetectors.map((detector) => (
            <ProductCard 
              key={detector.id}
              product={detector}
              recommended={detector.id === 'pmd85'}
            />
          ))}
        </div>
      )}

      {!outdoorCoverage.wantsOutdoor && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          No problem – you can always add outdoor sensors later if you change your mind.
        </p>
      )}
    </div>
  );
};

export default OutdoorMotionStep;
