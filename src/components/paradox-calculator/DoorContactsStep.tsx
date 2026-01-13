"use client";

import { useCalculator } from '../../contexts/CalculatorContext';
import { paradoxProducts } from '../../data/paradox-products';
import ProductCard from './ProductCard';
import Link from 'next/link';
import { ExternalLink, DoorOpen } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';

const DoorContactsStep = () => {
  const { state, setHasGarageOrMetalDoors } = useCalculator();
  const { propertyInfo } = state;

  const doorContacts = paradoxProducts.filter(p => p.category === 'door-contact');

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Door & Window Contacts
        </h2>
        <p className="text-muted-foreground">
          Know instantly when any door or window opens. Your first line of defense.
        </p>
        <Link 
          href="/paradox-magellan/compare/door-contacts" 
          target="_blank"
          className="inline-flex items-center gap-1 text-secondary hover:underline text-sm mt-2"
        >
          Compare door contacts <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Garage/metal door question */}
      <Card className="bg-info-bg border-info/30 rounded-xl p-6 max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
            <DoorOpen className="w-5 h-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Got a garage or metal doors?</h3>
            <p className="text-sm text-muted-foreground">Metal can reduce wireless range</p>
          </div>
        </div>
        
        <RadioGroup 
          value={propertyInfo.hasGarageOrMetalDoors ? 'yes' : 'no'} 
          onValueChange={(v) => setHasGarageOrMetalDoors(v === 'yes')}
        >
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="yes" id="garage-yes" />
              <Label htmlFor="garage-yes" className="cursor-pointer">Yes, I have garage or metal doors</Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="no" id="garage-no" />
              <Label htmlFor="garage-no" className="cursor-pointer">No, just standard doors and windows</Label>
            </div>
          </div>
        </RadioGroup>
      </Card>

      {/* Recommendation based on answer */}
      {propertyInfo.hasGarageOrMetalDoors && (
        <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4 text-center text-sm max-w-xl mx-auto">
          <span className="text-secondary font-medium">Recommendation:</span>{' '}
          <span className="text-muted-foreground">Use DCTXP2 (70m range) for garage and metal doors to ensure reliable connection.</span>
        </div>
      )}

      {/* Door contact cards */}
      <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {doorContacts.map((contact) => (
          <ProductCard 
            key={contact.id}
            product={contact}
            recommended={propertyInfo.hasGarageOrMetalDoors && contact.id === 'dctxp2'}
          />
        ))}
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Add one contact for each door and window you want to monitor.
      </p>
    </div>
  );
};

export default DoorContactsStep;
