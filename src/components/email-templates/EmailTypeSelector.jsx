import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

const emailTypes = [
  {
    id: 'quote-request',
    name: 'Quote Request',
    variations: [
      { id: 'A', name: 'New Customer, First Quote' },
      { id: 'B', name: 'Returning Customer, Has Password' },
      { id: 'C', name: 'Returning Customer, No Password' },
      { id: 'D', name: 'Customer with Multiple Estimates' },
    ]
  },
  {
    id: 'password-reset',
    name: 'Password Reset',
    variations: [
      { id: 'A', name: 'New Account Creation' },
      { id: 'B', name: 'Forgot Password' },
      { id: 'C', name: 'Admin-Initiated Reset' },
      { id: 'D', name: 'Reset with Estimate' },
    ]
  },
  {
    id: 'portal-invite',
    name: 'Portal Invite',
    variations: [
      { id: 'A', name: 'First Invite, New User' },
      { id: 'B', name: 'First Invite, Existing User' },
      { id: 'C', name: 'Resend, Has Password' },
      { id: 'D', name: 'Resend, No Password' },
      { id: 'E', name: 'Invite with Multiple Estimates' },
    ]
  },
  {
    id: 'estimate',
    name: 'Estimate Email',
    variations: [
      { id: 'A', name: 'New Estimate, New User' },
      { id: 'B', name: 'New Estimate, Returning User' },
      { id: 'C', name: 'New Estimate, No Password' },
      { id: 'D', name: 'Resend Estimate' },
    ]
  },
  {
    id: 'invoice-ready',
    name: 'Invoice Ready',
    variations: [
      { id: 'A', name: 'First Invoice' },
      { id: 'B', name: 'Returning Customer Invoice' },
      { id: 'C', name: 'Invoice Due Soon' },
      { id: 'D', name: 'Partial Payment Invoice' },
    ]
  },
  {
    id: 'acceptance',
    name: 'Acceptance Confirmation',
    variations: [
      { id: 'A', name: 'With Invoice Ready' },
      { id: 'B', name: 'Invoice Pending' },
      { id: 'C', name: 'With Booking Scheduled' },
    ]
  },
  {
    id: 'booking',
    name: 'Booking Confirmation',
    variations: [
      { id: 'A', name: 'Standard Booking' },
      { id: 'B', name: 'Booking with Payment Pending' },
      { id: 'C', name: 'Booking Rescheduled' },
    ]
  },
  {
    id: 'payment',
    name: 'Payment Confirmation',
    variations: [
      { id: 'A', name: 'Full Payment' },
      { id: 'B', name: 'Partial Payment' },
      { id: 'C', name: 'Payment with Booking' },
    ]
  },
  {
    id: 'changes-requested',
    name: 'Changes Requested',
    variations: [
      { id: 'A', name: 'Photos Needed' },
      { id: 'B', name: 'Information Needed' },
      { id: 'C', name: 'Generic Update' },
    ]
  },
  {
    id: 'review-completion',
    name: 'Review Completion',
    variations: [
      { id: 'A', name: 'No Changes' },
      { id: 'B', name: 'With Savings' },
      { id: 'C', name: 'With Increase' },
    ]
  },
  {
    id: 'revision',
    name: 'Revision Notification',
    variations: [
      { id: 'A', name: 'With Savings' },
      { id: 'B', name: 'With Increase' },
      { id: 'C', name: 'No Admin Note' },
    ]
  },
];

export function EmailTypeSelector({ selectedType, selectedVariation, onTypeChange, onVariationChange, detectedVariation }) {
  const [expandedTypes, setExpandedTypes] = useState([selectedType]);

  const toggleType = (typeId) => {
    setExpandedTypes(prev => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground mb-4">Email Types</h3>
      {emailTypes.map((type) => {
        const isExpanded = expandedTypes.includes(type.id);
        const isSelected = selectedType === type.id;
        
        return (
          <div key={type.id} className="space-y-1">
            <button
              onClick={() => {
                toggleType(type.id);
                if (!isSelected) {
                  onTypeChange(type.id);
                  onVariationChange(type.variations[0].id);
                }
              }}
              className={`w-full text-left flex items-center justify-between p-2 rounded-md text-sm transition-colors ${
                isSelected 
                  ? 'bg-primary/10 text-primary font-semibold' 
                  : 'hover:bg-muted text-foreground'
              }`}
            >
              <span>{type.name}</span>
              <ChevronRight 
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            </button>
            
            {isExpanded && (
              <div className="ml-4 space-y-1">
                {type.variations.map((variation) => {
                  const isVariationSelected = isSelected && selectedVariation === variation.id;
                  const isDetected = isSelected && detectedVariation === variation.id && detectedVariation !== selectedVariation;
                  
                  return (
                    <button
                      key={variation.id}
                      onClick={() => {
                        onTypeChange(type.id);
                        onVariationChange(variation.id);
                      }}
                      className={`w-full text-left p-2 rounded-md text-xs transition-colors ${
                        isVariationSelected
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{variation.id}.</span>
                        <span>{variation.name}</span>
                        {isDetected && (
                          <Badge variant="outline" className="ml-auto text-xs">
                            Auto
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

