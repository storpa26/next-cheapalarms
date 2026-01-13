"use client";

import { useCalculator } from '../../contexts/CalculatorContext';
import { paradoxProducts, getProductById } from '../../data/paradox-products';
import { PropertySize } from '../../types/paradox-calculator';
import ProductCard from './ProductCard';
import { Maximize, Info } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';

const propertySizes: { value: PropertySize; label: string; description: string }[] = [
  { value: 'small', label: 'Small', description: 'Apartment or small home' },
  { value: 'medium', label: 'Medium', description: 'Average 3-4 bedroom home' },
  { value: 'large', label: 'Large', description: 'Large home or small business' },
  { value: 'very-large', label: 'Very Large', description: 'Multi-building or large commercial' },
];

const AccessoriesStep = () => {
  const { state, setPropertySize, getCartTotal } = useCalculator();
  const { propertyInfo } = state;
  
  const repeater = getProductById('repeater');
  const specialty = getProductById('s250');
  const totalDevices = getCartTotal();

  // Show repeater recommendation for large properties or many devices
  const needsRepeater = propertyInfo.size === 'large' || 
                        propertyInfo.size === 'very-large' ||
                        totalDevices > 15;

  // Get informational-only products
  const infoProducts = paradoxProducts.filter(p => p.isInformationalOnly);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Accessories & Extras
        </h2>
        <p className="text-muted-foreground">
          Extend your system's range and add specialty protection if needed.
        </p>
      </div>

      {/* Property size question */}
      <Card className="bg-info-bg border-info/30 rounded-xl p-6 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
            <Maximize className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">How big is your property?</h3>
            <p className="text-sm text-muted-foreground">This helps us recommend range extenders</p>
          </div>
        </div>
        
        <RadioGroup 
          value={propertyInfo.size} 
          onValueChange={(v) => setPropertySize(v as PropertySize)}
        >
          <div className="grid sm:grid-cols-2 gap-3">
            {propertySizes.map((size) => (
              <div 
                key={size.value} 
                className={`
                  flex items-start space-x-3 p-3 rounded-lg border transition-smooth cursor-pointer
                  ${propertyInfo.size === size.value 
                    ? 'border-secondary bg-secondary/5' 
                    : 'border-transparent hover:bg-background'
                  }
                `}
              >
                <RadioGroupItem value={size.value} id={size.value} className="mt-1" />
                <Label htmlFor={size.value} className="cursor-pointer">
                  <span className="font-medium">{size.label}</span>
                  <span className="block text-xs text-muted-foreground">{size.description}</span>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </Card>

      {/* Repeater recommendation */}
      {needsRepeater && repeater && (
        <div className="max-w-xl mx-auto">
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center text-sm mb-4">
            <span className="text-secondary font-medium">Recommendation:</span>{' '}
            <span className="text-muted-foreground">
              For your {propertyInfo.size} property{totalDevices > 15 ? ` with ${totalDevices} devices` : ''}, 
              a repeater will ensure reliable communication across all sensors.
            </span>
          </div>
          <ProductCard 
            product={repeater}
            recommended={true}
          />
        </div>
      )}

      {/* Specialty sensor */}
      {specialty && (
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-medium text-foreground mb-4 text-center">Specialty Protection</h3>
          <ProductCard product={specialty} />
        </div>
      )}

      {/* Informational products */}
      <Card className="bg-info-bg border-info/30 rounded-xl p-6 max-w-xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-medium text-foreground">Advanced Options (Info Only)</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          These are available for complex installations but require professional consultation:
        </p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {infoProducts.map((product) => (
            <li key={product.id} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2" />
              <span><strong>{product.name}</strong> – {product.description}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default AccessoriesStep;
