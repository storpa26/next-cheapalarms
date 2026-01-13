"use client";

import { useState } from 'react';
import { useCalculator } from '../../contexts/CalculatorContext';
import { MAX_ZONES } from '../../types/paradox-calculator';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Edit2, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

interface ReviewStepProps {
  onSubmit: (userInfo: UserInfo) => void;
}

const ReviewStep = ({ onSubmit }: ReviewStepProps) => {
  const { state, setStep, hasKeypad, hasSiren, hasSmokeDetector } = useCalculator();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<UserInfo>>({});

  // Group cart items by category
  const groupedItems = state.cart.reduce((acc, item) => {
    const category = item.product.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {} as Record<string, typeof state.cart>);

  const categoryLabels: Record<string, string> = {
    panel: 'Control Panel',
    keypad: 'Keypads',
    remote: 'Remotes',
    'motion-indoor': 'Indoor Motion',
    'motion-outdoor': 'Outdoor Motion',
    'door-contact': 'Door Contacts',
    siren: 'Sirens',
    smoke: 'Smoke Detectors',
    specialty: 'Specialty',
    accessory: 'Accessories',
  };

  // Validation warnings
  const warnings = [];
  if (!hasKeypad()) warnings.push('No keypad selected – you need at least one to control your system');
  if (!hasSiren()) warnings.push('No siren selected – recommended for alarm notification');
  if (!hasSmokeDetector()) warnings.push('No smoke detectors – recommended for life safety');

  const validateForm = () => {
    const newErrors: Partial<UserInfo> = {};
    if (!userInfo.name.trim()) newErrors.name = 'Name is required';
    if (!userInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userInfo.email)) newErrors.email = 'Invalid email format';
    if (!userInfo.phone.trim()) newErrors.phone = 'Phone is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(userInfo);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Review Your Quote
        </h2>
        <p className="text-muted-foreground">
          Check everything looks good, then submit for your custom quote.
        </p>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-medium text-amber-800">Missing Recommendations</h3>
          </div>
          <ul className="space-y-1 text-sm text-amber-700">
            {warnings.map((warning, i) => (
              <li key={i}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Quote summary */}
      <div className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold text-foreground">Your System</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            {state.zonesUsed}/{MAX_ZONES} zones used
          </div>
        </div>

        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {categoryLabels[category] || category}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => {
                    // Navigate to appropriate step
                    const stepMap: Record<string, number> = {
                      panel: 2, keypad: 3, remote: 4, 
                      'motion-indoor': 5, 'motion-outdoor': 6,
                      'door-contact': 7, siren: 8, smoke: 9, 
                      specialty: 10, accessory: 10,
                    };
                    setStep(stepMap[category] || 1);
                  }}
                >
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div 
                    key={item.product.id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div>
                      <span className="text-foreground">{item.product.name}</span>
                      {item.product.zones > 0 && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({item.product.zones * item.quantity} zones)
                        </span>
                      )}
                    </div>
                    <span className="font-medium text-foreground">×{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-center text-muted-foreground text-sm">
            Contact us for pricing – we'll get back to you within 24 hours
          </p>
        </div>
      </div>

      {/* User info form */}
      <div className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto">
        <h3 className="font-semibold text-foreground mb-4">Your Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={userInfo.name}
              onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={userInfo.email}
              onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={userInfo.phone}
              onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
          </div>
          <div>
            <Label htmlFor="address">Address (optional)</Label>
            <Input
              id="address"
              value={userInfo.address}
              onChange={(e) => setUserInfo({ ...userInfo, address: e.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="notes">Additional Notes (optional)</Label>
            <Textarea
              id="notes"
              value={userInfo.notes}
              onChange={(e) => setUserInfo({ ...userInfo, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          className="w-full mt-6 bg-primary hover:bg-primary/90"
          size="lg"
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Submit Quote Request
        </Button>
      </div>
    </div>
  );
};

export default ReviewStep;
