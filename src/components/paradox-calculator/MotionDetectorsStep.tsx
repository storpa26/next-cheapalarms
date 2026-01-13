"use client";

import { useCalculator } from '../../contexts/CalculatorContext';
import { paradoxProducts } from '../../data/paradox-products';
import ProductCard from './ProductCard';
import Link from 'next/link';
import { ExternalLink, PawPrint } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';

const petWeightOptions = [
  { value: 'none', label: 'No pets' },
  { value: 'small', label: 'Under 18kg' },
  { value: 'large', label: 'Over 18kg' },
];

const MotionDetectorsStep = () => {
  const { state, setPetInfo } = useCalculator();
  const { petInfo } = state;

  const handlePetChange = (value: string) => {
    if (value === 'none') {
      setPetInfo({ hasPets: false });
    } else if (value === 'small') {
      setPetInfo({ hasPets: true, largestWeight: 18 });
    } else {
      setPetInfo({ hasPets: true, largestWeight: 40 });
    }
  };

  const currentValue = !petInfo.hasPets 
    ? 'none' 
    : (petInfo.largestWeight && petInfo.largestWeight > 18 ? 'large' : 'small');

  // Filter indoor motion detectors based on pet weight
  // If pets > 18kg, hide PMD2P
  const motionDetectors = paradoxProducts.filter(p => {
    if (p.category !== 'motion-indoor') return false;
    if (petInfo.hasPets && petInfo.largestWeight && petInfo.largestWeight > 18) {
      if (p.id === 'pmd2p') return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Indoor Motion Detection
        </h2>
        <p className="text-muted-foreground">
          Motion sensors catch movement inside your property. Let's make sure we pick the right ones.
        </p>
        <Link 
          href="/paradox-magellan/compare/motion" 
          target="_blank"
          className="inline-flex items-center gap-1 text-secondary hover:underline text-sm mt-2"
        >
          Compare all motion sensors <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Pet question */}
      <Card className="bg-info-bg border-info/30 rounded-xl p-6 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Do you have pets?</h3>
            <p className="text-sm text-muted-foreground">What's your largest pet's weight?</p>
          </div>
        </div>
        
        <RadioGroup value={currentValue} onValueChange={handlePetChange}>
          <div className="space-y-3">
            {petWeightOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="cursor-pointer">{option.label}</Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </Card>

      {/* Show recommendation message for large pets */}
      {petInfo.hasPets && petInfo.largestWeight && petInfo.largestWeight > 18 && (
        <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center text-secondary text-sm max-w-xl mx-auto">
          We've hidden standard sensors and are showing pet-friendly options that ignore pets up to 40kg.
        </div>
      )}

      {/* Motion detector cards */}
      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {motionDetectors.map((detector) => (
          <ProductCard 
            key={detector.id}
            product={detector}
            recommended={petInfo.hasPets && detector.id === 'pmd75'}
          />
        ))}
      </div>
    </div>
  );
};

export default MotionDetectorsStep;
