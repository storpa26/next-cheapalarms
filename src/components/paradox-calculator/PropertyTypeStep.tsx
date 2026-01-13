"use client";

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useCalculator } from '../../contexts/CalculatorContext';
import { PropertyType } from '../../types/paradox-calculator';
import { Home, Building2, Building, Warehouse } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';

const propertyTypes: { type: PropertyType; label: string; description: string; icon: typeof Home }[] = [
  { 
    type: 'house-double', 
    label: 'House (Double-story)', 
    description: 'Two or more floors with stairs',
    icon: Home,
  },
  { 
    type: 'house-single', 
    label: 'House (Single-story)', 
    description: 'Everything on one level',
    icon: Home,
  },
  { 
    type: 'apartment', 
    label: 'Apartment / Unit', 
    description: 'No outdoor areas to protect',
    icon: Building2,
  },
  { 
    type: 'office', 
    label: 'Office / Commercial', 
    description: 'Business premises',
    icon: Warehouse,
  },
];

const PropertyTypeStep = () => {
  const router = useRouter();
  const { state, setPropertyType, setFloors, setSystemType } = useCalculator();
  const selectedType = state.propertyInfo.type;
  const [officeCeilingType, setOfficeCeilingType] = useState<'tiled' | 'suspended' | null>(null);

  const handleSelect = (type: PropertyType) => {
    setPropertyType(type);
    
    // Auto-set floors based on type
    if (type === 'house-double') {
      setFloors(2);
      setSystemType('wireless');
    } else if (type === 'house-single') {
      setFloors(1);
      setSystemType('hardwired');
      // Route to hardwired contact page
      setTimeout(() => {
        router.push('/paradox-magellan/hardwired');
      }, 100);
      return;
    } else if (type === 'apartment') {
      setFloors(1);
      setSystemType('wireless');
    } else if (type === 'office') {
      setFloors(1);
      // Don't set system type yet - wait for ceiling question
      setOfficeCeilingType(null);
    }
  };

  const handleCeilingSelect = (ceilingType: 'tiled' | 'suspended') => {
    setOfficeCeilingType(ceilingType);
    if (ceilingType === 'tiled') {
      setSystemType('hardwired');
      setTimeout(() => {
        router.push('/paradox-magellan/hardwired');
      }, 100);
    } else {
      setSystemType('wireless');
      // Continue to calculator (no navigation needed)
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Tell us about your property
        </h2>
        <p className="text-muted-foreground">
          This helps us recommend the right equipment for your space.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {propertyTypes.map((property) => {
          const isSelected = selectedType === property.type;
          const Icon = property.icon;
          
          return (
            <button
              key={property.type}
              onClick={() => handleSelect(property.type)}
              className={`
                p-6 rounded-xl border-2 text-left transition-smooth
                ${isSelected 
                  ? 'border-secondary bg-secondary/5 shadow-elevated' 
                  : 'border-border hover:border-secondary/50 hover:shadow-soft'
                }
              `}
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center mb-4
                ${isSelected ? 'bg-secondary/20' : 'bg-info-bg border border-info/30'}
              `}>
                <Icon className={`w-6 h-6 ${isSelected ? 'text-secondary' : 'text-muted-foreground'}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{property.label}</h3>
              <p className="text-sm text-muted-foreground">{property.description}</p>
            </button>
          );
        })}
      </div>

      {/* Office ceiling type question */}
      {selectedType === 'office' && (
        <Card className="bg-info-bg border-info/30 rounded-xl p-6 max-w-xl mx-auto mt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
              <Building className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-medium text-foreground">What type of ceiling does your office have?</h3>
              <p className="text-sm text-muted-foreground">This determines if hardwired or wireless is best</p>
            </div>
          </div>
          
          <RadioGroup 
            value={officeCeilingType || ''} 
            onValueChange={(v) => handleCeilingSelect(v as 'tiled' | 'suspended')}
          >
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="tiled" id="ceiling-tiled" />
                <Label htmlFor="ceiling-tiled" className="cursor-pointer">
                  Tiled ceiling (hardwired system recommended)
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="suspended" id="ceiling-suspended" />
                <Label htmlFor="ceiling-suspended" className="cursor-pointer">
                  Suspended/drop ceiling (wireless system recommended)
                </Label>
              </div>
            </div>
          </RadioGroup>
        </Card>
      )}

      {selectedType === 'apartment' && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Note: Outdoor motion sensors won't be shown for apartments.
        </p>
      )}
    </div>
  );
};

export default PropertyTypeStep;
